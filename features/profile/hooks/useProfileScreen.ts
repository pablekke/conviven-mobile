import { useMemo } from "react";
import { useAuth } from "../../../context/AuthContext";

export const useProfileScreen = () => {
  const { user } = useAuth();

  const userName = useMemo(
    () => user?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ?? "Usuario",
    [user?.name, user?.firstName, user?.lastName],
  );

  const userAge = useMemo(() => {
    if (!user?.birthDate) return 26;
    return new Date().getFullYear() - new Date(user.birthDate).getFullYear();
  }, [user?.birthDate]);

  const progressPercentage = useMemo(() => {
    if (!user) return 0;
    let completed = 0;
    const total = 5;

    if (user.avatar) completed++;
    if (user.bio && user.bio.length > 40) completed++;
    if (user.neighborhoodId) completed++;
    if (user.phone) completed++;
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
