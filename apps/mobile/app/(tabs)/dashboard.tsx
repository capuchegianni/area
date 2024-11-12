import React, { useState } from "react";
import useMount from "react-use/lib/useMount";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "~/components/ui/text";
import api from "@common/api/api";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Area } from "@common/types/area/interfaces/area.interface";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";

export default function HomePage() {
    const { t } = useTranslation();
    const router = useRouter();

    const [areas, setAreas] = useState<Area[]>([]);

    useMount(async () => {
        const about = async () => {
            const res = await api.about(process.env.EXPO_PUBLIC_API_URL);

            if (!res.success) {
                switch (res.status) {
                case 500:
                    break;
                }
                return;
            }
        };

        const getAreas = async () => {
            const token = await AsyncStorage.getItem("@access_token");
            if (!token)
                return;

            const res = await api.area.getAll(process.env.EXPO_PUBLIC_API_URL, token);
            if (!res.success) {
                switch (res.status) {
                case 401:
                    AsyncStorage.removeItem("@access_token");
                    router.navigate("/(auth)/login");
                case 500:
                    console.error("An internal error happened.");
                    break;
                }
                return;
            }
            setAreas(res.body);
        };

        about();
        getAreas();
    });

    const editArea = (id: string) => {
        router.navigate(`/(tabs)/area?id=${id}`);
    };

    const deleteArea = async (id: string) => {
        const token = await AsyncStorage.getItem("@access_token");
        if (!token)
            return;

        const res = await api.area.deleteArea(process.env.EXPO_PUBLIC_API_URL, token, id);
        if (!res.success) {
            switch (res.status) {
            case 401:
                AsyncStorage.removeItem("@access_token");
            case 500:
                console.error("An internal error happened");
                break;
            }
            return;
        }
        setAreas(areas.filter(area => area.id !== id));
    };

    return (
        <View className="flex-1 p-4">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold">{t("home")}</Text>
            </View>
            <Button onPress={() => router.navigate("./area")}>
                <Text className="text-lg">
                    {t("createArea")}
                </Text>
            </Button>
            <View className="mt-10">
                <View className="items-center">
                    <Text className="text-sm font-bold text-gray-400">
                        {t("services")}
                    </Text>
                    <View className="w-full">
                        {areas.map(area => (
                            <View key={area.name}>
                                <Card className="m-4">
                                    <CardHeader>
                                        <CardTitle>{area.name}</CardTitle>
                                        <CardDescription>{area.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Text>Action: {area.action_id}</Text>
                                        <Text>Reaction: {area.reaction_id}</Text>
                                    </CardContent>
                                    <CardFooter className="justify-end">
                                        <View className="flex flex-row gap-1">
                                            <Button onPress={() => editArea(area.id)}>
                                                <Text>Edit</Text>
                                            </Button>
                                            <Button onPress={() => deleteArea(area.id)} className="bg-red-600">
                                                <Text>Delete</Text>
                                            </Button>
                                        </View>
                                    </CardFooter>
                                </Card>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}
