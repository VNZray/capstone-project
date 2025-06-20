import { ThemedText } from "@/components/ThemedText";
import { FavoriteAction } from "@/context/TouristSpotContext";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface SpotTitleRowProps {
  name: string;
  onFavorite: FavoriteAction;
  isFavorite: boolean;
  textColor: string;
}

const SpotTitleRow: React.FC<SpotTitleRowProps> = ({ name, onFavorite, isFavorite, textColor }) => {
  return (
    <View style={styles.titleRow}>
      <ThemedText type="title" style={styles.spotTitle}>{name}</ThemedText>
      <TouchableOpacity style={styles.favoriteButton} onPress={onFavorite}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={textColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotTitle: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  favoriteButton: {
    padding: 10,
  },
});

export default SpotTitleRow; 