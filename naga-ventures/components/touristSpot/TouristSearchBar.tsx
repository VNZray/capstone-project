import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { StyleSheet, TextInput, View } from "react-native";

interface TouristSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const TouristSearchBar: React.FC<TouristSearchBarProps> = ({ value, onChangeText, placeholder }) => {
  const colorScheme = useColorScheme();
  const textColor = Colors[colorScheme].text;

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={colorScheme === "dark" ? "#8E9196" : "#9F9EA1"}
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default TouristSearchBar; 