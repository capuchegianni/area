import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { error, redirect } from "@sveltejs/kit";
import api from "@common/api/api";
import { isOauthService } from "area-common/src/api/types/OAuthService";

export const GET: RequestHandler = async ({ url: { searchParams }, params: { service }, locals: { client }, cookies }) => {
    const accessToken = client?.accessToken || cookies.get("accessToken");

    if (!accessToken)
        return error(401, "Unauthorized");

    if (!isOauthService(service))
        return error(400, "Bad Request");

    const response = await api.oauth.callback(env.API_URL, service, {
        code: searchParams.get("code") || "",
        state: searchParams.get("state") || ""
    }, accessToken);

    const href = cookies.get("redirectUri") || "/dashboard";

    if (response.success)
        return redirect(303, `${href}?oauth_success=true&service=${service}&id=${response.body.id}`);
    return redirect(303, `${href}?oauth_success=false&service=${service}`);
};
