import React, {
    createContext,
    ReactNode,
    useContext
} from 'react';

type EventContextType = {};

const EventContext = createContext<
  EventContextType | undefined
>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const EventProvider = ({ children }: ProviderProps) => {
  return (
    <EventContext.Provider value={{}}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error(
      'useEvent must be used within an EventProvider'
    );
  }
  return context;
};
