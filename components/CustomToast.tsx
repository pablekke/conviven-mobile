import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Toast from "react-native-toast-message";

export default function CustomToast() {
  return (
    <Toast
      position="bottom"
      config={{
        success: props => (
          <View style={[styles.toastContainer, styles.successBackground]}>
            <View style={styles.contentContainer}>
              {props.text1 && <Text style={styles.titleText}>{props.text1}</Text>}
              {props.text2 && (
                <Text style={styles.bodyText} numberOfLines={0}>
                  {props.text2}
                </Text>
              )}
            </View>
          </View>
        ),
        error: props => (
          <View style={[styles.toastContainer, styles.errorBackground]}>
            <View style={styles.contentContainer}>
              {props.text1 && <Text style={styles.titleText}>{props.text1}</Text>}
              {props.text2 && (
                <Text style={styles.bodyText} numberOfLines={0}>
                  {props.text2}
              </Text>
              )}
            </View>
          </View>
        ),
        info: props => (
          <View style={[styles.toastContainer, styles.infoBackground]}>
            <View style={styles.contentContainer}>
              {props.text1 && <Text style={styles.titleText}>{props.text1}</Text>}
              {props.text2 && (
                <Text style={styles.bodyText} numberOfLines={0}>
                {props.text2}
              </Text>
              )}
            </View>
          </View>
        ),
      }}
    />
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    width: "90%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  successBackground: {
    backgroundColor: "#10b981",
  },
  errorBackground: {
    backgroundColor: "#ef4444",
  },
  infoBackground: {
    backgroundColor: "#3b82f6",
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  bodyText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
  },
});
