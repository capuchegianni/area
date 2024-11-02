<script lang="ts">
    import type { PageServerData, ActionData } from "./$types";
    import AreaCreationDialog from "$lib/components/dashboard/area/AreaCreationDialog/AreaCreationDialog.svelte";

    export let data: PageServerData;
    export let form: ActionData;
</script>

<div class="p-4 space-y-4">
    {#if data.services}
        <AreaCreationDialog
            services={data.services}
            oauthCredentials={data.oauthCredentials}
            oauthResult={data.oauthResult}
            form={form}
        />
    {/if}
</div>
