<!-- TODO: i18n -->

<script lang="ts">
    import type { Client } from "~/app";
    import type { Services, Action, Reaction } from "@common/customTypes/about.interface";
    import {  buttonVariants } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import Combobox from "$lib/components/dashboard/area/Combobox/Combobox.svelte";
    import LL from "$i18n/i18n-svelte";
    import { error } from "@sveltejs/kit";
    import api from "@common/api/api";
    import AreaForm from "./AreaForm.svelte";
    import servicesItemsToChoices from "$lib/utils/dashboard/servicesItemsToChoices";
    import { Separator } from "$lib/components/ui/separator";

    export let services: Services;
    export let client: Client;
    export let apiUrl: string;

    const actions: Record<string, Action> = {};
    const reactions: Record<string, Reaction> = {};

    const actionsChoices = servicesItemsToChoices(services, "actions", actions);
    const reactionsChoices = servicesItemsToChoices(services, "reactions", reactions);

    let action: string = "";
    let reaction: string = "";

    // TODO: adapt to other services
    const handleSubmit = async () => {
        if (!client)
            return error(401, "Unauthorized");

        const response = await api.oauth.oauth(apiUrl, "google", {
            redirect_uri: window.location.href,
            scope: actions[action]?.oauthScopes?.join(" ") || ""
        }, client.accessToken);

        if (!response.success)
            return error(401, "Unauthorized");
        window.location.href = response.body.redirect_uri;
    };
</script>

<Dialog.Root>
    <Dialog.Trigger class={buttonVariants({ variant: "outline" })}>
        {$LL.area.createArea()}
    </Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>{$LL.area.createArea()}</Dialog.Title>
            <Dialog.Description>
                {$LL.area.createAreaDescription()}
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <Combobox title="Action" choices={actionsChoices} value={action} setValue={(value) => action = value} />
            <Combobox title="REAction" choices={reactionsChoices} value={reaction} setValue={(value) => reaction = value} />
            {#if action && reaction}
                <Separator />
                <AreaForm
                    action={actions[action]}
                    actionId={action}
                    reaction={reactions[reaction]}
                    reactionId={reaction}
                    handleSubmitActionOAuth={handleSubmit}
                />
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
