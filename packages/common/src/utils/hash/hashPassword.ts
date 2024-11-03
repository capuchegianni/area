import hashString from "./hashString";

export default function hashPassword(password: FormDataEntryValue | null) {
    return hashString(password?.toString() || "");
}
