<script lang="ts">
    import type { ActionData } from "../../$types";
    import { CircleX } from "lucide-svelte";
    import { invalidateAll } from "$app/navigation";
    import { applyAction, enhance } from "$app/forms";
    import * as Card from "$lib/components/ui/card";
    import * as HoverCard from "$lib/components/ui/hover-card";
    import { Button } from "$lib/components/ui/button";
    import { Label } from "$lib/components/ui/label";
    import { Switch } from "$lib/components/ui/switch";
    import type { Area } from "@common/types/area/interfaces/area.interface";

    export let area: Area;

    export let form: ActionData;

    let enabled = area.status === "RUNNING";
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>{area.name}</Card.Title>
        <Card.Description>{area.description}</Card.Description>
    </Card.Header>
    <Card.Content>
        <div class="grid w-full items-center gap-4">
            <div class="flex gap-2 items-center justify-between ">
                <span class="text-sm text-gray-500">Action</span>
                <span>{area.action_id}</span>
            </div>
            <div class="flex gap-2 items-center justify-between">
                <span class="text-sm text-gray-500">REAction</span>
                <span>{area.reaction_id}</span>
            </div>
            <div class="flex gap-2 items-center justify-between">
                <span class="text-sm text-gray-500">Delay</span>
                <span>{area.delay} seconds</span>
            </div>
            {#if area.status === "RUNNING" || area.status === "STOPPED"}
                <form
                    method="POST"
                    action="?/status"
                    use:enhance={async ({ formData }) => {
                        formData.set("id", area.id);
                        return async ({ result }) => {
                            if (result.type === "success")
                                await invalidateAll();
                            await applyAction(result);
                        };
                    }}
                    class="flex flex-row items-center justify-between"
                >
                    <Label for="enabled" class="font-normal text-sm text-gray-500">Enabled</Label>
                    <div class="flex items-center space-x-2 rounded-lg border pl-3">
                        <Switch id="enabled" name="enabled" bind:checked={enabled} />
                        <Button type="submit" variant="ghost" disabled={(area.status === "RUNNING") === enabled}>Save</Button>
                    </div>
                </form>
            {:else}
                <div class="flex flex-row items-center justify-between">
                    <span class="text-sm text-gray-500">Enabled</span>
                    <HoverCard.Root>
                        <HoverCard.Trigger>
                            <CircleX color="red" />
                        </HoverCard.Trigger>
                        <HoverCard.Content>
                            The AREA is currently in an error state. Please contact the support for more information.
                        </HoverCard.Content>
                    </HoverCard.Root>
                </div>
            {/if}
            {#if form?.errorMessage}
                <p class="text-end text-sm text-red-500">{form?.errorMessage}</p>
            {/if}
        </div>
    </Card.Content>
    <Card.Footer class="flex justify-end space-x-4">
        <Button>Edit</Button>
        <Button variant="destructive">Delete</Button>
    </Card.Footer>
</Card.Root>
