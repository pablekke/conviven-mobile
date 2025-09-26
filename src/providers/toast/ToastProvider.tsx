import { type PropsWithChildren } from "react";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";

export const ToastProvider = ({ children }: PropsWithChildren) => {
  return (
    <>
      {children}
      <Toast
        position="top"
        topOffset={Platform.OS === "android" ? 72 : 64}
        visibilityTime={3000}
      />
    </>
  );
};
