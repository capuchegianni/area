import { ApiProperty } from "@nestjs/swagger";

class AboutJsonClient {
    @ApiProperty({ description: "The host (IP address) of the client." })
    readonly host: string;
}

class AboutJsonServerServiceOAuth {
    @ApiProperty({
        description: "The name of the action."
    })
    readonly name: string;

    @ApiProperty({
        description: "The description of the action."
    })
    readonly description: string;

    @ApiProperty({
        description: "The name of the OAuth provider.",
        type: String,
        examples: ["google", "discord", "twitch"]
    })
    readonly oauthProvider: string;

    @ApiProperty({
        description: "The required OAuth scopes.",
        type: String,
        isArray: true,
        examples: ["https://www.googleapis.com/auth/youtube.readonly"]
    })
    readonly oauthScopes: string[];
}

class AboutJsonServerService {
    @ApiProperty({
        description: "The name of the service",
        examples: ["youtube", "discord"]
    })
    readonly name: string;

    @ApiProperty({
        description: "The actions available for this service.",
        type: AboutJsonServerServiceOAuth,
        isArray: true
    })
    readonly actions: AboutJsonServerServiceOAuth[];

    @ApiProperty({
        description: "The reactions available for this service.",
        type: AboutJsonServerServiceOAuth,
        isArray: true
    })
    readonly reactions: AboutJsonServerServiceOAuth[];
}

class AboutJsonServer {
    @ApiProperty({
        description: "The current time based on the server's hardware."
    })
    readonly current_time: number;

    @ApiProperty({
        description: "The list of the supported AREAs.",
        type: AboutJsonServerService,
        isArray: true
    })
    readonly services: AboutJsonServerService[];
}

export class AboutJson {
    @ApiProperty({ description: "All the information related to the client." })
    readonly client: AboutJsonClient;

    @ApiProperty({
        description:
            "Some informations about the server, including the supported AREAs."
    })
    readonly server: AboutJsonServer;
}
