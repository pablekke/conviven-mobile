import { ProfileHeadline } from "../ui/ProfileHeadline";
import { BudgetHighlight } from "../ui/BudgetHighlight";
import { BasicInfoPills } from "../ui/BasicInfoPills";
import { StyleSheet, View } from "react-native";
import { memo } from "react";

interface CardCalloutProps {
  headline: string;
  budget: string;
  basicInfo: readonly string[];
}

export const CardCallout = memo(({ headline, budget, basicInfo }: CardCalloutProps) => {
  return (
    <View style={styles.callout}>
      <View style={styles.infoWrapper}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryText}>
            <ProfileHeadline text={headline} />
            <BudgetHighlight value={budget} className="mt-1" />
          </View>
        </View>
        <BasicInfoPills items={basicInfo} />
      </View>
    </View>
  );
});

CardCallout.displayName = "CardCallout";

const styles = StyleSheet.create({
  callout: {
    width: "100%",
    alignItems: "center",
    marginBottom: -30,
  },
  infoWrapper: {
    width: "100%",
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  summaryText: {
    flex: 1,
  },
});
