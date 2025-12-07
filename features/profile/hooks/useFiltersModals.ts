import { useState, useCallback } from "react";
import { QUESTION_OPTIONS } from "../constants";

interface UseFiltersModalsProps {
  selectedAnswers: Record<string, string>;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleUpdate: (question: string, value: string) => void;
  isSaving: boolean;
}

export const useFiltersModals = ({
  selectedAnswers,
  setSelectedAnswers,
  handleUpdate,
  isSaving,
}: UseFiltersModalsProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [neighborhoodModalVisible, setNeighborhoodModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedValue, setSelectedValue] = useState("");

  const openSelectionModal = useCallback(
    (questionKey: string) => {
      if (isSaving) return;

      if (questionKey === "preferredNeighborhoods" || questionKey === "mainPreferredNeighborhood") {
        setNeighborhoodModalVisible(true);
        setSelectedQuestion(questionKey);
        return;
      }

      setSelectedQuestion(questionKey);
      const selectedLabel = selectedAnswers[questionKey];
      const options = QUESTION_OPTIONS[questionKey as keyof typeof QUESTION_OPTIONS];
      const selectedOption = options?.find(option => option.label === selectedLabel);
      setSelectedValue(selectedOption?.value ?? "");
      setModalVisible(true);
    },
    [selectedAnswers, isSaving],
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedQuestion("");
    setSelectedValue("");
  }, []);

  const confirmSelection = useCallback(() => {
    const options = QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? [];
    const selectedOption = options.find(option => option.value === selectedValue);
    const selectedLabel = selectedOption?.label ?? "";

    setSelectedAnswers(prev => ({ ...prev, [selectedQuestion]: selectedLabel }));
    handleUpdate(selectedQuestion, selectedValue);
    closeModal();
  }, [selectedQuestion, selectedValue, setSelectedAnswers, handleUpdate, closeModal]);

  const closeNeighborhoodModal = useCallback(() => {
    setNeighborhoodModalVisible(false);
    setSelectedQuestion("");
  }, []);

  const getSelectedLabel = useCallback(
    (questionKey: string) => selectedAnswers[questionKey] || "Seleccionar",
    [selectedAnswers],
  );

  return {
    modalVisible,
    neighborhoodModalVisible,
    selectedQuestion,
    selectedValue,
    openSelectionModal,
    closeModal,
    confirmSelection,
    closeNeighborhoodModal,
    setSelectedValue,
    getSelectedLabel,
  };
};
