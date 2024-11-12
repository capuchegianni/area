<script lang="ts">
    import Check from "lucide-svelte/icons/check";
    import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
    import * as Command from "$lib/components/ui/command";
    import * as Popover from "$lib/components/ui/popover";
    import { cn } from "$lib/utils.js";
    import { Button } from "$lib/components/ui/button";
    import { tick } from "svelte";
    import LL from "$i18n/i18n-svelte.js";
    import type { Choice } from "./Combobox";

    export let title: string;
    export let choices: Choice[];
    export let value: string;
    export let setValue: (value: string) => unknown;
    export let clearOption: boolean = false;
    export let disabled: boolean = false;

    let open = false;

    $: selectedGroup = choices.find(f => f.value === value)?.group ?? null;
    $: selectedValue = choices.find(f => f.value === value)?.label ?? $LL.components.combobox.select({ element: title });

    const closeAndFocusTrigger = (triggerId: string) => {
        open = false;
        tick().then(() => document.getElementById(triggerId)?.focus());
    };
</script>

<div class="grid">
    <p class="mr-4 text-muted-foreground text-sm">{title}</p>
    <Popover.Root bind:open let:ids>
        <Popover.Trigger asChild let:builder>
            <Button
                builders={[builder]}
                variant="outline"
                role="combobox"
                disabled={disabled}
                aria-expanded={open}
                class="justify-between"
            >
                {selectedGroup ? selectedGroup + " - " : ""}{selectedValue}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        </Popover.Trigger>
        <Popover.Content class="max-h-52 overflow-y-auto">
            <Command.Root>
                <Command.Input placeholder={$LL.components.combobox.search({ element: title })} />
                <Command.Empty>{$LL.components.combobox.no({ element: title })}</Command.Empty>
                <Command.Group>
                    {#if clearOption && value}
                        <Command.Item
                            onSelect={() => {
                                setValue("");
                                closeAndFocusTrigger(ids.trigger);
                            }}
                        >
                            {$LL.components.combobox.clear()}
                        </Command.Item>
                    {/if}
                    {#each choices as choice}
                        <Command.Item
                            value={choice.value}
                            onSelect={(currentValue) => {
                                setValue(currentValue);
                                closeAndFocusTrigger(ids.trigger);
                            }}
                            disabled={choice.disabled || choice.isGroup}
                            class={cn(choice.isGroup && "font-bold")}
                        >
                            <Check
                                class={cn(
                                    "mr-2 h-4 w-4",
                                    value !== choice.value && "text-transparent"
                                )}
                            />
                            {choice.label}
                        </Command.Item>
                    {/each}
                </Command.Group>
            </Command.Root>
        </Popover.Content>
    </Popover.Root>
</div>
