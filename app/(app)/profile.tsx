import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";

import Button from "../../components/Button";
import { useAuth } from "../../context/AuthContext";

const formatLabel = (label?: string | null) => {
  if (!label) {
    return "Not available";
  }

  return label;
};

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const name =
    user?.name ?? ([user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Anonymous");
  const email = user?.email ?? "No email provided";
  const avatar = user?.avatar ?? null;
  const bio = user?.bio ?? "No bio provided";
  const location = user?.location ?? user?.departmentName ?? "Not specified";
  const phone = user?.phone ?? "Not provided";
  const birthDate = user?.birthDate ?? "Not provided";
  const gender = user?.gender ?? "Not provided";
  const department = user?.departmentName ?? user?.departmentId ?? "Not provided";
  const neighborhood = user?.neighborhoodName ?? user?.neighborhoodId ?? "Not provided";

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.background }}>
      <View className="items-center p-6">
        <View className="mb-6 items-center">
          {avatar ? (
            <Image source={{ uri: avatar }} className="w-28 h-28 rounded-full" />
          ) : (
            <View className="w-28 h-28 rounded-full bg-secondary/70 items-center justify-center">
              <Text className="text-3xl font-conviven-bold text-secondary-foreground">
                {name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <Text className="text-2xl font-conviven-bold text-foreground mt-4">{name}</Text>
          <Text className="font-conviven text-muted-foreground">{email}</Text>
        </View>

        <View className="w-full bg-card rounded-2xl border border-border shadow-sm">
          <View className="p-5 border-b border-border/70">
            <Text className="text-lg font-conviven-semibold text-foreground mb-3">
              Profile Information
            </Text>
            <View className="gap-3">
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Name</Text>
                <Text className="font-conviven-semibold text-foreground">{name}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Email</Text>
                <Text className="font-conviven-semibold text-foreground">{email}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">User ID</Text>
                <Text className="font-conviven-semibold text-foreground">
                  {formatLabel(user?.id)}
                </Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Birth Date</Text>
                <Text className="font-conviven-semibold text-foreground">{birthDate}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Gender</Text>
                <Text className="font-conviven-semibold text-foreground">{gender}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Department</Text>
                <Text className="font-conviven-semibold text-foreground">{department}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Neighborhood</Text>
                <Text className="font-conviven-semibold text-foreground">{neighborhood}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Bio</Text>
                <Text className="font-conviven text-foreground">{bio}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Location</Text>
                <Text className="font-conviven text-foreground">{location}</Text>
              </View>
              <View>
                <Text className="text-sm font-conviven text-muted-foreground">Phone</Text>
                <Text className="font-conviven text-foreground">{phone}</Text>
              </View>
            </View>
          </View>
        </View>

        <Button
          label="Edit Profile"
          onPress={() => alert("Edit profile functionality would go here")}
          variant="primary"
          fullWidth={false}
        />
      </View>
    </ScrollView>
  );
}
