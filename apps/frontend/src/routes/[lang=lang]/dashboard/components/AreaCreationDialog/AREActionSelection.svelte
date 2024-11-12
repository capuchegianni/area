<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import type { PageServerData, ActionData } from "../../$types";
    import { serviceName } from "@common/area/services.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import type { Choice } from "$lib/components/Combobox/Combobox";
    import Combobox from "$lib/components/Combobox/Combobox.svelte";
    import LL from "$i18n/i18n-svelte";

    export let title: "Action" | "REAction";
    export let description: string | undefined;

    export let choices: Choice[];
    export let id: string;
    export let setId: (value: string) => unknown;
    export let disabled: boolean;

    export let service: string | undefined;

    export let oauthId: string;

    export let oauthScopes: string[] | undefined;

    export let setLastUpdated: () => unknown;

    export let oauthResult: PageServerData["oauthResult"] | undefined;

    export let form: ActionData | undefined;
</script>

<div class="rounded-lg border p-4 space-y-2">
    <Combobox
        title={title}
        choices={choices}
        value={id}
        setValue={(value) => {
            setId(value);
            setLastUpdated();
        }}
        disabled={disabled}
    />
    {#if description}
        <p class="text-sm text-muted-foreground">{description}</p>
    {/if}
    {#if id && service && !oauthId}
        <form
            method="POST"
            action="?/oauth"
            use:enhance={async ({ formData }) => {
                formData.set("service", service);
                formData.set("scope", oauthScopes?.join(" ") || "");
                setLastUpdated();
                return async ({ result }) => await applyAction(result);
            }}
            class="space-y-2"
        >
            <Button type="submit" class="w-full">
                <img src="/icons/services/{service}.png" alt="{service} service" class="mr-2 h-4" />
                {$LL.area.oauth.action({ service: serviceName(service) })}
            </Button>
        </form>
    {/if}
    <!-- TODO: add revoke form -->
    {#if oauthResult?.service}
        {#if oauthResult?.success === "true"}
            <p class="text-center font-semibold text-sm text-green-500">Successfully connected to {serviceName(oauthResult?.service)}</p>
        {/if}
        {#if oauthResult?.success === "false"}
            <p class="text-center font-semibold text-sm text-red-500">Could not connect to {serviceName(oauthResult?.service)}</p>
        {/if}
    {/if}
    {#if form?.oauthErrorMessage}
        <p class="text-center text-sm text-red-500">{form?.oauthErrorMessage}</p>
    {/if}
</div>
