import axios from "axios";
import { ReactionDescription } from "../interfaces/service.interface";
import { AreaGmailMail } from "./interfaces/gmail-mail";
import { transformAreaGmailMailToRaw } from "./gmail.transformers";

async function sendMail(
    accessToken: string,
    mail: AreaGmailMail
): Promise<void> {
    const rawMail = transformAreaGmailMailToRaw(mail);
    await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/${rawMail["userId"]}/messages/send`,
        rawMail,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        }
    );
}

export const GMAIL_REACTIONS: { [name: string]: ReactionDescription } = {
    send_mail: {
        description: "Sends an email",
        oauthProvider: "google",
        produce: sendMail,
        oauthScopes: ["https://www.googleapis.com/auth/gmail.send"]
    }
};
