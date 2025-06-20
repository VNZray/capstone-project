import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

interface SpotLocationRowProps {
  location: string;
  iconColor: string;
}

export default function SpotLocationRow({ location, iconColor }: SpotLocationRowProps) {
  if (!location) return null;
  return (
    <View style={styles.locationContainer}>
      <Ionicons name="location-outline" size={16} color={iconColor} />
      <ThemedText type="default2" style={styles.locationText}>{location}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: -5,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: "gray",
    marginLeft: 5,
  },
}); 