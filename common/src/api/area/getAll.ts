import type { Area } from "../../types/area/interfaces/area.interface";
import type { RequestResponse } from "../api";

export default async function getAll(apiUrl: string, accessToken: string): Promise<RequestResponse<Area[], 200 | 401>> {
    try {
        const response = await fetch(`${apiUrl}/area`, {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        switch (response.status) {
        case 200: // TODO: Fix this response status / description with @Ximaz
            return { status: 200, success: true, body: await response.json() };
        case 401:
            return { status: 401, success: false }; // Either the JWT is expired or invalid or the user has been deleted.
        default:
            return { status: 500, success: false };
        }
    } catch {
        return { status: 500, success: false };
    }
}
