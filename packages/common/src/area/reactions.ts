import type { AreaGmailMail } from "../types/area/services/gmail/interfaces/gmail-mail.interface";

type Field<T = string> = {
    name: T;
    type: string; // "textarea" will use a textarea input, anything else will use a classic input
    optional?: boolean;
};

const gmailSendEmail: Field<keyof AreaGmailMail>[] = [
    { name: "to", type: "text" },
    { name: "from", type: "text", optional: true },
    { name: "subject", type: "text" },
    { name: "body", type: "textarea" }
];

export const REACTIONS: Record<string, Field[]> = {
    "gmail.send_mail": gmailSendEmail
};

export function reactionFields(reaction: string): Field[] {
    return REACTIONS[reaction] || [];
}
