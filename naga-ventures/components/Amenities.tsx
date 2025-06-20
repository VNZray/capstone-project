import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import React from 'react';
import { Text, View } from 'react-native';

type AmenitiesProps = {
    direction?: 'row' | 'column';
    gap?: number;
    color?: string;
    title?: string;
    icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
    iconSize?: number;
    textSize?: number;
}

const Amenities = ({
    title,
    icon,
    color,
    iconSize,
    textSize,
}: AmenitiesProps) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <View style={{display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center'}}>
            <MaterialCommunityIcons name={icon} size={iconSize} color={color} />
            <Text style={{ fontSize: textSize, color: color }}>
                {title}
            </Text>
        </View>
    );
};

export default Amenities;
