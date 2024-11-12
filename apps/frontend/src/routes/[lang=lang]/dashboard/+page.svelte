<script lang="ts">
    import type { PageServerData, ActionData } from "./$types";
    import LL from "$i18n/i18n-svelte";
    import AreaCreationDialog from "./components/AreaCreationDialog/AreaCreationDialog.svelte";
    import AreaCard from "./components/AreaCard/AreaCard.svelte";

    export let data: PageServerData;
    export let form: ActionData;

    let editingIndex: number | undefined;
</script>

<div class="p-4 space-y-4">
    <h3 class="font-bold text-center">{$LL.welcome({ name: data.clientName })}</h3>
    {#if data.services}
        <AreaCreationDialog
            onOpenChange={(open) => {
                if (!open) {
                    data.oauthResult = {
                        success: null,
                        service: null,
                        id: null
                    };
                    editingIndex = undefined;
                }
            }}
            services={data.services}
            oauthCredentials={data.oauthCredentials}
            oauthResult={data.oauthResult}
            editingArea={editingIndex !== undefined ? data.areas[editingIndex] : undefined}
            form={form}
        />
    {/if}
    <div class="grid grid-cols-1 mobile:grid-cols-3">
        {#each data.areas as area, index}
            <AreaCard
                area={area}
                index={index}
                onEditButtonClick={(index) => editingIndex = index}
                form={form}
            />
        {/each}
    </div>
</div>
