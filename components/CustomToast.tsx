import React from "react";
import { View, Text } from "react-native";
import Toast from "react-native-toast-message";

export default function CustomToast() {
  return (
    <Toast
      config={{
        error: props => (
          <View
            style={{
              width: "90%",
              backgroundColor: "#ef4444",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", fontWeight: "600", fontSize: 14, marginBottom: 4 }}>
                {props.text1}
              </Text>
              <Text style={{ color: "white", fontSize: 13, lineHeight: 18 }} numberOfLines={0}>
                {props.text2}
              </Text>
            </View>
          </View>
        ),
      }}
    />
  );
}
