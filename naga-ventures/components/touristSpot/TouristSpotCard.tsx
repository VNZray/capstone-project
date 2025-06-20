// Reusable card component for displaying tourist spots in different layouts
// Supports three variants: grid, carousel, and list views

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { TouristSpot } from "@/context/TouristSpotContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";

interface TouristSpotCardProps {
  spot: TouristSpot;
  onPress: () => void;
  variant?: "grid" | "carousel" | "list";
}

const TouristSpotCard: React.FC<TouristSpotCardProps> = ({ spot, onPress, variant = "grid" }) => {
  const colorScheme = useColorScheme();
  const cardBackgroundColor = colorScheme === "dark" ? "#1E293B" : "#fff";
  const shadowColor = colorScheme === "dark" ? "#000" : "#ccc";

  // Carousel variant - Large image with overlay text
  if (variant === "carousel") {
    return (
      <TouchableOpacity
        style={styles.carouselItem}
        onPress={onPress}
      >
        <Image
          source={{ uri: spot.image }}
          style={styles.carouselImage}
          resizeMode="cover"
        />
        <View style={styles.carouselOverlay} />
        <View style={styles.carouselTextContainer}>
          <ThemedText type="cardTitle" style={styles.carouselTitle}>{spot.name}</ThemedText>
        </View>
      </TouchableOpacity>
    );
  }

  // Grid variant - Square image with overlay text
  if (variant === "grid") {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        onPress={onPress}
      >
        <View style={styles.gridImageContainer}>
          <Image
            source={{ uri: spot.image }}
            style={styles.gridImage}
            resizeMode="cover"
          />
          <View style={styles.gridOverlay} />
          <View style={styles.gridTextContainer}>
            <ThemedText type="cardTitle" style={styles.gridTitle} numberOfLines={1}>
              {spot.name}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // List variant - Horizontal layout with image and details
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.listCard,
        { backgroundColor: cardBackgroundColor, shadowColor },
      ]}
    >
      <Image source={{ uri: spot.image }} style={styles.listImage} />
      <View style={styles.listDetails}>
        <ThemedText type="cardTitle" style={styles.listName}>
          {spot.name}
        </ThemedText>
        <ThemedText type="default2" style={styles.listDescription}>
          {spot.description}
        </ThemedText>
        <View style={styles.listFooter}>
          <View style={styles.location}>
            <Ionicons name="location" size={16} color={Colors[colorScheme].tint} />
            <ThemedText type="default2" style={styles.locationText}>{spot.location}</ThemedText>
          </View>
          <View style={styles.detailsButton}>
            <ThemedText type="default2" style={styles.detailsButtonText}>View Details</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Carousel variant styles
  carouselItem: {
    borderRadius: 15,
    margin: 5,
    overflow: "hidden",
    height: "100%",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 15,
  },
  carouselTextContainer: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
  },
  carouselTitle: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },

  // Grid variant styles
  gridCard: {
    width: "48%",
    marginBottom: 15,
  },
  gridImageContainer: {
    height: 120,
    borderRadius: 10,
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  gridTextContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
  },
  gridTitle: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins-SemiBold",
  },

  // List variant styles
  listCard: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 15,
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  listImage: {
    width: "100%",
    height: 200,
  },
  listDetails: {
    padding: 15,
  },
  listName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  listDescription: {
    fontSize: 12,
    color: "gray",
    marginBottom: 10,
  },
  listFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    marginLeft: 5,
    color: "#007AFF",
    fontSize: 12,
  },
  detailsButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  detailsButtonText: {
    color: "#333",
    fontSize: 12,
  },
});

export default TouristSpotCard; 