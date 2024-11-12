import type { PageServerLoad, Actions } from "./$types";
import api from "@common/api/api";
import { env } from "$env/dynamic/private";
import { error, fail, redirect } from "@sveltejs/kit";
import { isOauthService, OAUTH_SERVICES } from "@common/api/types/OAuthService";
import type { TranslationFunctions } from "$i18n/i18n-types";
import { reactionFields } from "@common/area/reactions";

const METADATA_PREFIX = "metadata-";

export const load: PageServerLoad = async ({ url: { searchParams }, locals: { locale, services, client } }) => {
    if (!client)
        return error(401, "Unauthorized");

    const areas = await api.area.getAll(env.API_URL, client.accessToken);
    if (!areas.success)
        return error(401, "Unauthorized");

    const oauthCredentials: Record<string, string> = {};
    for (const service of OAUTH_SERVICES) {
        const credentials = await api.oauth.credentials(env.API_URL, service, client.accessToken);
        if (credentials.success)
            oauthCredentials[service] = credentials.body.find(credential => credential.id !== undefined)?.id.toString() || "";
    }

    const oauthResult = {
        success: searchParams.get("oauth_success"),
        service: searchParams.get("service"),
        id: searchParams.get("id")
    };

    return { locale, clientName: `${client.firstname} ${client.lastname}`, services, areas: areas.body, oauthCredentials, oauthResult };
};

function badRequestFail(LL: TranslationFunctions, field: string) {
    return fail(400, { errorMessage: LL.error.incorrectField({ field }) });
}

function oauthBadRequestFail(LL: TranslationFunctions) {
    return fail(400, { oauthErrorMessage: LL.error.api.unknown() });
}

function getOrThrow(data: FormData, key: string) {
    const value = data.get(key);

    if (!value || typeof value !== "string")
        throw new Error(key);
    return value;
}

function numberOrThrow(data: FormData, key: string) {
    const value = Number(getOrThrow(data, key));

    if (isNaN(value) || value < 0)
        throw new Error(key);
    return value;
}

function getPayload(data: FormData) {
    const payload = {
        name: getOrThrow(data, "name"),
        description: getOrThrow(data, "description"),
        action_id: getOrThrow(data, "action-id"),
        action_metadata: {} as Record<string, string>,
        action_oauth_id: numberOrThrow(data, "action-oauth-id"),
        reaction_id: getOrThrow(data, "reaction-id"),
        reaction_body: {} as Record<string, string>,
        reaction_oauth_id: numberOrThrow(data, "reaction-oauth-id"),
        delay: numberOrThrow(data, "delay")
    };

    data.forEach((value, key) => {
        if (!key.startsWith(METADATA_PREFIX))
            return;
        key = key.slice(METADATA_PREFIX.length);
        if (!value || typeof value !== "string")
            throw new Error(key);
        payload.action_metadata[key] = value;
    });
    reactionFields(payload.reaction_id).forEach(({ name, optional }) => {
        if (optional) {
            const value = data.get(name);

            if (!value)
                return;
            if (typeof value !== "string")
                throw new Error(name);
            payload.reaction_body[name] = value;
            return;
        }
        payload.reaction_body[name] = getOrThrow(data, name);
    });
    return payload;
}

export const actions: Actions = {
    /**
     * Creates a new AREA.
     */
    area: async ({ request, locals: { client, LL } }) => {
        if (!client)
            return error(401, "Unauthorized");

        const data = await request.formData();

        try {
            const response = await api.area.createArea(env.API_URL, client.accessToken, getPayload(data));
            if (!response.success)
                return error(401, "Unauthorized");

            if (data.get("enabled") === "on") {
                const patchResponse = await api.area.patchById(env.API_URL, client.accessToken, response.body.id, {
                    status: "RUNNING"
                });
                if (!patchResponse.success)
                    return error(401, "Unauthorized");
            }
        } catch (error) {
            if (error instanceof Error)
                return badRequestFail(LL, error.message);
            return badRequestFail(LL, "unknown");
        }
        return redirect(303, "/dashboard");
    },

    /**
     * Edits the status of an AREA ("RUNNING" or "STOPPED").
     */
    status: async ({ request, locals: { client, LL } }) => {
        if (!client)
            return error(401, "Unauthorized");

        const data = await request.formData();
        const id = data.get("id");

        if (!id || typeof id !== "string")
            return fail(400, { errorMessage: LL.error.api.unknown() });

        const response = await api.area.patchById(env.API_URL, client.accessToken, id, {
            status: data.get("enabled") === "on" ? "RUNNING" : "STOPPED"
        });
        if (!response.success)
            return error(401, "Unauthorized");
    },

    /**
     * Redirects to the OAuth connection page for the specified service.
     */
    oauth: async ({ request, locals: { client, LL } }) => {
        if (!client)
            return error(401, "Unauthorized");

        const data = await request.formData();
        const service = data.get("service");
        const scope = data.get("scope");

        if (!service || !scope)
            return oauthBadRequestFail(LL);
        if (typeof service !== "string" || typeof scope !== "string")
            return oauthBadRequestFail(LL);
        if (!isOauthService(service))
            return oauthBadRequestFail(LL);

        return redirect(303, `/oauth/${service}?scope=${scope}`);
    }
};
