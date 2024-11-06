import type { Field } from "./types/Field";
import type { AreaGmailMail } from "../types/area/services/gmail/interfaces/gmail-mail.interface";

const gmailSendEmail: Field<keyof AreaGmailMail>[] = [
    { name: "to", type: "text" },
    { name: "from", type: "text", optional: true },
    { name: "subject", type: "text" },
    { name: "body", type: "text" }
];

export const REACTIONS: Record<string, Field[]> = {
    "gmail.send_mail": gmailSendEmail
};

export function reactionFields(reaction: string): Field[] {
    return REACTIONS[reaction] || [];
}
