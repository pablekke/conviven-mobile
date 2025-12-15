import { City, Department, Neighborhood } from "../../../types/user";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { EditForm, LocationLabels, SelectionType } from "../types";
import { useProfileAvatarUpdate } from "./profileForm/useProfileAvatarUpdate";
import { useProfileFormSave } from "./profileForm/useProfileFormSave";
import { useProfileFormState } from "./profileForm/useProfileFormState";
import { useProfileLocationCatalog } from "./profileForm/useProfileLocationCatalog";
import { useProfileLocationLabels } from "./profileForm/useProfileLocationLabels";

export interface UseProfileFormReturn {
  form: EditForm;
  locationLabels: LocationLabels;
  savingProfile: boolean;
  catalogLoading: boolean;
  photoUploading: boolean;
  departments: Department[];
  cities: City[];
  neighborhoods: Neighborhood[];
  selectionType: SelectionType | null;
  editVisible: boolean;
  setEditVisible: (visible: boolean) => void;
  setSelectionType: (type: SelectionType | null) => void;
  updateForm: <K extends keyof EditForm>(field: K, value: EditForm[K]) => void;
  openEditModal: () => Promise<void>;
  handleSelect: (type: SelectionType, id: string) => Promise<void>;
  handleSaveProfile: () => Promise<void>;
  handleAvatarUpdate: () => Promise<void>;
  handleSelectionOpen: (type: SelectionType) => void;
  selectionItems: { id: string; label: string; helper?: string }[];
  selectedId: string | undefined;
}

export const useProfileForm = (): UseProfileFormReturn => {
  const { user, setUser } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const { form, setForm, updateForm } = useProfileFormState(user, editVisible);
  const { locationLabels, setLocationLabels } = useProfileLocationLabels(user);

  const {
    selectionType,
    setSelectionType,
    catalogLoading,
    departments,
    cities,
    neighborhoods,
    openEditModal,
    handleSelect,
    handleSelectionOpen,
    selectionItems,
    selectedId,
  } = useProfileLocationCatalog({
    user,
    form,
    setForm,
    locationLabels,
    setLocationLabels,
    setEditVisible,
  });

  const { savingProfile, handleSaveProfile } = useProfileFormSave({
    user,
    form,
    setUser,
    setEditVisible,
  });

  const { photoUploading, handleAvatarUpdate } = useProfileAvatarUpdate({ user, setUser });

  return {
    form,
    locationLabels,
    savingProfile,
    catalogLoading,
    photoUploading,
    departments,
    cities,
    neighborhoods,
    selectionType,
    editVisible,
    setEditVisible,
    setSelectionType,
    updateForm,
    openEditModal,
    handleSelect,
    handleSaveProfile,
    handleAvatarUpdate,
    handleSelectionOpen,
    selectionItems,
    selectedId,
  };
};
