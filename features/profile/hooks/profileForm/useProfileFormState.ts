import { useCallback, useEffect, useState } from "react";
import { User } from "../../../../types/user";
import { EditForm } from "../../types";

function mapUserToForm(user: User): EditForm {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    bio: user.profile?.bio ?? "",
    location: user.location?.neighborhood?.name ?? "",
    departmentId: user.location?.department?.id ?? "",
    cityId: user.location?.city?.id ?? "",
    neighborhoodId: user.location?.neighborhood?.id ?? "",
  };
}

export function useProfileFormState(user: User | null, editVisible: boolean) {
  const [form, setForm] = useState<EditForm>({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    departmentId: "",
    cityId: "",
    neighborhoodId: "",
  });

  useEffect(() => {
    if (!user || editVisible) return;
    setForm(mapUserToForm(user));
  }, [user, editVisible]);

  const updateForm = useCallback(<K extends keyof EditForm>(field: K, value: EditForm[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return { form, setForm, updateForm };
}
