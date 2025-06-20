import { ThemedText } from "@/components/ThemedText";
import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

interface SpotDetailsSectionProps {
  title: string;
  children: ReactNode;
}

export default function SpotDetailsSection({ title, children }: SpotDetailsSectionProps) {
  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
}); 