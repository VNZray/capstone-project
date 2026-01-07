import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ShopContextType = {};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const ShopProvider = ({ children }: ProviderProps) => {
  return <ShopContext.Provider value={{}}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within an ShopProvider');
  }
  return context;
};
