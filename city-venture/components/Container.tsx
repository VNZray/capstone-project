import React, { ReactNode } from 'react'
import {
    Platform,
    StyleProp,
    StyleSheet,
    useColorScheme,
    View,
    ViewStyle,
} from 'react-native'

type Variant = 'solid' | 'soft' | 'outlined'

type ContainerProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  elevation?: 1 | 2 | 3 | 4 | 5 | 6
  width?: number | string
  height?: number | string
  direction?: 'row' | 'column'
  padding?: number
  margin?: number
  gap?: number
  backgroundColor?: string
  flex?: number
  lightColor?: string
  darkColor?: string
  variant?: Variant
  justify?: ViewStyle['justifyContent'] // ✅ new
  align?: ViewStyle['alignItems']       // ✅ new
  radius?: number | string
}

const Container = ({
  children,
  style,
  elevation = 1,
  width = '100%',
  height,
  direction = 'column',
  padding = 20,
  margin = 0,
  gap = 20,
  flex,
  backgroundColor,
  lightColor = '#fff',
  darkColor = '#121212',
  variant = 'solid',
  justify,
  align,
  radius,
}: ContainerProps) => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const bgColor = backgroundColor ?? (isDark ? darkColor : lightColor)

  const variantStyle = getVariantStyle(variant, bgColor, isDark)

  return (
    <View
      style={[
        styles.base,
        {
          flex,
          width,
          height,
          flexDirection: direction,
          padding,
          margin,
          gap,
          justifyContent: justify,
          alignItems: align,      
          borderRadius: radius,
        } as ViewStyle,
        variantStyle,
        getPlatformElevation(elevation),
        style,
      ]}
    >
      {children}
    </View>
  )
}

export default Container

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
  },
})

function getPlatformElevation(level: number): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: level }
  }

  switch (level) {
    case 1:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      }
    case 2:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.15,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      }
    case 3:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
      }
    case 4:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.25,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 4 },
      }
    case 5:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 5 },
      }
    case 6:
      return {
        shadowColor: '#1e1e1e',
        shadowOpacity: 0.35,
        shadowRadius: 7,
        shadowOffset: { width: 0, height: 6 },
      }
    default:
      return {}
  }
}

function getVariantStyle(
  variant: Variant,
  bgColor: string,
  isDark: boolean
): ViewStyle {
  switch (variant) {
    case 'solid':
      return {
        backgroundColor: bgColor,
      }
    case 'soft':
      return {
        backgroundColor: addOpacity(bgColor, isDark ? 0.4 : 0.4),
      }
    case 'outlined':
      return {
        backgroundColor: addOpacity(bgColor, 0.02),
        borderWidth: 1,
        borderColor: addOpacity(bgColor, isDark ? 0.4 : 0.25),
      }
    default:
      return {}
  }
}

function addOpacity(color: string, opacity: number): string {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${opacity})`)
  }

  if (color.startsWith('rgb')) {
    return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`)
  }

  let hex = color.replace('#', '')
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
