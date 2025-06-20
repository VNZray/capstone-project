import ShopDirectory from '@/components/shops/ShopDirectory';
import { mainCategories } from '@/Controller/ShopData';
import React, { useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Text, TouchableOpacity, View } from 'react-native';

// Error fallback
const ShopErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <View
    style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
      Oops! Something went wrong
    </Text>
    <TouchableOpacity
      onPress={resetErrorBoundary}
      style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}
    >
      <Text style={{ color: 'white' }}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

const ShopsIndex = () => {
  // Memoize category transformation
  const categories = useMemo(
    () =>
      mainCategories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      })),
    []
  );

  return (
    <ErrorBoundary
      FallbackComponent={ShopErrorFallback}
      onError={(error) => {
        // TODO: Add crash reporting (Crashlytics, Sentry)
        console.error('Shop Directory Error:', error);
      }}
    >
      <ShopDirectory categories={categories} />
    </ErrorBoundary>
  );
};

export default React.memo(ShopsIndex);
