import type { RequestResponse } from "../api";
import type { OAuthService } from "../types/OAuthService";

type OAuthCredentialsResponse = {
    id: number
    access_token: string
    refresh_token: string
    expires_at: Date
    scope: string
}

export default async function credentials(apiUrl: string, service: OAuthService, accessToken: string): Promise<RequestResponse<OAuthCredentialsResponse[], 200 | 401 | 404>> {
    try {
        const response = await fetch(`${apiUrl}/oauth/${service}/credentials`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
            credentials: "include"
        });

        switch (response.status) {
        case 200:
            return { status: 200, success: true, body: await response.json() };
        case 401:
            return { status: 401, success: false }; // This route is protected. The client must supply a Bearer token.
        case 404:
            return { status: 404, success: false }; // The specified provider is not supported.
        default:
            console.error(response);
            return { status: 500, success: false };
        }
    } catch (error) {
        console.error(error);
        return { status: 500, success: false };
    }
}
