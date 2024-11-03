import type { PageServerLoad, Actions } from "./$types";
import api from "@common/api/api";
import { env } from "$env/dynamic/private";
import { error, fail, redirect } from "@sveltejs/kit";
import { isOauthService, OAUTH_SERVICES } from "area-common/src/api/types/OAuthService";
import type { TranslationFunctions } from "$i18n/i18n-types";

export const load: PageServerLoad = async ({ parent, url: { searchParams } }) => {
    const { locale, services, client } = await parent();

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

function badRequestFail(status: number, LL: TranslationFunctions) {
    return fail(
        status,
        { oauthErrorMessage: LL.error.api.unknown() }
    );
}

export const actions: Actions = {
    oauth: async ({ request, locals: { client, LL } }) => {
        if (!client)
            return error(401, "Unauthorized");

        const data = await request.formData();
        const service = data.get("service");
        const scope = data.get("scope");

        if (!service || !scope)
            return badRequestFail(400, LL);
        if (typeof service !== "string" || typeof scope !== "string")
            return badRequestFail(400, LL);
        if (!isOauthService(service))
            return badRequestFail(400, LL);

        return redirect(303, `/oauth/${service}?scope=${scope}`);
    }
};
