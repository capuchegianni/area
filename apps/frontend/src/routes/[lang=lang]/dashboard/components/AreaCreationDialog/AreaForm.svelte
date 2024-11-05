<!-- TODO: i18n -->

<script lang="ts">
    import type { HTMLInputTypeAttribute } from "svelte/elements";
    import type { PageServerData, ActionData } from "../../../../../routes/[lang=lang]/dashboard/$types";
    import { enhance } from "$app/forms";
    import type { Services, Action, Reaction } from "@common/area/types/area";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Separator } from "$lib/components/ui/separator";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import LL from "$i18n/i18n-svelte";
    import { Switch } from "$lib/components/ui/switch";
    import servicesItemsToChoices from "$lib/utils/dashboard/servicesItemsToChoices";
    import { onMount } from "svelte";
    import AREActionSelection from "./AREActionSelection.svelte";

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

    export let services: Services;
    export let oauthCredentials: PageServerData["oauthCredentials"];
    export let oauthResult: PageServerData["oauthResult"];

    export let form: ActionData;

    const actions: Record<string, Action> = {};
    const reactions: Record<string, Reaction> = {};

    const actionsChoices = servicesItemsToChoices(services, "actions", actions);
    const reactionsChoices = servicesItemsToChoices(services, "reactions", reactions);

    let actionId: string = "";
    let reactionId: string = "";
    let lastUpdated: "action" | "reaction";

    $: actionService = actions[actionId]?.oauthProvider;
    $: reactionService = reactions[reactionId]?.oauthProvider;

    $: actionOAuthCredentialChoices = oauthCredentials[actionService]?.map(credential => ({
        value: credential,
        label: credential
    })) || [];
    $: reactionOAuthCredentialChoices = oauthCredentials[reactionService]?.map(credential => ({
        value: credential,
        label: credential
    })) || [];

    let oauthIds = {
        action: "",
        reaction: ""
    };

    onMount(() => {
        actionId = sessionStorage.getItem("actionId") || "";
        reactionId = sessionStorage.getItem("reactionId") || "";
        oauthIds.action = sessionStorage.getItem("actionOAuthId") || "";
        oauthIds.reaction = sessionStorage.getItem("reactionOAuthId") || "";

        const __lastUpdated = sessionStorage.getItem("lastUpdated") || "";
        if (__lastUpdated === "action" || __lastUpdated === "reaction") {
            lastUpdated = __lastUpdated;
            if (oauthResult.id !== null) {
                oauthIds[lastUpdated] = oauthResult.id;
                sessionStorage.setItem(`${lastUpdated}OAuthId`, oauthResult.id);
            }
        }
    });

    const setLastUpdated = (value: "action" | "reaction") => {
        lastUpdated = value;
        sessionStorage.setItem("lastUpdated", value);
        oauthResult = {
            success: null,
            service: null,
            id: null
        };
    };
</script>

<ScrollArea class="max-h-[500px]">
    <AREActionSelection
        title="Action"
        description={actions[actionId]?.description}
        choices={actionsChoices}
        id={actionId}
        setId={value => {
            actionId = value;
            sessionStorage.setItem("actionId", actionId);
        }}
        service={actionService}
        oauthCredentialChoices={actionOAuthCredentialChoices}
        oauthId={oauthIds.action}
        setOAuthId={value => {
            oauthIds.action = value;
            sessionStorage.setItem("actionOAuthId", oauthIds.action);
        }}
        oauthScopes={actions[actionId]?.oauthScopes}
        setLastUpdated={() => setLastUpdated("action")}
        oauthResult={lastUpdated === "action" ? oauthResult : undefined}
        form={lastUpdated === "action" ? form : undefined}
    />
    <AREActionSelection
        title="REAction"
        description={reactions[reactionId]?.description}
        choices={reactionsChoices}
        id={reactionId}
        setId={value => {
            reactionId = value;
            sessionStorage.setItem("reactionId", reactionId);
        }}
        service={reactionService}
        oauthCredentialChoices={reactionOAuthCredentialChoices}
        oauthId={oauthIds.reaction}
        setOAuthId={value => {
            oauthIds.reaction = value;
            sessionStorage.setItem("reactionOAuthId", oauthIds.reaction);
        }}
        oauthScopes={reactions[reactionId]?.oauthScopes}
        setLastUpdated={() => setLastUpdated("reaction")}
        oauthResult={lastUpdated === "reaction" ? oauthResult : undefined}
        form={lastUpdated === "reaction" ? form : undefined}
    />
    {#if actions[actionId] && reactions[reactionId]}
        <Separator />
        <!-- TODO: other payload keys -->
        <div class="py-4">
            <Separator />
        </div>
        <form method="POST" use:enhance class="grid gap-4">
            <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                <Label for="name">Name</Label>
                <Input type="text" id="name" placeholder="Name" />
            </div>
            <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                <Label for="description">Description</Label>
                <Input type="text" id="description" placeholder="Description" />
            </div>
            <Separator />
            <div class="space-y-4">
                <p class="text-xs">
                    Here are the list of fields you can use for <strong>{actions[actionId].name}</strong>.<br />
                    You can use them in the fields below to customize <strong>{reactions[reactionId].name}</strong>.<br />
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
            <Separator />
            <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                <Label for="delay">Delay</Label>
                <Input type="number" id="delay" placeholder="Delay" />
                <p class="text-muted-foreground text-sm">The delay (in seconds) between each poll to the service.</p>
            </div>
            <Separator />
            <div>
                <div class="flex w-[95%] flex-row items-center justify-between">
                    <Label for="enabled">Enable AREA</Label>
                    <Switch id="enabled" />
                </div>
                <p class="text-muted-foreground text-sm">Enable or disable the AREA.</p>
            </div>
            <Separator />
            <Button type="submit">
                {$LL.area.createArea()}
            </Button>
        </form>
    {/if}
</ScrollArea>
