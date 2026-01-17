import { AppHeader } from '@/components/header/AppHeader';
import { Stack } from 'expo-router';
import React, { createContext, useContext, useState } from 'react';
import { Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Context to share refresh function between layout and index
type BookingsContextType = {
  onRefresh: () => void;
  setOnRefresh: (fn: () => void) => void;
  isRefreshing: boolean;
  setIsRefreshing: (value: boolean) => void;
};

const BookingsContext = createContext<BookingsContextType | null>(null);

export const useBookingsHeader = () => {
  const context = useContext(BookingsContext);
  if (!context) {
    throw new Error('useBookingsHeader must be used within BookingsLayout');
  }
  return context;
};

const BookingsLayout = () => {
  const [onRefresh, setOnRefresh] = useState<() => void>(() => () => {});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <BookingsContext.Provider
      value={{
        onRefresh: handleRefresh,
        setOnRefresh: (fn) => setOnRefresh(() => fn),
        isRefreshing,
        setIsRefreshing,
      }}
    >
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            animation: 'slide_from_right',
            header() {
              return (
                <AppHeader
                  backButton
                  title="My Bookings"
                  background="primary"
                  rightComponent={
                    <Pressable
                      onPress={handleRefresh}
                      disabled={isRefreshing}
                      style={{
                        padding: 8,
                        opacity: isRefreshing ? 0.6 : 1,
                      }}
                    >
                      {isRefreshing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="refresh" size={22} color="#FFFFFF" />
                      )}
                    </Pressable>
                  }
                />
              );
            },
          }}
        />
      </Stack>
    </BookingsContext.Provider>
  );
};

export default BookingsLayout;
