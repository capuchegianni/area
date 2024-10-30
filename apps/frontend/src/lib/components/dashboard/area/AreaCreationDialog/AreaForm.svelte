<script lang="ts">
    import type { HTMLInputTypeAttribute } from "svelte/elements";
    import type { Action, Reaction } from "@common/customTypes/about.interface";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Separator } from "$lib/components/ui/separator";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import LL from "$i18n/i18n-svelte";

    type Field = {
        name: string;
        displayName: string;
        type: HTMLInputTypeAttribute;
        description: string;
    };

    // TODO: replace with backend data or at least move it to common
    const FIELDS: Record<string, Field[]> = {
        "youtube.on_liked_video": [
            { name: "id", displayName: "ID", type: "text", description: "The identifier of the video" },
            { name: "url", displayName: "URL", type: "text", description: "The URL of the video" },
            { name: "title", displayName: "Title", type: "text", description: "The title of the video" },
            {
                name: "description",
                displayName: "Description",
                type: "text",
                description: "The description of the video"
            },
            {
                name: "channelName",
                displayName: "Channel name",
                type: "text",
                description: "The channel from which the video comes from"
            },
            {
                name: "channelId",
                displayName: "Channel ID",
                type: "text",
                description: "The channel identifier from which the video comes from"
            },
            { name: "likes", displayName: "Likes", type: "text", description: "The number of likes on the video" },
            { name: "views", displayName: "Views", type: "text", description: "The number of view on the video" },
            {
                name: "publishedAt",
                displayName: "Published at",
                type: "date",
                description: "The date at which the video was published"
            },
            { name: "tags", displayName: "Tags", type: "text", description: "The tags of the video" },
            {
                name: "thumbnail",
                displayName: "Thumbnail",
                type: "text",
                description: "The thumbnail URL of the video"
            }
        ],
        "discord.send_embed": [
            { name: "title", displayName: "Title", type: "text", description: "The title of the Embed" },
            {
                name: "description",
                displayName: "Description",
                type: "text",
                description: "The description of the Embed"
            },
            { name: "url", displayName: "URL", type: "Text", description: "The URL of the Embed" },
            {
                name: "timestamp",
                displayName: "Timestamp",
                type: "date",
                description: "The timestamp of the Embed content"
            },
            { name: "color", displayName: "Color", type: "color", description: "Color code of the Embed" },
            { name: "footer", displayName: "Footer", type: "text", description: "The footer information" },
            {
                name: "imageUrl",
                displayName: "Image URL",
                type: "text",
                description: "(HTTP(S)) source URL of the image"
            },
            {
                name: "thumbnailUrl",
                displayName: "Thumbnail URL",
                type: "text",
                description: "(HTTP(S)) source URL of the thumbnail"
            },
            {
                name: "authorName",
                displayName: "Author name",
                type: "text",
                description: "The name of the Embed author"
            },
            { name: "authorUrl", displayName: "Author URL", type: "text", description: "The URL of the Embed author" }
        ]
    };

    export let action: Action;
    // eslint-disable-next-line svelte/valid-compile
    export let actionId: string;
    export let reaction: Reaction;
    export let reactionId: string;

    export let handleSubmitActionOAuth: () => Promise<unknown>;
</script>

<ScrollArea class="h-96">
    <form method="POST" class="grid gap-4">
        <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
            <Label for="name">Name</Label>
            <Input type="text" id="name" placeholder="Name" />
        </div>
        <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
            <Label for="description">Description</Label>
            <Input type="text" id="description" placeholder="Description" />
        </div>
        {#if action.auth === "oauth"}
            <Button on:click={handleSubmitActionOAuth} class="w-[95%]">
                <img src="/icons/services/google.png" alt="google service" class="mr-2 h-4 w-4" />
                {$LL.area.oauth.action()}
            </Button>
        {:else if action.auth === "apiKey"}
            <p>API Key</p>
        {:else if action.auth === "webhook"}
            <p>Webhook</p>
        {/if}
        <!-- TODO: reaction auth (and other payload keys) -->
        <Separator />
            <div class="space-y-4">
                <p class="text-xs">
                    Here are the list of fields you can use for <strong>{action.name}</strong>.<br />
                    You can use them in the fields below to customize <strong>{reaction.name}</strong>.<br />
                    To use them, type <strong>{"{{<field_name>}}"}</strong> in the field.<br />
                    For example, to set a combination of the video title and channel name in the Embed title,
                    type <strong>{"{{title}} by {{channelName}}"}</strong> in the <strong>Title</strong> field below.
                </p>
                <Separator />
                {#if FIELDS[reactionId]}
                    {#each FIELDS[reactionId] as field}
                        <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                            <Label for={field.name}>{field.displayName}</Label>
                            <Input type={field.type} id={field.name} placeholder={field.displayName} />
                            <p class="text-muted-foreground text-sm">{field.description}</p>
                        </div>
                    {/each}
                {/if}
            </div>
        {#if action.auth !== "webhook"}
            <Separator />
            <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                <Label for="delay">Delay</Label>
                <Input type="number" id="delay" placeholder="Delay" />
                <p class="text-muted-foreground text-sm">The delay (in seconds) between each poll to the service.</p>
            </div>
        {/if}
    </form>
</ScrollArea>
