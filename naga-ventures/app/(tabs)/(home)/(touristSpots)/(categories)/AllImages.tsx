import { ThemedView } from "@/components/ThemedView";
import { useLocalSearchParams } from "expo-router";
import { Dimensions, FlatList, Image, StyleSheet, View } from "react-native";

interface ImageItem {
  item: string;
}

const AllImagesScreen: React.FC = () => {
  const { images } = useLocalSearchParams<{ images: string }>();
  const imageList = typeof images === "string" ? images.split(",") : [];
  const screenWidth = Dimensions.get("window").width;
  const gap = 8;
  const imageWidth = (screenWidth - gap * 3) / 2; // 2 gaps between, 1 gap for padding

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={imageList}
        keyExtractor={(item: string, idx: number) => item + idx}
        numColumns={2}
        contentContainerStyle={styles.container}
        renderItem={({ item }: ImageItem) => (
          <View style={[styles.imageContainer, { width: imageWidth, height: imageWidth, margin: gap / 2 }]}>
            <Image source={{ uri: item }} style={styles.image} />
          </View>
        )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 16,
  },
});

export default AllImagesScreen;