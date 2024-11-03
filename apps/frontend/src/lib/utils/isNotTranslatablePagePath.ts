const NOT_TRANSLATABLE_PATHS = ["/client.apk", "/oauth/.*"];

export default function isNotTranslatablePagePath(pathname: string) {
    return NOT_TRANSLATABLE_PATHS.some(path => (new RegExp("^" + path)).test(pathname));
}
