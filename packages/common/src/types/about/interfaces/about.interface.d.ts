declare class AboutJsonClient {
    readonly host: string;
}
declare class AboutJsonServerServiceOAuth {
    readonly name: string;
    readonly description: string;
    readonly oauthProvider: string;
    readonly oauthScopes: string[];
}
declare class AboutJsonServerService {
    readonly name: string;
    readonly actions: AboutJsonServerServiceOAuth[];
    readonly reactions: AboutJsonServerServiceOAuth[];
}
declare class AboutJsonServer {
    readonly current_time: number;
    readonly services: AboutJsonServerService[];
}
export declare class AboutJson {
    readonly client: AboutJsonClient;
    readonly server: AboutJsonServer;
}
export {};
