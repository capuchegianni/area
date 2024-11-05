<script lang="ts">
    import type { PageServerData, ActionData } from "../../../../../routes/[lang=lang]/dashboard/$types";
    import type { Services } from "@common/area/types/area";
    import {  buttonVariants } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import LL from "$i18n/i18n-svelte";
    import AreaForm from "./AreaForm.svelte";

    export let onOpenChange: (open: boolean) => unknown;

    export let services: Services;
    export let oauthCredentials: PageServerData["oauthCredentials"];
    export let oauthResult: PageServerData["oauthResult"];

    export let form: ActionData;
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
        <AreaForm
            services={services}
            oauthCredentials={oauthCredentials}
            oauthResult={oauthResult}
            form={form}
        />
    </Dialog.Content>
</Dialog.Root>
