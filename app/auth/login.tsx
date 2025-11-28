import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LoginCredentials } from "@/types/user";
import { LoginForm, useLogin } from "@/features/login";

const styles = StyleSheet.create({
  contentContainer: { flexGrow: 1 },
});

export default function LoginScreen() {
  const { submit, isLoading, handleFieldFocus } = useLogin();

  const handleLogin = async (credentials: LoginCredentials) => {
    await submit(credentials);
  };

  return (
    <LinearGradient
      colors={["#E6F2FF", "#FFFFFF", "#FFFFFF"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center items-center p-6">
            <View className="w-full max-w-sm items-center">
              <View className="items-center mb-10">
                <View className="w-28 h-28 mb-6 items-center justify-center shadow-sm bg-white rounded-3xl overflow-hidden">
                  <Image
                    source={require("../../assets/logo.png")}
                    resizeMode="contain"
                    className="w-full h-full"
                  />
                </View>
                <Text className="text-3xl font-conviven-bold text-foreground mb-2 text-center">
                  Ingresa con tu cuenta
                </Text>
                <Text className="font-conviven text-muted-foreground text-center text-base px-4">
                  encuentra al roomie que necesitabas
                </Text>
              </View>

              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                onFocusField={handleFieldFocus}
              />

              <View className="mt-8 flex-row justify-center items-center">
                <Text className="font-conviven text-muted-foreground text-base">
                  ¿No tienes cuenta?{" "}
                </Text>
                <TouchableOpacity onPress={() => router.push("/auth/register")} activeOpacity={0.7}>
                  <Text className="font-conviven-bold text-primary text-base">Regístrate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
