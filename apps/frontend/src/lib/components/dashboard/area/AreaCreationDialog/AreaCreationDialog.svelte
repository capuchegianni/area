<!-- TODO: i18n -->

<script lang="ts">
    import { onMount, afterUpdate } from "svelte";
    import type { PageServerData, ActionData } from "../../../../../routes/[lang=lang]/dashboard/$types";
    import type { Services, Action, Reaction } from "@common/area/types/area";
    import {  buttonVariants } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import Combobox from "$lib/components/dashboard/area/Combobox/Combobox.svelte";
    import LL from "$i18n/i18n-svelte";
    import AreaForm from "./AreaForm.svelte";
    import servicesItemsToChoices from "$lib/utils/dashboard/servicesItemsToChoices";
    import { Separator } from "$lib/components/ui/separator";

    export let onOpenChange: (open: boolean) => unknown;

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

    onMount(() => {
        actionId = sessionStorage.getItem("actionId") || "";
        reactionId = sessionStorage.getItem("reactionId") || "";
    });

    afterUpdate(() => {
        sessionStorage.setItem("actionId", actionId);
        sessionStorage.setItem("reactionId", reactionId);
    });
</script>

<Dialog.Root open={oauthResult.success !== null} onOpenChange={onOpenChange}>
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
            <Combobox title="Action" choices={actionsChoices} value={actionId} setValue={(value) => actionId = value} />
            <Combobox title="REAction" choices={reactionsChoices} value={reactionId} setValue={(value) => reactionId = value} />
            {#if actionId && reactionId}
                <Separator />
                <AreaForm
                    action={actions[actionId]}
                    actionId={actionId}
                    reaction={reactions[reactionId]}
                    reactionId={reactionId}
                    oauthCredentials={oauthCredentials}
                    oauthResult={oauthResult}
                    form={form}
                />
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
