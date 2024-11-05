<script lang="ts">
    import { applyAction, enhance } from "$app/forms";
    import type { PageServerData, ActionData } from "../../../../../routes/[lang=lang]/dashboard/$types";
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

    export let service: string;

    export let oauthCredentialChoices: Choice[];
    export let oauthId: string;
    export let setOAuthId: (value: string) => unknown;

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
    />
    {#if description}
        <p class="text-sm text-muted-foreground">{description}</p>
    {/if}
    {#if id}
        <!-- TODO: fix width/décalage -->
        {#if oauthCredentialChoices.length}
            <Combobox
                title="OAuth"
                choices={oauthCredentialChoices}
                value={oauthId}
                setValue={(value) => {
                    setOAuthId(value);
                    setLastUpdated();
                }}
            />
            <p class="text-center">ou</p>
        {/if}
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
            <Button type="submit" disabled={!!oauthCredentialChoices.length || !!oauthId} class="w-full">
                <img src="/icons/services/{service}.png" alt="{service} service" class="mr-2 h-4" />
                {$LL.area.oauth.action({ service: serviceName(service) })}
            </Button>
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
        </form>
    {/if}
</div>
