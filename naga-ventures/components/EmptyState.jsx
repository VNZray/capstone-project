import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

const EmptyState = ({ message }) => {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme].text;

  return (
    <View style={styles.container}>
      <Ionicons
        name="information-circle-outline"
        size={40}
        color={Colors[colorScheme].icon}
      />
      <ThemedText type="default2" style={[styles.text, { color: textColor }]}>
        {message}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "gray",
  },
});

export default EmptyState; 