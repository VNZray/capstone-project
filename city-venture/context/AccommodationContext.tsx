import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AccommodationContextType = {};

const AccommodationContext = createContext<
  AccommodationContextType | undefined
>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const AccommodationProvider = ({ children }: ProviderProps) => {
  return (
    <AccommodationContext.Provider value={{}}>
      {children}
    </AccommodationContext.Provider>
  );
};

export const useAccommodation = () => {
  const context = useContext(AccommodationContext);
  if (!context) {
    throw new Error(
      'useAccommodation must be used within an AccommodationProvider'
    );
  }
  return context;
};
