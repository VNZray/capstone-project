// Component that displays additional images of a tourist spot in a horizontal scrollable gallery
// Includes a "See All" button when there are more than 3 images

import { ThemedText } from "@/components/ThemedText";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface SpotMoreImagesProps {
  images: string[];
  onSeeAll: () => void;
}

const SpotMoreImages: React.FC<SpotMoreImagesProps> = ({ images, onSeeAll }) => {
  // Don't render if no images are available
  if (!images || images.length === 0) return null;
  
  // Show "See All" button only if there are more than 3 images
  const showSeeAll = images.length > 3;

  return (
    <View style={styles.section}>
      {/* Header with title and See All button */}
      <View style={styles.titleRow}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>More Images</ThemedText>
        {showSeeAll && (
          <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
            <ThemedText type="link" style={styles.seeAllText}>See All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      {/* Horizontally scrollable image gallery */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {images.map((image, index) => (
          <View key={image + index} style={styles.additionalImageContainer}>
            <Image source={{ uri: image }} style={styles.additionalImage} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  additionalImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 10,
  },
  additionalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  seeAllButton: {
    marginTop: 0,
    marginLeft: 10,
  },
  seeAllText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});

export default SpotMoreImages; 