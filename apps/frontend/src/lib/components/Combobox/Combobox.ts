export type Choice = {
    label: string;
    value: string;
    group?: string; // If provided, it will be displayed when the choice is selected.
    disabled?: boolean;
    isGroup?: boolean; // If true, the choice is disabled and displayed in a different style. It's used to group choices together.
};
