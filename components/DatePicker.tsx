/* eslint-disable react-native/no-inline-styles */
import { useState, useEffect, useRef } from "react";
import { Modal, Text, TouchableOpacity, View, Pressable, ScrollView, Animated } from "react-native";
import { Calendar, ChevronDown } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";

interface DatePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  maximumDate?: Date;
  minimumDate?: Date;
  initialDate?: Date;
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
  initialDate,
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
              initialDate={initialDate}
            />

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className="mt-4 p-4 rounded-lg"
              style={{ backgroundColor: colors.destructive }}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: colors.background,
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
  initialDate?: Date;
}

function CompactDatePicker({
  selectedDate,
  onDateSelect,
  colors,
  maximumDate,
  minimumDate,
  initialDate: propInitialDate,
}: CompactDatePickerProps) {
  const currentYear = new Date().getFullYear();
  const getToday = () => new Date();

  const getInitialDate = () => {
    const today = getToday();
    if (selectedDate) return selectedDate;
    if (propInitialDate) {
      if (maximumDate && propInitialDate > maximumDate) return maximumDate;
      if (minimumDate && propInitialDate < minimumDate) return minimumDate;
      return propInitialDate;
    }
    if (maximumDate && today > maximumDate) return maximumDate;
    if (minimumDate && today < minimumDate) return minimumDate;
    return today;
  };

  const initialDate = getInitialDate();
  const initialMonth = initialDate.getMonth();
  const initialYear = initialDate.getFullYear();
  const initialDayValue = initialDate.getDate();

  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);

  const monthOpacity = useRef(new Animated.Value(1)).current;
  const monthTranslateY = useRef(new Animated.Value(0)).current;
  const dayOpacity = useRef(new Animated.Value(1)).current;
  const dayTranslateY = useRef(new Animated.Value(0)).current;
  const yearScrollViewRef = useRef<ScrollView>(null);
  const scrollViewWidthRef = useRef<number>(0);

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
  const minYear = minimumDate ? minimumDate.getFullYear() : currentYear;
  const maxYear = maximumDate ? maximumDate.getFullYear() : currentYear + 1;
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const daysInMonthForInitial = new Date(initialYear, initialMonth + 1, 0).getDate();
  const initialDay = selectedDate
    ? Math.min(initialDate.getDate(), daysInMonthForInitial)
    : Math.min(initialDayValue, daysInMonthForInitial);

  const [selectedDay, setSelectedDay] = useState(initialDay);

  useEffect(() => {
    if (!selectedDate) {
      const dateToUse = propInitialDate || getToday();
      const currentYear = dateToUse.getFullYear();
      const currentMonth = dateToUse.getMonth();
      const currentDay = dateToUse.getDate();

      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);

      const maxDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const dayToSelect = Math.min(currentDay, maxDaysInMonth);
      setSelectedDay(dayToSelect);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDate) {
      setSelectedYear(selectedDate.getFullYear());
      setSelectedMonth(selectedDate.getMonth());
      const day = selectedDate.getDate();
      const maxDays = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + 1,
        0,
      ).getDate();
      setSelectedDay(day > maxDays ? maxDays : day);
    } else {
      const dateToUse = propInitialDate || getToday();
      const currentYear = dateToUse.getFullYear();
      const currentMonth = dateToUse.getMonth();
      const currentDay = dateToUse.getDate();
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      const maxDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      setSelectedDay(Math.min(currentDay, maxDaysInMonth));
    }
  }, [selectedDate, propInitialDate]);

  useEffect(() => {
    const yearIndex = years.findIndex(year => year === selectedYear);
    if (yearIndex !== -1 && yearScrollViewRef.current && scrollViewWidthRef.current > 0) {
      const itemWidth = 72;

      const itemPosition = yearIndex * itemWidth;
      const centerPosition = itemPosition - scrollViewWidthRef.current / 2 + itemWidth / 2;

      setTimeout(() => {
        yearScrollViewRef.current?.scrollTo({
          x: Math.max(0, centerPosition),
          animated: true,
        });
      }, 100);
    }
  }, [selectedYear, years]);

  const isDateValid = (year: number, month: number, day: number) => {
    const dateStart = new Date(year, month, day);

    // Validar contra minimumDate y maximumDate si están definidos
    if (maximumDate) {
      const maxDateStart = new Date(
        maximumDate.getFullYear(),
        maximumDate.getMonth(),
        maximumDate.getDate(),
      );
      if (dateStart > maxDateStart) return false;
    }
    if (minimumDate) {
      const minDateStart = new Date(
        minimumDate.getFullYear(),
        minimumDate.getMonth(),
        minimumDate.getDate(),
      );
      if (dateStart < minDateStart) return false;
    }

    // Solo aplicar validación de "no fechas pasadas" si NO hay minimumDate definido
    // (esto es para el caso de fecha preferida que debe ser hoy o futura)
    // Si hay minimumDate, confiar en esa validación (para cumpleaños, etc.)
    if (!minimumDate) {
      const today = getToday();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      // No permitir fechas pasadas (antes de hoy), pero permitir hoy
      if (dateStart < todayStart) return false;
    }

    return true;
  };

  useEffect(() => {
    monthOpacity.setValue(0);
    monthTranslateY.setValue(-20);

    Animated.parallel([
      Animated.timing(monthOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(monthTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedYear]);

  useEffect(() => {
    dayOpacity.setValue(0);
    dayTranslateY.setValue(-20);

    const delayTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(dayOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(dayTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    return () => clearTimeout(delayTimer);
  }, [selectedMonth]);

  useEffect(() => {
    if (!selectedDate) {
      const dateToUse = propInitialDate || getToday();
      const currentYear = dateToUse.getFullYear();
      const currentMonth = dateToUse.getMonth();
      const currentDay = dateToUse.getDate();

      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        const maxDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const dayToSelect = Math.min(currentDay, maxDaysInMonth);
        setSelectedDay(dayToSelect);
      }
    }
  }, [selectedYear, selectedMonth, selectedDate, propInitialDate]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Año */}
      <View style={{ marginBottom: 16 }}>
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "500", marginBottom: 8 }}
        >
          Año
        </Text>
        <ScrollView
          ref={yearScrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onLayout={event => {
            scrollViewWidthRef.current = event.nativeEvent.layout.width;
          }}
        >
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
      <Animated.View
        style={{
          marginBottom: 16,
          opacity: monthOpacity,
          transform: [{ translateY: monthTranslateY }],
        }}
      >
        <Text
          style={{ color: colors.foreground, fontSize: 14, fontWeight: "500", marginBottom: 8 }}
        >
          Mes
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {months.map((month, index) => {
            const monthStart = new Date(selectedYear, index, 1);
            const monthEnd = new Date(selectedYear, index + 1, 0);

            // Validar mes basándose en minimumDate y maximumDate si están definidos
            let isMonthValid = true;

            // Si hay minimumDate, el mes debe terminar después o en minimumDate
            if (minimumDate) {
              const minDateStart = new Date(
                minimumDate.getFullYear(),
                minimumDate.getMonth(),
                minimumDate.getDate(),
              );
              isMonthValid = isMonthValid && monthEnd >= minDateStart;
            } else {
              // Si NO hay minimumDate, aplicar validación de "no fechas pasadas"
              // (para fecha preferida que debe ser hoy o futura)
              const today = getToday();
              const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
              isMonthValid = isMonthValid && monthEnd >= todayStart;
            }

            // Si hay maximumDate, el mes debe empezar antes o en maximumDate
            if (maximumDate) {
              const maxDateStart = new Date(
                maximumDate.getFullYear(),
                maximumDate.getMonth(),
                maximumDate.getDate(),
              );
              isMonthValid = isMonthValid && monthStart <= maxDateStart;
            }

            if (!isMonthValid) return null;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedMonth(index)}
                style={{
                  width: "31%",
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
      </Animated.View>

      {/* Día */}
      <Animated.View
        style={{
          marginBottom: 16,
          opacity: dayOpacity,
          transform: [{ translateY: dayTranslateY }],
        }}
      >
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
      </Animated.View>
    </ScrollView>
  );
}
