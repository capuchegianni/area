<script lang="ts">
    import type { PageServerData } from "./$types";
    import AreaCreationDialog from "$lib/components/dashboard/area/AreaCreationDialog/AreaCreationDialog.svelte";

    export let data: PageServerData;
</script>

<div class="p-4">
    {#if data.services}
        <AreaCreationDialog
            services={data.services}
            client={data.client}
            apiUrl={data.apiUrl}
        />
    {/if}
</div>
