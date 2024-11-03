import { AreaGmailMail } from "./interfaces/gmail-mail";

export function transformAreaGmailMailToRaw(mail: AreaGmailMail): object {
    let content = "";

    content += `To: ${mail.to}\n`;
    content += `Subject: ${mail.subject}\n`;

    if (undefined !== mail.from) content += `From: ${mail.from}\n`;
    else content += `\n`;
    content += `\n${mail.body}\n`;

    return {
        userId: "me",
        raw: Buffer.from(content, "utf-8").toString("base64")
    };
}
