import React from "react";
import useMount from "react-use/lib/useMount";
import { View } from "react-native";
import { useTranslation } from "react-i18next";
import { Text } from "~/components/ui/text";
import api from "@common/api/api";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";

export default function HomePage() {
    const { t } = useTranslation();

    const router = useRouter();

    useMount(async () => {
        const res = await api.about(process.env.EXPO_PUBLIC_API_URL);

        if (!res.success) {
            switch (res.status) {
            case 500:
                break;
            }
            return;
        }
    });

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
                        {t("servicesConnect")}
                    </Text>
                </View>
            </View>
        </View>
    );
}
