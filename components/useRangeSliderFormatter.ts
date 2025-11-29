import { useCallback } from "react";

interface UseRangeSliderFormatterParams {
  valueFormatter?: (value: number) => string;
}

export function useRangeSliderFormatter({ valueFormatter }: UseRangeSliderFormatterParams) {
  const formatValue = useCallback(
    (value: number) => {
      if (valueFormatter) {
        return valueFormatter(value);
      }
      // Formato por defecto: número simple
      return value.toString();
    },
    [valueFormatter],
  );

  return {
    formatValue,
  };
}
