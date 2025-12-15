import { useCallback, useMemo, useState } from "react";
import { QUESTION_OPTIONS } from "../constants";

type SelectedAnswers = Record<string, string>;

type HandleUpdate = (questionKey: string, value: any) => void;

interface Params {
  isSaving: boolean;
  selectedAnswers: SelectedAnswers;
  setSelectedAnswers: React.Dispatch<React.SetStateAction<SelectedAnswers>>;
  profileData: any;
  handleUpdate: HandleUpdate;
}

interface Return {
  modalVisible: boolean;
  selectedQuestion: string;
  selectedValue: string;
  selectedValues: string[];
  open: (questionKey: string) => void;
  close: () => void;
  onSelect: (value: string) => void;
  confirm: () => void;
  isArrayField: (key: string) => boolean;
}

const isArrayFieldImpl = (key: string) => ["interests", "petsOwned"].includes(key);

export function useOtherTabsSelectionModal({
  isSaving,
  selectedAnswers,
  setSelectedAnswers,
  profileData,
  handleUpdate,
}: Params): Return {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [selectedValue, setSelectedValue] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const open = useCallback(
    (questionKey: string) => {
      if (isSaving) return;

      setSelectedQuestion(questionKey);

      if (isArrayFieldImpl(questionKey)) {
        let currentValues: string[] = [];
        if (questionKey === "interests" && profileData?.interests) {
          currentValues = profileData.interests;
        } else if (questionKey === "petsOwned" && profileData?.petsOwned) {
          currentValues = profileData.petsOwned;
        }

        setSelectedValues(currentValues);
        setSelectedValue("");
        setModalVisible(true);
        return;
      }

      const selectedLabel = selectedAnswers[questionKey];
      const options = QUESTION_OPTIONS[questionKey as keyof typeof QUESTION_OPTIONS];
      const selectedOption = options?.find(option => option.label === selectedLabel);
      setSelectedValue(selectedOption?.value ?? "");
      setSelectedValues([]);
      setModalVisible(true);
    },
    [isSaving, profileData, selectedAnswers],
  );

  const close = useCallback(() => {
    setModalVisible(false);
    setSelectedQuestion("");
    setSelectedValue("");
    setSelectedValues([]);
  }, []);

  const onSelect = useCallback(
    (value: string) => {
      setSelectedValues(prev => {
        if (!isArrayFieldImpl(selectedQuestion)) return prev;
        if (prev.includes(value)) return prev.filter(v => v !== value);
        return [...prev, value];
      });

      if (!isArrayFieldImpl(selectedQuestion)) {
        setSelectedValue(value);
      }
    },
    [selectedQuestion],
  );

  const confirm = useCallback(() => {
    if (!selectedQuestion) return;

    if (isArrayFieldImpl(selectedQuestion)) {
      const values = selectedValues;
      const options = QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? [];
      const labels = values
        .map(v => options.find(o => o.value === v)?.label)
        .filter(Boolean) as string[];
      const joinedLabels = labels.join(", ");

      setSelectedAnswers(prev => ({ ...prev, [selectedQuestion]: joinedLabels }));
      handleUpdate(selectedQuestion, values);
      close();
      return;
    }

    if (!selectedValue) return;

    const options = QUESTION_OPTIONS[selectedQuestion as keyof typeof QUESTION_OPTIONS] ?? [];
    const selectedOption = options.find(option => option.value === selectedValue);
    const label = selectedOption?.label ?? "";

    setSelectedAnswers(prev => ({ ...prev, [selectedQuestion]: label }));
    handleUpdate(selectedQuestion, selectedValue);
    close();
  }, [close, handleUpdate, selectedQuestion, selectedValue, selectedValues, setSelectedAnswers]);

  const isArrayField = useMemo(() => isArrayFieldImpl, []);

  return {
    modalVisible,
    selectedQuestion,
    selectedValue,
    selectedValues,
    open,
    close,
    onSelect,
    confirm,
    isArrayField,
  };
}
