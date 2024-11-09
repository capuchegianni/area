import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
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
import { OAuthService } from "@common/api/types/OAuthService";
import ServiceOauth from "~/components/serviceOauth";
import type { Services, Action, Reaction } from "@common/area/types/area";
import { actionFields } from "@common/area/actions";
import { reactionFields } from "@common/area/reactions";
import { Input } from "~/components/ui/input";
import { useEffect } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { ScrollView } from "react-native";
import { Switch } from "~/components/ui/switch";

type SelectAction = {
    value: string
    label: string
}

type SelectReaction = {
    value: string
    label: string
}

type QuerySearchParams = {
    id: string | undefined
}

type Field<T = string> = {
    name: T;
    type: string;
    optional?: boolean;
};

export default function AreaScreen() {
    const { t } = useTranslation();
    const { id } = useLocalSearchParams() as QuerySearchParams;
    const [area, setArea] = useState<Area>();
    const [services, setServices] = useState<Services>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [action, setAction] = useState<Action>();
    const [selectAction, setSelectAction] = useState<SelectAction>();
    const [storedActionFields, setActionFields] = useState<string[]>([]);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [reaction, setReaction] = useState<Reaction>();
    const [selectReaction, setSelectReaction] = useState<SelectReaction>();
    const [storedReactionFields, setReactionFields] = useState<Field[]>([]);

    const storeAction = (option: Option | undefined) => {
        if (!area && !option)
            return;

        const [serviceName, actionId] = area ? area.action_id.split(".") : option!.value.split(".");
        if (!serviceName || !actionId)
            return;

        setAction(actions.find(action => action.name === actionId));
        setActionFields(actionFields(serviceName + "." + actionId));
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
        setReaction(reactions.find(reaction => reaction.name === reactionId));
        setReactionFields(reactionFields(serviceName + "." + reactionId));
        setSelectReaction({
            value: `${serviceName}.${reactionId}`,
            label: `${serviceName.at(0)?.toUpperCase()}${serviceName.slice(1)} - ${reactionId.at(0)?.toUpperCase()}${reactionId.slice(1).replaceAll("_", " ")}`
        });
    };

    useEffect(() => {
        if (services.length > 0) {
            setActions(services.flatMap(service => service.actions as Action[]));
            setReactions(services.flatMap(service => service.reactions as Reaction[]));
        }
    }, [services]);

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

    const updateAreaProperty = (property: string, value: string | number | boolean | object, type?: "metadata" | "body") => {
        setArea(prevArea => {
            if (!prevArea)
                return {
                    id: "",
                    name: "",
                    description: "",
                    action_id: "",
                    action_metadata: {},
                    action_oauth_id: 0,
                    reaction_id: "",
                    reaction_body: {},
                    reaction_oauth_id: 0,
                    delay: 1,
                    status: 0,
                    [property]: value
                };

            if (type) {
                if (type === "metadata")
                    return {
                        ...prevArea,
                        action_metadata: {
                            ...prevArea.action_metadata,
                            [property]: value
                        }
                    };
                if (type === "body")
                    return {
                        ...prevArea,
                        reaction_body: {
                            ...prevArea.reaction_body,
                            [property]: value
                        }
                    };
            }
            return {
                ...prevArea,
                [property]: value
            };
        });
    };

    const getAreaProperty = (property: string, type?: "metadata" | "body"): string => {
        if (!area)
            return "";
        if (type) {
            if (type === "metadata")
                return area["action_metadata"][property as keyof object] ?? "";
            if (type === "body")
                return area["reaction_body"][property as keyof object] ?? "";
        }
        return area[property as keyof Area] ?? "";
    };

    const handleSubmit = async () => {
        if (!action || !reaction)
            return;
        const actionService = services.find(service => service.actions.includes(action));
        const reactionService = services.find(service => service.reactions.includes(reaction));

        updateAreaProperty("action_id", (actionService ? actionService.name : action.oauthProvider) + "." + action.name);
        updateAreaProperty("action_oauth_id", 0);
        updateAreaProperty("reaction_id", (reactionService ? reactionService.name : reaction.oauthProvider) + "." + reaction.name);
        updateAreaProperty("reaction_oauth_id", 0);
        console.log(area);

        const token = await AsyncStorage.getItem("@access_token");
        if (!token || !area)
            return;

        if (id) {
            const res = await api.area.patchById(process.env.EXPO_PUBLIC_API_URL, token, id, area);

            if (!res.success) {
                switch (res.status) {
                case 401:
                    await AsyncStorage.removeItem("@access_token");
                    router.navigate("/(auth)/login");
                    break;
                case 500:
                    console.error("An internal error happened");
                    break;
                }
                return;
            }
            router.navigate("/dashboard");
        } else {
            const res = await api.area.createArea(process.env.EXPO_PUBLIC_API_URL, token, area);

            if (!res.success) {
                switch (res.status) {
                case 401:
                    await AsyncStorage.removeItem("@access_token");
                    router.navigate("/(auth)/login");
                    break;
                case 500:
                    console.error("An internal error happened");
                    break;
                }
                return;
            }
            router.navigate("/dashboard");
        }
    };

    return (
        <ScrollView>

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
                                <TouchableOpacity onPress={() => {
                                    setSelectAction(undefined);
                                    setAction(undefined);
                                }} className="ml-2">
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
                            className="mb-2"
                            disabled={!!id}
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
                        {action && (
                            <ServiceOauth
                                name={action.oauthProvider as OAuthService}
                                scope={action.oauthScopes.join(" ")}
                            />
                        )}
                    </View>
                    <View>
                        <View className="flex-row">
                            <Text className="text-foreground text-sm native:text-lg">REAction</Text>
                            {selectReaction && (
                                <TouchableOpacity onPress={() => {
                                    setSelectReaction(undefined);
                                    setReaction(undefined);
                                }} className="ml-2">
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
                            className="mb-2"
                            disabled={!!id}
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
                        {reaction && (
                            <ServiceOauth
                                name={reaction.oauthProvider as OAuthService}
                                scope={reaction.oauthScopes.join(" ")}
                            />
                        )}
                    </View>
                </View>
                <View className="pt-4">
                    {reaction && action && (
                        <View>
                            <View className="p-2">
                                <Text>Name</Text>
                                <Input
                                    placeholder="Name"
                                    value={getAreaProperty("name")}
                                    onChange={(e) => updateAreaProperty("name", e.nativeEvent.text)}
                                />
                            </View>
                            <View className="p-2">
                                <Text>Description</Text>
                                <Input
                                    placeholder="Description"
                                    value={getAreaProperty("description")}
                                    onChange={(e) => updateAreaProperty("description", e.nativeEvent.text)}
                                />
                            </View>
                            <View>
                                {action.metadata !== undefined && (
                                    Object.keys(action.metadata || {}).map(field => (
                                        <View key={field} className="p-2">
                                            <Text>{field}</Text>
                                            <Input
                                                placeholder={field}
                                                id={field}
                                                value={getAreaProperty(field, "metadata")}
                                                onChange={(e) => updateAreaProperty(field, e.nativeEvent.text, "metadata")}
                                            />
                                        </View>
                                    ))
                                )}
                            </View>
                            <View>
                                <Text className="text-xs">
                                    Here is the list of fields you can use for <Text className="font-semibold">{action.name}</Text>.<br />
                                    You can use them in the fields below to customize <Text className="font-semibold">{reaction.name}</Text>. <br />
                                    For example, with a Youtube video, to set a combination of the video title and channel name in a field,
                                    type {"\"{{title}} by {{channelName}}\""} in the title field below.
                                </Text>
                                <Text className="p-2 text-muted-foreground text-xs text-justify">
                                    {storedActionFields.join(", ")}
                                </Text>
                            </View>
                            <View className="pt-4">
                                {storedReactionFields.map(field => {
                                    return (
                                        <View key={field.name} className="p-2">
                                            <Text>{field.name}</Text>
                                            {field.type === "textarea" ? (
                                                <Textarea
                                                    placeholder={field.name}
                                                    id={field.name}
                                                    value={getAreaProperty(field.name, "body")}
                                                    onChange={(e) => updateAreaProperty(field.name, e.nativeEvent.text, "body")}
                                                />
                                            ) : (
                                                <Input
                                                    placeholder={field.name}
                                                    id={field.name}
                                                    value={getAreaProperty(field.name, "body")}
                                                    onChange={(e) => updateAreaProperty(field.name, e.nativeEvent.text, "body")}
                                                />
                                            )}

                                        </View>
                                    );
                                })}
                            </View>
                            <View className="p-2">
                                <Text>Delay</Text>
                                <Input
                                    placeholder="Delay"
                                    keyboardType="numeric"
                                    value={area ? area.delay.toString() : ""}
                                    onChangeText={(text) => updateAreaProperty("delay", Number(text))}
                                />
                                <Text className="text-sm">The delay (in seconds) between each poll to the service.</Text>
                            </View>
                            <View className="p-2">
                                <View>
                                    <Text>Enable AREA</Text>
                                    <Switch
                                        checked={!area?.status}
                                        onCheckedChange={(checked) => updateAreaProperty("status", !checked)}
                                    />
                                </View>
                                <Text className="text-sm">Enable or disable the AREA.</Text>
                            </View>
                            <Button
                                onPress={handleSubmit}
                                className="p-2"
                            >
                                <Text>{id ? "Edit Area" : "Create Area"}</Text>
                            </Button>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}
