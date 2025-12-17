import { memo } from "react";
import { Text, TextProps } from "react-native";

type BudgetHighlightProps = TextProps & {
  value: string;
};

function BudgetHighlightComponent({ value, style, ...rest }: BudgetHighlightProps) {
  if (!value) return null;

  return (
    <Text {...rest} numberOfLines={1} className="text-white text-[20px] font-light" style={style}>
      {value}
    </Text>
  );
}

export const BudgetHighlight = memo(BudgetHighlightComponent);

export default BudgetHighlight;

