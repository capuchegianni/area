/* eslint-disable @typescript-eslint/no-unused-vars */
import { useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import type { AboutJson } from "@common/types/about/interfaces/about.interface";
import { useState } from "react";
import useMount from "react-use/lib/useMount";
import api from "@common/api/api";
import {
    Option,
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "~/components/ui/select";
import { Area } from "@common/types/area/interfaces/area.interface";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X } from "~/lib/icons/X";
import { TouchableOpacity } from "react-native";

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

type Services = AboutJson["server"]["services"];
type Service = ArrayElement<AboutJson["server"]["services"]>

type Action = ArrayElement<Service["actions"]>
type SelectAction = {
    value: string
    label: string
}
type Reaction = ArrayElement<Service["reactions"]>
type SelectReaction = {
    value: string
    label: string
}

type QuerySearchParams = {
    id: string | undefined
}

function CreateArea() {

}

function EditArea({ id }: { id: string }) {

}

export default function AreaScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams() as QuerySearchParams;
    const [services, setServices] = useState<Services>([]);
    const [area, setArea] = useState<Area>();
    const [action, setAction] = useState<Action>();
    const [selectAction, setSelectAction] = useState<SelectAction>();
    const [reaction, setReaction] = useState<Reaction>();
    const [selectReaction, setSelectReaction] = useState<SelectReaction>();

    const storeAction = (option: Option | undefined) => {
        if (!area && !option)
            return;

        const [serviceName, actionId] = area ? area.action_id.split(".") : option!.value.split(".");
        if (!serviceName || !actionId)
            return;

        setAction(
            services
                .find(service => service.name === serviceName)
                ?.actions.find(action => action.name === actionId)
        );
        setSelectAction({
            value: `${serviceName}.${actionId}`,
            label: `${serviceName.at(0)?.toUpperCase()}${serviceName.slice(1)} - ${actionId.at(0)?.toUpperCase()}${actionId.slice(1).replaceAll("_", " ")}`
        });
    };

    const storeReaction = (option: Option | undefined) => {
        if (!area && !option)
            return;

        const [serviceName, reactionId] = area ? area.action_id.split(".") : option!.value.split(".");
        if (!serviceName || !reactionId)
            return;
        setReaction(
            services
                .find(service => service.name === serviceName)
                ?.reactions.find(reaction => reaction.name === reactionId)
        );
        setSelectReaction({
            value: `${serviceName}.${reactionId}`,
            label: `${serviceName.at(0)?.toUpperCase()}${serviceName.slice(1)} - ${reactionId.at(0)?.toUpperCase()}${reactionId.slice(1).replaceAll("_", " ")}`
        });
    };

    useMount(() => {
        const fetchServices = async () => {
            const res = await api.about(process.env.EXPO_PUBLIC_API_URL);

            if (!res.success) {
                switch (res.status) {
                case 500:
                    break;
                }
                return;
            }
            setServices(res.body.server.services);
        };

        const getArea = async () => {
            const token = await AsyncStorage.getItem("@access_token");
            if (!id || !token)
                return;

            const res = await api.area.getById(process.env.EXPO_PUBLIC_API_URL, token, id);

            if (!res.success) {
                switch (res.status) {
                case 401:
                    console.error("You are not connected, please reload your page.");
                    break;
                case 500:
                    console.error("An error happened.");
                    break;
                }
                return;
            }
            setArea(res.body);
            storeAction(undefined);
            storeReaction(undefined);
        };

        fetchServices();
        getArea();
    });

    return (
        <View className="flex-1 p-4">
            <View className="flex-column justify-left items-left mb-10">
                <Text className="text-xl font-bold">{t("createArea")}</Text>
                <Text className="text-sm font-semibold text-gray-400">{t("areaDescription")}</Text>
            </View>
            <View>
                <View className="mb-4">
                    <View className="flex-row mb-1">
                        <Text className="text-foreground text-sm native:text-lg">Action</Text>
                        {selectAction && (
                            <TouchableOpacity onPress={() => setSelectAction(undefined)} className="ml-2">
                                <X color="red" size={16} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Select
                        value={{
                            value: selectAction ? selectAction.value : "",
                            label: selectAction ? selectAction.label : ""
                        }}
                        onValueChange={storeAction}
                    >
                        <SelectTrigger>
                            <SelectValue
                                className="text-foreground text-sm native:text-lg"
                                placeholder="Select an Action"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map((service) => (
                                <SelectGroup key={service.name}>
                                    <SelectLabel>{`${service.name.at(0)?.toUpperCase()}${service.name.slice(1)}`}</SelectLabel>
                                    {service.actions.map((action) => (
                                        <SelectItem
                                            key={action.name}
                                            label={`${service.name.at(0)?.toUpperCase()}${service.name.slice(1)} - ${action.name.at(0)?.toUpperCase()}${action.name.slice(1).replaceAll("_", " ")}`}
                                            value={`${service.name}.${action.name}`}
                                        />
                                    ))}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                </View>
                <View>
                    <View className="flex-row mb-1">
                        <Text className="text-foreground text-sm native:text-lg">REAction</Text>
                        {selectReaction && (
                            <TouchableOpacity onPress={() => setSelectReaction(undefined)} className="ml-2">
                                <X color="red" size={16} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <Select
                        value={{
                            value: selectReaction ? selectReaction.value : "",
                            label: selectReaction ? selectReaction.label : ""
                        }}
                        onValueChange={storeReaction}
                    >
                        <SelectTrigger>
                            <SelectValue
                                className="text-foreground text-sm native:text-lg"
                                placeholder="Select a REAction"
                            />
                        </SelectTrigger>
                        <SelectContent>
                            {services.map((service) => (
                                <SelectGroup key={service.name}>
                                    <SelectLabel>{`${service.name.at(0)?.toUpperCase()}${service.name.slice(1)}`}</SelectLabel>
                                    {service.reactions.map((reaction) => (
                                        <SelectItem
                                            key={reaction.name}
                                            label={`${service.name.at(0)?.toUpperCase()}${service.name.slice(1)} - ${reaction.name.at(0)?.toUpperCase()}${reaction.name.slice(1).replaceAll("_", " ")}`}
                                            value={`${service.name}.${reaction.name}`}
                                        />
                                    ))}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                </View>
            </View>
        </View>
    );
}
