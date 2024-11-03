import { DISCORD_ACTIONS } from "./discord.actions";
import { DISCORD_REACTIONS } from "./discord.reactions";

export default {
    name: "discord",
    actions: Object.entries(DISCORD_ACTIONS).map(
        ([name, { description, oauthProvider, metadata, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            metadata,
            oauthScopes
        })
    ),
    reactions: Object.entries(DISCORD_REACTIONS).map(
        ([name, { description, oauthProvider, oauthScopes }]) => ({
            name,
            description,
            oauthProvider,
            oauthScopes
        })
    )
};
