import React, {
    createContext,
    ReactNode,
    useContext
} from 'react';

type RoomContextType = {};

const RoomContext = createContext<
  RoomContextType | undefined
>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const RoomProvider = ({ children }: ProviderProps) => {
  return (
    <RoomContext.Provider value={{}}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error(
      'useRoom must be used within an RoomProvider'
    );
  }
  return context;
};
