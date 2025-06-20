import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/utils/supabase';

type FavoriteButtonProps = {
  id: string | number; // ID of the business or room
  table?: 'Business' | 'Room' | 'Spot' | 'Event';
  isFav?: boolean;
  size?: number;
  color?: string;
  onToggle?: (isFavorite: boolean) => void;
};

const FavoriteButton = ({
  id,
  table = 'Business',
  isFav = false,
  size = 28,
  color = '#FF4E4E',
  onToggle,
}: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(isFav);
  const [updating, setUpdating] = useState(false);

  const toggleFavorite = async () => {
    const newValue = !isFavorite;
    setUpdating(true);

    const { error } = await supabase
      .from(table)
      .update({ 'isFav': newValue })
      .eq('id', id);

    setUpdating(false);

    if (error) {
      console.error(`[❌] Failed to update favorite (ID: ${id}, Table: ${table}):`, error);
      Alert.alert('Error', 'Failed to update favorite status.');
    } else {
      console.log(`[✅] Favorite status updated successfully to "${newValue}" (ID: ${id}, Table: ${table})`);
      setIsFavorite(newValue);
      onToggle?.(newValue);
    }
  };

  return (
    <Pressable onPress={toggleFavorite} style={styles.button} disabled={updating}>
      <MaterialCommunityIcons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={size}
        color={color}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});

export default FavoriteButton;
