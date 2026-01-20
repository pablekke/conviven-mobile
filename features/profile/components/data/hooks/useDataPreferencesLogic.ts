import { useAuth } from "../../../../../context/AuthContext";
import { useLocationLogic } from "./useLocationLogic";
import { useDataUpdaters } from "./useDataUpdaters";
import { useDataChanges } from "./useDataChanges";
import { useDataState } from "./useDataState";
import { useDataSave } from "./useDataSave";

export interface UseDataPreferencesLogicReturn {
  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  education: string;
  birthDate: string | null;
  gender: string | null;
  locationModalVisible: boolean;
  setLocationModalVisible: (visible: boolean) => void;
  dataHasChanges: boolean;
  dataSaving: boolean;

  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setBio: (value: string) => void;
  setOccupation: (value: string) => void;
  setEducation: (value: string) => void;
  setBirthDate: (value: string) => void;
  setGender: (value: string) => void;

  handleLocationConfirm: (selectedIds: string[], mainNeighborhoodId?: string | null) => void;

  draftLocation: {
    neighborhoodId: string | null;
    cityId: string | null;
    departmentId: string | null;
  } | null;

  getLocationLabel: () => string;
  calculateAge: () => number | null;

  saveDataPrefs: () => Promise<void>;
  resetDataPrefs: () => void;
  getChanges: () => any;
}

export const useDataPreferencesLogic = (): UseDataPreferencesLogicReturn => {
  const { user } = useAuth();

  const {
    firstName,
    lastName,
    bio,
    occupation,
    education,
    locationModalVisible,
    dataSaving,
    draftLocation,
    draftGender,
    originalDataRef,
    setFirstNameState,
    setLastNameState,
    setBioState,
    setOccupationState,
    setEducationState,
    setLocationModalVisible,
    setDataSaving,
    setDraftLocation,
    setDraftGender,
    normalizeBirthDate,
  } = useDataState();

  const {
    setFirstName,
    setLastName,
    setBio,
    setOccupation,
    setEducation,
    setBirthDate,
    setGender,
  } = useDataUpdaters(
    setFirstNameState,
    setLastNameState,
    setBioState,
    setOccupationState,
    setEducationState,
    setDraftGender,
  );

  const { dataHasChanges, getChanges } = useDataChanges(
    firstName,
    lastName,
    occupation,
    education,
    bio,
    draftLocation,
    draftGender,
    originalDataRef,
    normalizeBirthDate,
  );

  const { saveDataPrefs, resetDataPrefs } = useDataSave(
    getChanges,
    dataHasChanges,
    setDataSaving,
    setDraftLocation,
    setDraftGender,
    originalDataRef,
    normalizeBirthDate,
  );

  const { getLocationLabel, handleLocationConfirm, calculateAge } = useLocationLogic(
    draftLocation,
    setDraftLocation,
  );

  return {
    firstName,
    lastName,
    bio,
    occupation,
    education,
    birthDate: user?.birthDate || null,
    gender: user?.gender || null,
    locationModalVisible,
    setLocationModalVisible,
    dataHasChanges,
    dataSaving,
    setFirstName,
    setLastName,
    setBio,
    setOccupation,
    setEducation,
    setBirthDate,
    setGender,
    handleLocationConfirm,
    draftLocation,
    getLocationLabel,
    calculateAge,
    saveDataPrefs,
    resetDataPrefs,
    getChanges,
  };
};
