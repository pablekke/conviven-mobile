import Toast from "react-native-toast-message";
import { MatchNotification } from "../types";
import { useRouter } from "expo-router";

interface UseMatchNotificationsProps {
  setLastMatchNotification: (notification: MatchNotification) => void;
  triggerMatchesRefresh: () => void;
}

export const useMatchNotifications = ({
  setLastMatchNotification,
  triggerMatchesRefresh,
}: UseMatchNotificationsProps) => {
  const router = useRouter();

  const handleMatchNotification = (data: MatchNotification) => {
    setLastMatchNotification(data);

    Toast.show({
      type: "success",
      text1: "¡Es un Match! 🎉",
      text2: "Has conectado con alguien nuevo",
      visibilityTime: 4000,
      onPress: () => {
        router.push("/chat");
      },
    });

    triggerMatchesRefresh();
  };

  return { handleMatchNotification };
};
