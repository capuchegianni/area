import type { PageServerLoad } from "./$types";
import { env } from "$env/dynamic/private";
import { error, redirect } from "@sveltejs/kit";
import api from "@common/api/api";
import { isOauthService } from "@common/api/types/OAuthService";

export const load: PageServerLoad = async ({ url: { origin, searchParams }, params: { service }, locals: { client }, cookies }) => {
    let accessToken: string | null | undefined = searchParams.get("access_token");
    const isMobile = !!accessToken;

    accessToken ||= client?.accessToken;
    // Redirect to the frontend instead of the requester if it's the mobile (origin is the URL of the requester, so the mobile in this case).
    // ORIGIN is not meant to be set in dev mode, only in prod with the root Docker compose.
    if (isMobile && env.ORIGIN)
        origin = env.ORIGIN;

    if (!accessToken)
        return error(401, "Unauthorized");

    if (!isOauthService(service))
        return error(400, "Bad Request");

    const scope = searchParams.get("scope");

    if (!scope)
        return error(400, "Bad Request");

    const response = await api.oauth.oauth(env.API_URL, service, {
        redirect_uri: `${origin}/oauth/${service}/callback`,
        scope
    }, accessToken);

    if (!response.success)
        return error(401, "Unauthorized");

    if (isMobile) {
        const redirectUri = searchParams.get("redirect_uri");

        cookies.set("accessToken", accessToken, { path: "/", maxAge: 300, secure: false });
        if (redirectUri)
            cookies.set("redirectUri", redirectUri, { path: "/", maxAge: 300, secure: false });
    }

    return redirect(303, response.body.redirect_uri);
};
