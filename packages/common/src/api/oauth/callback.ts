import type { RequestResponse } from "../api";
import type { OAuthService } from "../types/OAuthService";

type OAuthCallbackPayload = {
    code: string;
    state: string;
};

export default async function callback(apiUrl: string, service: OAuthService, payload: OAuthCallbackPayload, accessToken: string): Promise<RequestResponse<{ id: number; }, 200 | 400 | 403 | 404>> {
    try {
        const response = await fetch(`${apiUrl}/oauth/${service}/callback?code=${payload.code}&state=${payload.state}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include",
        });

        switch (response.status) {
        case 200:
            return { status: 200, success: true, body: await response.json() };
        case 400:
            return { status: 400, success: false }; // The 'code' is invalid.
        case 403:
            return { status: 403, success: false }; // The 'state' attribute stored in the user's session is either invalid or does not match the one returned by the OAuth provider.
        case 404:
            return { status: 404, success: false }; // TheThe specified provider is not supported.
        default:
            console.error(response);
            return { status: 500, success: false };
        }
    } catch (error) {
        console.error(error);
        return { status: 500, success: false };
    }
}
