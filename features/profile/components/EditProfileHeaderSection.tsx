import React from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { EditProfileHeader } from "./EditProfileHeader";
import { ProfileTabs } from "./ProfileTabs";
import type { TabType } from "./ProfileTabs";

interface EditProfileHeaderSectionProps {
  scrollY: Animated.Value;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onBack: () => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
  title?: string;
  showTabs?: boolean;
  headerHeight?: number;
}

export const EditProfileHeaderSection: React.FC<EditProfileHeaderSectionProps> = ({
  scrollY,
  activeTab,
  onTabChange,
  onBack,
  onSave,
  isSaving,
  title,
  showTabs = true,
  headerHeight = 210,
}) => {
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 30, 60, 100, 140, 200, 280],
    outputRange: [0, 0, 0, 0, -150, -220, -260],
    extrapolate: "clamp",
  });

  return (
    <Animated.View
      style={[
        styles.headerWrapper,
        {
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
    >
      <LinearGradient
        colors={["#0052D4", "#007BFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { height: headerHeight }]}
      />
      <SafeAreaView edges={["top"]} style={styles.headerSafeArea}>
        <EditProfileHeader title={title} onBack={onBack} onSave={onSave} isSaving={isSaving} />

        {/* Tabs */}
        {showTabs && (
          <Animated.View
            style={[
              styles.tabsContainer,
              {
                opacity: scrollY.interpolate({
                  inputRange: [0, 30, 60, 100, 140, 200, 280],
                  outputRange: [1, 1, 0.8, 0.5, 0.2, 0.1, 0], // Aparece muy lento al subir
                  extrapolate: "clamp",
                }),
                transform: [
                  {
                    translateY: scrollY.interpolate({
                      inputRange: [0, 30, 60, 100, 140, 200, 280],
                      outputRange: [0, 0, -5, -20, -40, -50, -60], // Se mueve muy lento al subir
                      extrapolate: "clamp",
                    }),
                  },
                ],
              },
            ]}
          >
            <ProfileTabs activeTab={activeTab} onTabChange={onTabChange} />
          </Animated.View>
        )}
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    zIndex: 0,
  },
  headerSafeArea: {
    position: "relative",
    zIndex: 1,
  },
  tabsContainer: {
    overflow: "hidden",
  },
});
