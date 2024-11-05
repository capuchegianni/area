import type { PageServerLoad, Actions } from "./$types";
import api from "@common/api/api";
import { env } from "$env/dynamic/private";
import { error, fail, redirect } from "@sveltejs/kit";
import { isOauthService, OAUTH_SERVICES } from "area-common/src/api/types/OAuthService";
import type { TranslationFunctions } from "$i18n/i18n-types";
import { reactionFields } from "area-common/src/area/reactions";

export const load: PageServerLoad = async ({ url: { searchParams }, locals: { locale, services, client } }) => {
    if (!client)
        return error(401, "Unauthorized");

    const areas = await api.area.getAll(env.API_URL, client.accessToken);
    if (areas.status === 401)
        return redirect(302, `/${locale}/auth/sign-in`);
    if (!areas.success)
        return error(500, "Internal Server Error");

    const oauthCredentials: Record<string, string[]> = {};
    for (const service of OAUTH_SERVICES) {
        const credentials = await api.oauth.credentials(env.API_URL, service, client.accessToken);
        if (credentials.success)
            oauthCredentials[service] = credentials.body.filter(credential => credential.id !== undefined).map(credential => credential.id.toString());
    }

    const oauthResult = {
        success: searchParams.get("oauth_success"),
        service: searchParams.get("service"),
        id: searchParams.get("id")
    };

    return { locale, services, areas: areas.body, oauthCredentials, oauthResult };
};

function badRequestFail(LL: TranslationFunctions, field: string) {
    return fail(400, { errorMessage: LL.error.api.incorrectField({ field }) });
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

function getPayload(data: FormData) {
    const payload = {
        name: getOrThrow(data, "name"),
        description: getOrThrow(data, "description"),
        action_id: getOrThrow(data, "action-id"),
        action_metadata: {} as Record<string, string>, // TODO
        action_oauth_id: Number(getOrThrow(data, "action-oauth-id")),
        reaction_id: getOrThrow(data, "reaction-id"),
        reaction_body: {} as Record<string, string>,
        reaction_oauth_id: Number(getOrThrow(data, "reaction-oauth-id")),
        delay: Number(getOrThrow(data, "delay"))
    };

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
    if (isNaN(payload.action_oauth_id))
        throw new Error("Action OAuth ID");
    if (isNaN(payload.reaction_oauth_id))
        throw new Error("REAction OAuth ID");
    if (isNaN(payload.delay))
        throw new Error("delay");
    return payload;
}

export const actions: Actions = {
    area: async ({ request, locals: { client, LL } }) => {
        if (!client)
            return error(401, "Unauthorized");

        const data = await request.formData();

        try {
            const response = await api.area.createArea(env.API_URL, client.accessToken, getPayload(data));

            if (!response.success)
                return error(401, "Unauthorized");

            if (data.get("enabled") === "on")
                await api.area.patchById(env.API_URL, client.accessToken, response.body.id, {
                    status: "RUNNING"
                });
            // TODO: display area with status (depending on the responses)
        } catch (error) {
            if (error instanceof Error)
                return badRequestFail(LL, error.message);
            return badRequestFail(LL, "unknown");
        }
    },

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
