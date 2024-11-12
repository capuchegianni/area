import React from "react";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Text } from "./ui/text";
import type { OAuthService } from "@common/api/types/OAuthService";
import { Button } from "./ui/button";

WebBrowser.maybeCompleteAuthSession();

function getRedirectUri() {
    return AuthSession.makeRedirectUri({
        preferLocalhost: Platform.OS === "android" || Platform.OS === "ios" ? process.env.EXPO_PUBLIC_NODE_ENV !== "production" : false,
        scheme: "area51",
        path: "callback"
    });
}

type ServiceOauthProps = {
    name: OAuthService
    scope: string
}

export default function ServiceOauth(props: ServiceOauthProps) {
    const fetchOauthUrl = async () => {
        const token = await AsyncStorage.getItem("@access_token");
        if (!token)
            return;

        const redirectUri = getRedirectUri();

        await WebBrowser.openAuthSessionAsync(
            `${process.env.EXPO_PUBLIC_FRONTEND_URL}/oauth/${props.name}?access_token=${token}&redirect_uri=${redirectUri}&scope=${props.scope}`,
            redirectUri
        );
    };

    return (
        <Button onPress={fetchOauthUrl}>
            <Text className="text-lg">
                Connect to {props.name.at(0)?.toUpperCase()}{props.name.slice(1)}
            </Text>
        </Button>
    );
}
