import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type TouristSpotContextType = {};

const TouristSpotContext = createContext<
  TouristSpotContextType | undefined
>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const TouristSpotProvider = ({ children }: ProviderProps) => {
  return (
    <TouristSpotContext.Provider value={{}}>
      {children}
    </TouristSpotContext.Provider>
  );
};

export const useTouristSpot = () => {
  const context = useContext(TouristSpotContext);
  if (!context) {
    throw new Error(
      'useTouristSpot must be used within a TouristSpotProvider'
    );
  }
  return context;
};
