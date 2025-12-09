import type { UseRoommatePreferencesLogicReturn } from "./useRoommatePreferencesLogic";
import { Language, ZodiacSign } from "../../../enums/searchPreferences.enums";
import { QUESTION_OPTIONS } from "../../../constants/questionOptions";
import Toast from "react-native-toast-message";
import { useState, useCallback } from "react";

interface UseRoommateTabModalProps {
  roommatePrefsData: UseRoommatePreferencesLogicReturn["roommatePrefsData"];
  handleUpdate: (question: string, value: string) => void;
  selectedAnswers: Record<string, string>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isSaving: boolean;
}

const ROOMMATE_ARRAY_FIELDS = ["languagesPref", "interestsPref", "zodiacPref"];

const LANGUAGE_CODE_MAP: Record<string, Language> = {
  es: Language.SPANISH,
  en: Language.ENGLISH,
  pt: Language.PORTUGUESE,
  fr: Language.FRENCH,
  it: Language.ITALIAN,
  de: Language.GERMAN,
};

const INTEREST_CODE_MAP: Record<string, string> = {
  gaming: "Gaming",
  reading: "Reading",
  cooking: "Cooking",
  sports: "Sports",
  music: "Music",
  travel: "Travel",
  art: "Art",
  technology: "Technology",
  fitness: "Fitness",
  photography: "Photography",
  movies: "Movies",
  dance: "Dance",
  cine: "Movies",
  música: "Music",
};

export const useRoommateTabModal = ({
  roommatePrefsData,
  handleUpdate,
  selectedAnswers,
  setSelectedAnswers,
  isSaving,
}: UseRoommateTabModalProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [modalSelectedValues, setModalSelectedValues] = useState<string[]>([]);

  const isArrayField = useCallback((questionKey: string) => {
    return ROOMMATE_ARRAY_FIELDS.includes(questionKey);
  }, []);

  const getCurrentArrayForField = useCallback(
    (questionKey: string): string[] => {
      if (!roommatePrefsData) return [];

      if (questionKey === "languagesPref") {
        const values = roommatePrefsData.languagesPref || [];
        return values.map(lang => {
          const lower = lang.toLowerCase();

          if (LANGUAGE_CODE_MAP[lower]) {
            return LANGUAGE_CODE_MAP[lower];
          }

          if (Object.values(Language).includes(lang as Language)) {
            return lang;
          }
          return lang;
        });
      }

      if (questionKey === "interestsPref") {
        const values = roommatePrefsData.interestsPref || [];
        return values.map(interest => {
          const lower = interest.toLowerCase();
          return INTEREST_CODE_MAP[lower] || interest;
        });
      }

      if (questionKey === "zodiacPref") {
        const values = roommatePrefsData.zodiacPref || [];
        return values.map(zodiac => {
          const upper = zodiac.toUpperCase();
          if (Object.values(ZodiacSign).includes(upper as ZodiacSign)) {
            return upper;
          }
          return zodiac;
        });
      }

      return [];
    },
    [roommatePrefsData],
  );

  const openSelectionModal = useCallback(
    (questionKey: string) => {
      if (isSaving) return;
      setSelectedQuestion(questionKey);

      if (!isArrayField(questionKey)) {
        const selectedLabel = selectedAnswers[questionKey];
        const options = QUESTION_OPTIONS[questionKey as keyof typeof QUESTION_OPTIONS];
        const selectedOption = options?.find(option => option.label === selectedLabel);
        setSelectedValue(selectedOption?.value ?? "");
        setModalSelectedValues([]);
      } else {
        setSelectedValue("");
        const currentValues = getCurrentArrayForField(questionKey);
        setModalSelectedValues(currentValues);
      }
      setModalVisible(true);
    },
    [isSaving, isArrayField, selectedAnswers, getCurrentArrayForField],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedQuestion("");
    setSelectedValue("");
    setModalSelectedValues([]);
  }, []);

  const handleModalSelect = useCallback(
    (value: string) => {
      if (isArrayField(selectedQuestion)) {
        const currentValues = [...modalSelectedValues];
        const index = currentValues.indexOf(value);
        const isCurrentlySelected = index > -1;

        if (isCurrentlySelected) {
          if (selectedQuestion === "languagesPref" && currentValues.length === 1) {
            Toast.show({
              type: "error",
              text1: "Selección requerida",
              text2: "Debes tener al menos un idioma seleccionado",
              position: "top",
            });
            return;
          }
          currentValues.splice(index, 1);
        } else {
          currentValues.push(value);
        }

        setModalSelectedValues(currentValues);
        handleUpdate(selectedQuestion, value);
      } else {
        setSelectedValue(value);
      }
    },
    [isArrayField, selectedQuestion, modalSelectedValues, handleUpdate],
  );

  const confirmSelection = useCallback(() => {
    if (isArrayField(selectedQuestion)) {
      if (selectedQuestion === "languagesPref" && modalSelectedValues.length === 0) {
        Toast.show({
          type: "error",
          text1: "Selección requerida",
          text2: "Debes seleccionar al menos un idioma",
          position: "top",
        });
        return;
      }

      closeModal();
    } else {
      if (!selectedValue) return;

      const options = QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? [];
      const selectedOption = options.find(option => option.value === selectedValue);
      const selectedLabel = selectedOption?.label ?? "";

      setSelectedAnswers(prev => ({ ...prev, [selectedQuestion]: selectedLabel }));
      handleUpdate(selectedQuestion, selectedValue);
      closeModal();
    }
  }, [
    isArrayField,
    selectedQuestion,
    modalSelectedValues,
    selectedValue,
    setSelectedAnswers,
    handleUpdate,
    closeModal,
  ]);

  const getSelectedLabel = useCallback(
    (questionKey: string) => selectedAnswers[questionKey] || "Seleccionar",
    [selectedAnswers],
  );

  return {
    modalVisible,
    selectedQuestion,
    selectedValue,
    modalSelectedValues,
    openSelectionModal,
    closeModal,
    handleModalSelect,
    confirmSelection,
    getSelectedLabel,
    isArrayField,
  };
};
