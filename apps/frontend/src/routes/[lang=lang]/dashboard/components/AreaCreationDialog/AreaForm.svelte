<script lang="ts">
    import type { PageServerData, ActionData } from "../../$types";
    import { applyAction, enhance } from "$app/forms";
    import type { Area } from "@common/types/area/interfaces/area.interface";
    import type { Services, Action, Reaction } from "@common/area/types/area";
    import { Label } from "$lib/components/ui/label";
    import { Input } from "$lib/components/ui/input";
    import { Textarea } from "$lib/components/ui/textarea";
    import { Separator } from "$lib/components/ui/separator";
    import { ScrollArea } from "$lib/components/ui/scroll-area";
    import { Button } from "$lib/components/ui/button";
    import LL from "$i18n/i18n-svelte";
    import { Switch } from "$lib/components/ui/switch";
    import servicesItemsToChoices from "$lib/utils/dashboard/servicesItemsToChoices";
    import { onMount } from "svelte";
    import AREActionSelection from "./AREActionSelection.svelte";
    import { actionFields } from "@common/area/actions";
    import { reactionFields } from "@common/area/reactions";

    export let services: Services;
    export let oauthCredentials: PageServerData["oauthCredentials"];
    export let oauthResult: PageServerData["oauthResult"];
    export let editingArea: Area | undefined;

    export let form: ActionData;

    const actions: Record<string, Action> = {};
    const reactions: Record<string, Reaction> = {};

    const actionsChoices = servicesItemsToChoices(services, "actions", actions);
    const reactionsChoices = servicesItemsToChoices(services, "reactions", reactions);

    let actionId: string = "";
    let reactionId: string = "";
    let lastUpdated: "action" | "reaction";

    $: selectedActionFields = actionFields(actionId).join(", ");

    $: oauthIds = {
        action: oauthCredentials[`${actions[actionId]?.oauthProvider}.${actions[actionId]?.oauthScopes}`] || "",
        reaction: oauthCredentials[`${reactions[reactionId]?.oauthProvider}.${reactions[reactionId]?.oauthScopes}`] || ""
    };

    let error = "";

    onMount(() => {
        actionId = editingArea?.action_id || sessionStorage.getItem("actionId") || "";
        reactionId = editingArea?.reaction_id || sessionStorage.getItem("reactionId") || "";
        oauthIds.action = editingArea?.action_oauth_id.toString() || sessionStorage.getItem("actionOAuthId") || "";
        oauthIds.reaction = editingArea?.reaction_oauth_id.toString() || sessionStorage.getItem("reactionOAuthId") || "";

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

    const getObjectValue = (object: object | undefined, field: string): string | undefined => {
        const metadata = (object || {}) as Record<string, string>;

        return metadata[field];
    };
</script>

<ScrollArea class="max-h-[500px]">
    <div class="grid gap-4">
        <AREActionSelection
            title="Action"
            description={actions[actionId]?.description}
            choices={actionsChoices}
            id={actionId}
            setId={value => {
                actionId = value;
                sessionStorage.setItem("actionId", actionId);
            }}
            disabled={!!editingArea}
            service={actions[actionId]?.oauthProvider}
            oauthId={oauthIds.action}
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
            disabled={!!editingArea}
            service={reactions[reactionId]?.oauthProvider}
            oauthId={oauthIds.reaction}
            oauthScopes={reactions[reactionId]?.oauthScopes}
            setLastUpdated={() => setLastUpdated("reaction")}
            oauthResult={lastUpdated === "reaction" ? oauthResult : undefined}
            form={lastUpdated === "reaction" ? form : undefined}
        />
        {#if actions[actionId] && reactions[reactionId]}
            <form
                method="POST"
                action="?/area"
                use:enhance={async ({ formData, cancel }) => {
                    const ids = [
                        ["action-id", actionId, "an Action"],
                        ["reaction-id", reactionId, "a REAction"],
                        ["action-oauth-id", oauthIds.action, "an OAuth credential for the Action"],
                        ["reaction-oauth-id", oauthIds.reaction, "an OAuth credential for the REAction"]
                    ];

                    for (const [name, value, displayName] of ids) {
                        if (!value) {
                            cancel();
                            error = `Please select ${displayName}.`;
                            return;
                        }
                        formData.set(name, value);
                    }
                    if (editingArea)
                        formData.set("id", editingArea.id);
                    return async ({ result }) => await applyAction(result);
                }}
                class="grid gap-4"
            >
                <div class="py-4">
                    <Separator />
                </div>
                <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                    <Label for="name">Name</Label>
                    <Input type="text" id="name" name="name" value={editingArea?.name} placeholder="Name" required />
                </div>
                <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                    <Label for="description">Description</Label>
                    <Input type="text" id="description" name="description" value={editingArea?.description} placeholder="Description" required />
                </div>
                {#if actions[actionId].metadata !== undefined}
                    <Separator />
                    {#each Object.keys(actions[actionId].metadata || {}) as field}
                        <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                            <Label for="metadata-{field}">{field}</Label>
                            <Input
                                type="text"
                                id="metadata-{field}"
                                name="metadata-{field}"
                                value={getObjectValue(editingArea?.action_metadata, field)}
                                placeholder={field} required
                            />
                            <!-- TODO <p class="text-muted-foreground text-sm">{field.description}</p>-->
                        </div>
                    {/each}
                {/if}
                <Separator />
                <div class="space-y-4">
                    {#if selectedActionFields}
                        <p class="text-xs">
                            Here are the list of fields you can use for <strong>{actions[actionId].name}</strong>.<br />
                            You can use them in the fields below to customize <strong>{reactions[reactionId].name}</strong>.<br />
                            To use them, type <strong>{"{{<field_name>}}"}</strong> in the field.<br />
                            For example, with a YouTube video, to set a combination of the video title and channel name in a field,
                            type <strong>{"{{title}} by {{channelName}}"}</strong> in this field below.
                        </p>
                        <p class="px-2 text-muted-foreground text-xs text-justify">
                            {selectedActionFields}
                        </p>
                        <Separator />
                    {/if}
                    {#each reactionFields(reactionId) as field}
                        <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                            <Label for={field.name}>{field.name}</Label>
                            {#if field.type === "textarea"}
                                <Textarea
                                    id={field.name}
                                    name={field.name}
                                    value={getObjectValue(editingArea?.reaction_body, field.name)}
                                    placeholder={field.name}
                                    required={!field.optional}
                                />
                            {:else}
                                <Input
                                    type={field.type}
                                    id={field.name}
                                    name={field.name}
                                    value={getObjectValue(editingArea?.reaction_body, field.name)}
                                    placeholder={field.name}
                                    required={!field.optional}
                                />
                            {/if}
    <!--                       TODO <p class="text-muted-foreground text-sm">{field.description}</p>-->
                        </div>
                    {/each}
                </div>
                <Separator />
                <div class="flex w-[95%] max-w-sm flex-col gap-1.5">
                    <Label for="delay">Delay</Label>
                    <Input type="number" id="delay" name="delay" value={editingArea?.delay} placeholder="Delay" required />
                    <p class="text-muted-foreground text-sm">The delay (in seconds) between each poll to the service.</p>
                </div>
                <Separator />
                <div>
                    <div class="flex w-[95%] flex-row items-center justify-between">
                        <Label for="enabled">Enable AREA</Label>
                        <Switch id="enabled" name="enabled" checked={editingArea?.status === "RUNNING"} />
                    </div>
                    <p class="text-muted-foreground text-sm">Enable or disable the AREA.</p>
                </div>
                <Separator />
                {#if error}
                    <p class="text-center text-sm text-red-500">{error}</p>
                {/if}
                {#if form?.errorMessage}
                    <p class="text-center text-sm text-red-500">{form?.errorMessage}</p>
                {/if}
                <Button type="submit">
                    {editingArea ? $LL.area.updateArea() : $LL.area.createArea()}
                </Button>
            </form>
        {/if}
    </div>
</ScrollArea>
