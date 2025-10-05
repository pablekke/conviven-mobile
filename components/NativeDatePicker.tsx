import { Modal, Text, TouchableOpacity, View, Pressable } from "react-native";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import React, { useState } from "react";

interface NativeDatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function NativeDatePicker({
  value,
  onValueChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  error = false,
  className = "",
  maximumDate,
  minimumDate,
}: NativeDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  // Convertir string de fecha a Date
  const selectedDate = value ? new Date(value) : null;

  // Formatear fecha para mostrar
  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Generar años disponibles
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  // Generar días del mes
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onValueChange(dateString);
    setIsOpen(false);
  };

  const inputClass = `p-4 border rounded-xl flex-row items-center justify-between ${
    error ? "border-destructive" : "border-input"
  } ${disabled ? "opacity-50" : ""} bg-card`;

  const textClass = selectedDate ? "text-foreground" : "text-muted-foreground";

  return (
    <>
      <TouchableOpacity
        className={`${inputClass} ${className}`}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={{ backgroundColor: colors.card }}
      >
        <View className="flex-row items-center flex-1">
          <View className="mr-2">
            <Calendar size={20} color={colors.mutedForeground} />
          </View>
          <Text
            className={`flex-1 text-base font-normal ${textClass}`}
            style={{ color: colors.foreground }}
          >
            {selectedDate ? formatDisplayDate(value) : placeholder}
          </Text>
        </View>
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
          <Pressable
            className="w-4/5 max-h-96 rounded-2xl p-4"
            style={{ backgroundColor: colors.card }}
            onPress={e => e.stopPropagation()}
          >
            <Text
              className="text-lg font-semibold text-center mb-4"
              style={{ color: colors.foreground }}
            >
              Seleccionar Fecha
            </Text>

            <DatePickerContent
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              colors={colors}
              years={years}
              months={months}
              getDaysInMonth={getDaysInMonth}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
            />

            <TouchableOpacity
              className="px-6 py-4 border-t border-border rounded-b-2xl mt-4"
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
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface DatePickerContentProps {
  selectedDate: Date | null;
  onDateSelect: (year: number, month: number, day: number) => void;
  colors: any;
  years: number[];
  months: string[];
  getDaysInMonth: (year: number, month: number) => number;
  maximumDate?: Date;
  minimumDate?: Date;
}

function DatePickerContent({
  selectedDate,
  onDateSelect,
  colors,
  years,
  months,
  getDaysInMonth,
  maximumDate,
  minimumDate,
}: DatePickerContentProps) {
  const [selectedYear, setSelectedYear] = useState(
    selectedDate?.getFullYear() ?? new Date().getFullYear(),
  );
  const [selectedMonth, setSelectedMonth] = useState(
    selectedDate?.getMonth() ?? new Date().getMonth(),
  );

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const currentDay = selectedDate?.getDate() ?? 1;
  const [selectedDay, setSelectedDay] = useState(
    currentDay > daysInMonth ? daysInMonth : currentDay,
  );

  // Ajustar día si es inválido para el mes seleccionado
  React.useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedDay, daysInMonth]);

  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);

    if (maximumDate && date > maximumDate) return true;
    if (minimumDate && date < minimumDate) return true;

    return false;
  };

  return (
    <View className="flex-1 max-h-64">
      {/* Selector de Año */}
      <View className="mb-3">
        <Text className="text-sm font-medium mb-2" style={{ color: colors.foreground }}>
          Año
        </Text>
        <View
          className="max-h-24 border border-border rounded-lg"
          style={{ backgroundColor: colors.muted }}
        >
          <View className="flex-row flex-wrap p-2">
            {years.slice(0, 10).map(year => (
              <TouchableOpacity
                key={year}
                className={`px-3 py-1 m-1 rounded-md ${
                  selectedYear === year ? "bg-primary" : "bg-transparent"
                } ${isDateDisabled(year, selectedMonth, selectedDay) ? "opacity-50" : ""}`}
                onPress={() => setSelectedYear(year)}
                disabled={isDateDisabled(year, selectedMonth, selectedDay)}
                style={{
                  backgroundColor: selectedYear === year ? colors.primary : "transparent",
                }}
              >
                <Text
                  className="text-sm"
                  style={{
                    color: selectedYear === year ? colors.primaryForeground : colors.foreground,
                  }}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Selector de Mes */}
      <View className="mb-3">
        <Text className="text-sm font-medium mb-2" style={{ color: colors.foreground }}>
          Mes
        </Text>
        <View
          className="max-h-24 border border-border rounded-lg"
          style={{ backgroundColor: colors.muted }}
        >
          <View className="flex-row flex-wrap p-2">
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                className={`px-3 py-1 m-1 rounded-md ${
                  selectedMonth === index ? "bg-primary" : "bg-transparent"
                } ${isDateDisabled(selectedYear, index, selectedDay) ? "opacity-50" : ""}`}
                onPress={() => setSelectedMonth(index)}
                disabled={isDateDisabled(selectedYear, index, selectedDay)}
                style={{
                  backgroundColor: selectedMonth === index ? colors.primary : "transparent",
                }}
              >
                <Text
                  className="text-sm"
                  style={{
                    color: selectedMonth === index ? colors.primaryForeground : colors.foreground,
                  }}
                >
                  {month.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Selector de Día */}
      <View className="mb-3">
        <Text className="text-sm font-medium mb-2" style={{ color: colors.foreground }}>
          Día
        </Text>
        <View
          className="max-h-24 border border-border rounded-lg"
          style={{ backgroundColor: colors.muted }}
        >
          <View className="flex-row flex-wrap p-2">
            {days.map(day => (
              <TouchableOpacity
                key={day}
                className={`px-3 py-1 m-1 rounded-md ${
                  selectedDay === day ? "bg-primary" : "bg-transparent"
                } ${isDateDisabled(selectedYear, selectedMonth, day) ? "opacity-50" : ""}`}
                onPress={() => setSelectedDay(day)}
                disabled={isDateDisabled(selectedYear, selectedMonth, day)}
                style={{
                  backgroundColor: selectedDay === day ? colors.primary : "transparent",
                }}
              >
                <Text
                  className="text-sm"
                  style={{
                    color: selectedDay === day ? colors.primaryForeground : colors.foreground,
                  }}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Botón de confirmar */}
      <TouchableOpacity
        className={`px-6 py-3 bg-primary rounded-lg ${
          isDateDisabled(selectedYear, selectedMonth, selectedDay) ? "opacity-50" : ""
        }`}
        onPress={() => onDateSelect(selectedYear, selectedMonth, selectedDay)}
        disabled={isDateDisabled(selectedYear, selectedMonth, selectedDay)}
        style={{
          backgroundColor: colors.primary,
        }}
      >
        <Text
          className="text-center text-base font-medium"
          style={{ color: colors.primaryForeground }}
        >
          Confirmar
        </Text>
      </TouchableOpacity>
    </View>
  );
}
