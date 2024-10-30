import type { Choice } from "$lib/components/dashboard/area/Combobox/Combobox";
import type { Services, Action, Reaction } from "@common/customTypes/about.interface";
import { serviceName } from "@common/area/services";

/**
 * Convert services items (actions or reactions) list to Combobox choices list.
 * It also stores the items in a destination object.
 *
 * @param {Services} services Services items list.
 * @param {"actions" | "reactions"} item The item type.
 * @param {Record<string, Action | Reaction>} dest The destination object.
 *
 * @returns {Choice[]} The choices list.
 */
export default function servicesItemsToChoices(services: Services, item: "actions" | "reactions", dest: Record<string, Action | Reaction>): Choice[] {
    return services.filter(services => services[item] && services[item].length)
        .reduce((acc: Choice[], service) => {
            const name = serviceName(service.name);

            return acc.concat([
                { label: name, value: service.name, isGroup: true },
                ...service[item].map(serviceItem => {
                    const id = `${service.name}.${serviceItem.name}`;

                    dest[id] = serviceItem;
                    return { label: serviceItem.name, value: id, group: name };
                })
            ]);
        }, []);
}
