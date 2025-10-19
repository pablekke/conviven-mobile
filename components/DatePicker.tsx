/* eslint-disable react-native/no-inline-styles */
import React, { useState } from "react";
import { Modal, Text, TouchableOpacity, View, Pressable, ScrollView } from "react-native";
import { Calendar, ChevronDown } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface DatePickerProps {
  value: string; // Formato YYYY-MM-DD
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DatePicker({
  value,
  onValueChange,
  placeholder = "Selecciona una fecha",
  disabled = false,
  error = false,
  className = "",
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { colors } = useTheme();

  const selectedDate = value
    ? (() => {
        const [year, month, day] = value.split("-").map(Number);
        return new Date(year, month - 1, day);
      })()
    : null;

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
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
          <Calendar size={20} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <Text
            className={`flex-1 text-base font-normal ${textClass}`}
            style={{ color: colors.foreground }}
          >
            {selectedDate ? formatDisplayDate(value) : placeholder}
          </Text>
        </View>
        <ChevronDown size={20} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable className="flex-1 justify-end bg-black/50" onPress={() => setIsOpen(false)}>
          <Pressable
            className="rounded-t-2xl p-4 bg-card"
            style={{
              backgroundColor: colors.card,
              maxHeight: "70%",
            }}
            onPress={e => e.stopPropagation()}
          >
            <View className="items-center mb-4">
              <View
                className="w-10 h-1 rounded-sm mb-2"
                style={{ backgroundColor: colors.border }}
              />
              <Text style={{ color: colors.foreground, fontSize: 18, fontWeight: "600" }}>
                Seleccionar Fecha
              </Text>
            </View>

            <CompactDatePicker
              selectedDate={selectedDate}
              onDateSelect={(year, month, day) => {
                const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                onValueChange(dateString);
                setIsOpen(false);
              }}
              colors={colors}
              maximumDate={maximumDate}
              minimumDate={minimumDate}
            />

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className="mt-4 p-3 rounded-lg"
              style={{ backgroundColor: colors.muted }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: "500",
                }}
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

interface CompactDatePickerProps {
  selectedDate: Date | null;
  onDateSelect: (year: number, month: number, day: number) => void;
  colors: any;
  maximumDate?: Date;
  minimumDate?: Date;
}

function CompactDatePicker({
  selectedDate,
  onDateSelect,
  colors,
  maximumDate,
  minimumDate,
}: CompactDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(selectedDate?.getFullYear() ?? currentYear);
  const [selectedMonth, setSelectedMonth] = useState(selectedDate?.getMonth() ?? 0);

  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  const years = Array.from({ length: 80 }, (_, i) => currentYear - i).filter(year => {
    if (maximumDate && year > maximumDate.getFullYear()) return false;
    if (minimumDate && year < minimumDate.getFullYear()) return false;
    return true;
  });

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const [selectedDay, setSelectedDay] = useState(selectedDate?.getDate() ?? 1);

  const isDateValid = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    if (maximumDate && date > maximumDate) return false;
    if (minimumDate && date < minimumDate) return false;
    return true;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Año */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "500", marginBottom: 8 }}
        >
          Año
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row" }}>
            {years.map(year => (
              <TouchableOpacity
                key={year}
                onPress={() => setSelectedYear(year)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  marginRight: 8,
                  borderRadius: 6,
                  backgroundColor: selectedYear === year ? colors.primary : colors.muted,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: selectedYear === year ? colors.primaryForeground : colors.foreground,
                    fontWeight: selectedYear === year ? "600" : "400",
                  }}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Mes */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "500", marginBottom: 8 }}
        >
          Mes
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {months.map((month, index) => {
            const isMonthValid = isDateValid(selectedYear, index, 1);
            if (!isMonthValid) return null;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedMonth(index)}
                style={{
                  width: "14%",
                  paddingVertical: 8,
                  margin: "1%",
                  borderRadius: 6,
                  backgroundColor: selectedMonth === index ? colors.primary : colors.muted,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedMonth === index ? colors.primaryForeground : colors.foreground,
                    fontWeight: selectedMonth === index ? "600" : "400",
                  }}
                >
                  {month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Día */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "500", marginBottom: 8 }}
        >
          Día
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {days.map(day => {
            const isValid = isDateValid(selectedYear, selectedMonth, day);
            if (!isValid) return null;

            return (
              <TouchableOpacity
                key={day}
                onPress={() => {
                  setSelectedDay(day);
                  onDateSelect(selectedYear, selectedMonth, day);
                }}
                style={{
                  width: "12%",
                  paddingVertical: 8,
                  margin: "1%",
                  borderRadius: 6,
                  backgroundColor: selectedDay === day ? colors.primary : colors.muted,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: selectedDay === day ? colors.primaryForeground : colors.foreground,
                    fontWeight: selectedDay === day ? "600" : "400",
                  }}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
