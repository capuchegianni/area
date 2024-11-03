import CryptoJS from "crypto-js";

export default function hashString(string: string, algorithm: keyof typeof CryptoJS = "SHA512") {
    let hash;
    switch (algorithm) {
    case "SHA256":
    case "SHA512":
        hash = CryptoJS[algorithm](string);
        break;
    default:
        throw new Error(`Unsupported algorithm: ${algorithm}`);
    }

    return hash.toString(CryptoJS.enc.Hex);
}
