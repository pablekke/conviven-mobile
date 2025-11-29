import React from "react";
import { PhotoUploadScreen } from "../../../features/profile/components";
import { useRouter } from "expo-router";

export default function PhotosScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/(app)/profile");
  };

  return <PhotoUploadScreen onBack={handleBack} />;
}
