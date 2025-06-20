import { useFonts } from 'expo-font';
import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme as useRNColorScheme } from 'react-native';

export function useColorScheme() {
    const scheme = useRNColorScheme();
    return scheme === 'dark' ? 'dark' : 'light';
}

type PressableButtonProps = {
    direction?: 'row' | 'column';
    backgroundColor?: string;
    gap?: number;
    color?: string;
    width?: number;
    height?: number;
    Title?: string;
    type?: 'primary' | 'secondary' | 'tertiary';
    IconSize?: number;
    onPress?: () => void;
    onLongPress?: () => void;
}

const primaryColor = '#0A1B47';
const secondaryColor = '#0077B6';
const tertiaryColor = '#DEE3F2';

const ButtonComponent = ({
    Title,
    backgroundColor,
    color,
    direction,
    gap,
    type,
    onPress,
    onLongPress,
}: PressableButtonProps) => {
    const [fontsLoaded] = useFonts({
        'Poppins-Black': require('@/assets/fonts/Poppins/Poppins-Black.ttf'),
        'Poppins-Regular': require('@/assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-SemiBold': require('@/assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('@/assets/fonts/Poppins/Poppins-Bold.ttf'),
    });

    if (!fontsLoaded) return null;

    return (
        <Pressable
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
                styles[type ?? 'primary'],
                {
                    flexDirection: direction || 'row',
                    gap: gap || 5,
                    opacity: pressed ? 0.6 : 1,
                },
            ]}
        >
            {Title && <Text style={[styles.text, { color }]}>{Title}</Text>}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
    },
    icon: {
        marginRight: 0,
    },
    text: {
        fontFamily: 'Poppins-Bold',
        fontSize: 10,
        textAlign: 'center',
    },
    primary: {
        backgroundColor: primaryColor,
        color: useColorScheme() === 'light' ? '#ffffff' : '#000000',
    },
    secondary: {
        backgroundColor: secondaryColor,
        color: useColorScheme() === 'light' ? '#ffffff' : '#000000',
    },
    tertiary: {
        backgroundColor: tertiaryColor,
        color: useColorScheme() === 'dark' ? '#ffffff' : '#000000',
    },
});

export default ButtonComponent;
