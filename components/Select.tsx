import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View, FlatList, Pressable } from "react-native";
import { ChevronDown, ChevronUp, Check } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

export interface SelectOption {
  label: string;
  value: string;
}

interface NativeSelectProps {
  options: SelectOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export default function NativeSelect({
  options,
  selectedValue,
  onValueChange,
  placeholder,
  disabled = false,
  error = false,
  className = "",
}: NativeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  const selectedOption = options.find(option => option.value === selectedValue);

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  const inputClass = `p-4 border rounded-xl flex-row items-center justify-between ${
    error ? "border-destructive" : "border-input"
  } ${disabled ? "opacity-50" : ""} bg-card`;

  const textClass = selectedOption ? "text-foreground" : "text-muted-foreground";

  return (
    <>
      <TouchableOpacity
        className={`${inputClass} ${className}`}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={{ backgroundColor: colors.card }}
      >
        <Text
          className={`flex-1 text-base font-normal ${textClass}`}
          style={{ color: colors.foreground }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color={colors.mutedForeground} />
        ) : (
          <ChevronDown size={20} color={colors.mutedForeground} />
        )}
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setIsOpen(false)}
        >
          <View className="w-4/5 max-h-96 rounded-2xl" style={{ backgroundColor: colors.card }}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="px-6 py-4 flex-row items-center justify-between border-b border-border"
                  onPress={() => handleSelect(item.value)}
                  style={{ borderBottomColor: colors.border }}
                >
                  <Text
                    className="flex-1 text-base font-normal"
                    style={{ color: colors.foreground }}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && <Check size={20} color={colors.primary} />}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              className="px-6 py-4 border-t border-border rounded-b-2xl"
              onPress={() => setIsOpen(false)}
              style={{
                backgroundColor: colors.muted,
                borderTopColor: colors.border,
              }}
            >
              <Text
                className="text-center text-base font-medium"
                style={{ color: colors.foreground }}
              >
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
