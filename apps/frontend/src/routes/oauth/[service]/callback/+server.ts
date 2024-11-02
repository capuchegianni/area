import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { error, redirect } from "@sveltejs/kit";
import api from "@common/api/api";
import { isOauthService } from "area-common/src/api/types/OAuthService";

export const GET: RequestHandler = async ({ url: { searchParams }, params: { service }, locals: { client } }) => {
    if (!client)
        return error(401, "Unauthorized");

    if (!isOauthService(service))
        return error(400, "Bad Request");

    const response = await api.oauth.callback(env.API_URL, service, {
        code: searchParams.get("code") || "",
        state: searchParams.get("state") || ""
    }, client.accessToken);

    return redirect(303, `/dashboard?oauth_success=${response.success}&service=${service}`);
};
