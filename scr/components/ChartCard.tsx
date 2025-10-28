// scr/components/ChartCard.tsx
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import C from "../theme/colors";

export const screenWidth = Dimensions.get("window").width;

export const chartConfig = {
  backgroundColor: C.surface,
  backgroundGradientFrom: C.primarySoft,
  backgroundGradientTo: C.primarySoft,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 102, 204, ${opacity})`,      // primary
  labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,   // text
  propsForLabels: { fontSize: 10 },
  propsForDots: { r: "4" },
  propsForBackgroundLines: { stroke: "#E0E8FF" },
};

export default function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={{ marginTop: 8 }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 12,
    marginTop: 14,
  },
  title: { fontSize: 16, fontWeight: "700", color: C.primary },
});
