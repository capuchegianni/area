<script lang="ts">
    import type { PageServerData, ActionData } from "../../$types";
    import type { Area } from "@common/types/area/interfaces/area.interface";
    import type { Services } from "@common/area/types/area";
    import {  buttonVariants } from "$lib/components/ui/button";
    import * as Dialog from "$lib/components/ui/dialog";
    import LL from "$i18n/i18n-svelte";
    import AreaForm from "./AreaForm.svelte";
    import { cn } from "$lib/utils";

    export let onOpenChange: (open: boolean) => unknown;

    export let services: Services;
    export let oauthCredentials: PageServerData["oauthCredentials"];
    export let oauthResult: PageServerData["oauthResult"];
    export let editingArea: Area | undefined;

    export let form: ActionData;
</script>

<Dialog.Root open={oauthResult.success !== null || editingArea} onOpenChange={onOpenChange}>
    <Dialog.Trigger class={cn(buttonVariants({ variant: "outline" }), "w-full")}>
        {editingArea ? $LL.area.updateArea() : $LL.area.createArea()}
    </Dialog.Trigger>
    <Dialog.Content class="min-h-[500px] sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>{editingArea ? $LL.area.updateArea() : $LL.area.createArea()}</Dialog.Title>
            <Dialog.Description>
                {editingArea ? $LL.area.createAreaDescription() : $LL.area.createAreaDescription()}
            </Dialog.Description>
        </Dialog.Header>
        <AreaForm
            services={services}
            oauthCredentials={oauthCredentials}
            oauthResult={oauthResult}
            editingArea={editingArea}
            form={form}
        />
    </Dialog.Content>
</Dialog.Root>
