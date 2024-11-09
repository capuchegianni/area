<script lang="ts">
    import type { LayoutData } from "./$types";
    import Header from "./components/Header/Header.svelte";

    export let data: LayoutData;
</script>

<Header signedIn={!!data.client} />
<main>
    <slot />
</main>
