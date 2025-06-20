import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface SpotHeaderImageProps {
  image: string;
  onBack: () => void;
}

export default function SpotHeaderImage({ image, onBack }: SpotHeaderImageProps) {
  return (
    <View style={styles.headerImageContainer}>
      <Image source={{ uri: image }} style={styles.headerImage} />
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerImageContainer: {
    height: 360,
    width: "100%",
    position: "relative",
  },
  headerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 20,
    padding: 10,
  },
}); 