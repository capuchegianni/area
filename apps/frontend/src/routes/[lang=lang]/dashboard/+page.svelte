<script lang="ts">
    import type { PageServerData, ActionData } from "./$types";
    import AreaCreationDialog from "./components/AreaCreationDialog/AreaCreationDialog.svelte";
    import AreaCard from "~/routes/[lang=lang]/dashboard/components/AreaCard/AreaCard.svelte";

    export let data: PageServerData;
    export let form: ActionData;
</script>

<div class="p-4 space-y-4">
    {#if data.services}
        <AreaCreationDialog
            onOpenChange={(open) => {
                if (!open)
                    data.oauthResult = {
                        success: null,
                        service: null,
                        id: null
                    };
            }}
            services={data.services}
            oauthCredentials={data.oauthCredentials}
            oauthResult={data.oauthResult}
            {form}
        />
    {/if}
    <div class="grid grid-cols-1 mobile:grid-cols-3">
        {#each data.areas as area}
            <AreaCard {area} {form} />
        {/each}
    </div>
</div>
