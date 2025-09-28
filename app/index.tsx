import { Alert, Text, View } from "react-native";

import Button from "@/components/Button";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center gap-y-4 bg-background px-6">
      <View className="items-center">
        <Text className="text-4xl font-conviven-bold text-foreground">Welcome to NativeWind!</Text>
        <Text className="text-xl font-conviven text-muted-foreground">Style your app with</Text>
        <Text className="text-3xl font-conviven-bold text-primary">Tailwind CSS!</Text>
      </View>
      <Button
        label="Sounds good!"
        onPress={() => {
          Alert.alert("NativeWind", "You're all set up!");
        }}
        fullWidth={false}
      />
    </View>
  );
}
