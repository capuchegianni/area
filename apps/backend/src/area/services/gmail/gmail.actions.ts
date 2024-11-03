import axios, { AxiosRequestConfig } from "axios";
import {
    ActionDescription,
    ActionResource
} from "../interfaces/service.interface";
import { ForbiddenException } from "@nestjs/common";
import { GmailMailsResponse } from "./interfaces/gmail-mail";

async function onNewMail(
    accessToken: string,
    _metadata: object // eslint-disable-line
): Promise<ActionResource> {
    const url = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
    const config: AxiosRequestConfig = {
        params: {
            maxResults: 1
        },
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };
    return new Promise((resolve, reject) => {
        axios
            .get<GmailMailsResponse>(url, config)
            .then(({ data }) => {
                if (1 !== data.messages.length) return null;
                return resolve({
                    data: data.messages[0],
                    cacheValue: data.messages[0].id
                });
            })
            .catch((e) => {
                if (403 === e.status)
                    return reject(
                        new ForbiddenException("Access token expired.")
                    );
                return reject(e);
            });
    });
}

export const GMAIL_ACTIONS: { [name: string]: ActionDescription } = {
    on_new_mail: {
        description: "Triggered when a new mail is received",
        metadata: {},
        oauthProvider: "google",
        oauthScopes: ["https://www.googleapis.com/auth/gmail.readonly"],
        trigger: onNewMail
    }
};
