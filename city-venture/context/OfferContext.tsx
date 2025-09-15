import React, {
    createContext,
    ReactNode,
    useContext
} from 'react';

type OfferContextType = {};

const OfferContext = createContext<
  OfferContextType | undefined
>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const OfferProvider = ({ children }: ProviderProps) => {
  return (
    <OfferContext.Provider value={{}}>
      {children}
    </OfferContext.Provider>
  );
};

export const useOffer = () => {
  const context = useContext(OfferContext);
  if (!context) {
    throw new Error(
      'useOffer must be used within an OfferProvider'
    );
  }
  return context;
};
