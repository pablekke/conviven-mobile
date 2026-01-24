import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";

export const useProfileScreen = () => {
  const { user } = useAuth();

  const userName = useMemo(
    () => `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Usuario",
    [user?.firstName, user?.lastName],
  );

  const userAge = useMemo(() => {
    if (!user?.birthDate) return 26;

    const today = new Date();
    const birthDate = new Date(user.birthDate);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }, [user?.birthDate]);

  const progressPercentage = useMemo(() => {
    if (!user) return 0;
    let completed = 0;
    const total = 5;

    if (user.photoUrl) completed++;
    if (user.profile?.bio && user.profile.bio.length > 40) completed++;
    if (user.location?.neighborhood?.id) completed++;
    if (user.profile) completed++;

    return Math.round((completed / total) * 100);
  }, [user]);

  return {
    user,
    userName,
    userAge,
    progressPercentage,
  };
};
