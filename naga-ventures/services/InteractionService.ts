import type { ShopData, ShopLocation } from '@/types/shop'; // Assuming ShopLocation is also in shop.ts
import { Alert, Linking, Platform, Share } from 'react-native';

export const callPhoneNumber = (
  phoneNumber: string | undefined,
  shopName?: string
) => {
  if (phoneNumber) {
    const url =
      Platform.OS === 'android'
        ? `tel:${phoneNumber}`
        : `telprompt:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert(
            'Phone Error',
            'Phone calls are not supported on this device.'
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => Alert.alert('Phone Error', err.message));
  } else {
    Alert.alert(
      'No Phone Number',
      `This shop${
        shopName ? ' (' + shopName + ')' : ''
      } has not provided a phone number.`
    );
  }
};

export const openDirections = (
  shopName: string,
  location?: string,
  mapLocation?: ShopLocation
) => {
  if (mapLocation?.latitude && mapLocation?.longitude) {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${mapLocation.latitude},${mapLocation.longitude}`;
    const label = shopName;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url).catch((err) =>
        Alert.alert(
          'Directions Error',
          'Could not open map directions. ' + err.message
        )
      );
    } else {
      Alert.alert('Directions Error', 'Could not construct map URL.');
    }
  } else if (location) {
    const encodedAddress = encodeURIComponent(location);
    const mapUrl = Platform.select({
      ios: `maps:?q=${encodedAddress}`,
      android: `geo:0,0?q=${encodedAddress}`,
    });
    if (mapUrl) {
      Linking.openURL(mapUrl).catch((err) =>
        Alert.alert(
          'Directions Error',
          'Could not open map with address. ' + err.message
        )
      );
    } else {
      Alert.alert(
        'No Directions',
        'Map directions are not available for this shop.'
      );
    }
  } else {
    Alert.alert(
      'No Directions',
      'Map directions are not available for this shop.'
    );
  }
};

export const openWebsite = (
  websiteUrl: string | undefined,
  shopName?: string
) => {
  if (websiteUrl) {
    let url = websiteUrl;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    Linking.openURL(url).catch((err) =>
      Alert.alert('Website Error', 'Could not open website. ' + err.message)
    );
  } else {
    Alert.alert(
      'No Website',
      `This shop${
        shopName ? ' (' + shopName + ')' : ''
      } has not provided a website link.`
    );
  }
};

export const shareShop = async (shop: ShopData | null | undefined) => {
  if (!shop) {
    Alert.alert('Share Error', 'Cannot share shop details at the moment.');
    return;
  }
  try {
    let message = `Check out ${shop.name} on NagaVenture!`;
    if (shop.location) {
      message += ` Located at: ${shop.location}`;
    }
    // You could add a deep link or a web URL for the shop here if available
    // e.g., const url = shop.deepLink || shop.socialLinks?.website;

    await Share.share({
      message: message,
      // url: url, // Uncomment and use if you have a URL to share
      title: `Discover ${shop.name}`,
    });
  } catch (error: any) {
    Alert.alert('Share Error', error.message);
  }
};
