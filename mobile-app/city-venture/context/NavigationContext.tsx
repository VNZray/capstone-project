import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react';
import type { ReactNode } from 'react';

interface NavigationContextType {
  // Tab visibility
  tabsVisible: boolean;
  setTabsVisible: (visible: boolean) => void;

  // Navigation guard state
  isNavigating: boolean;
  setIsNavigating: (navigating: boolean) => void;

  // Debounced navigation check
  canNavigate: () => boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [tabsVisible, setTabsVisible] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const lastNavigationTime = useRef<number>(0);

  const canNavigate = useCallback(() => {
    const now = Date.now();
    const DEBOUNCE_MS = 300; // Prevent navigation within 300ms

    if (isNavigating || now - lastNavigationTime.current < DEBOUNCE_MS) {
      return false;
    }

    lastNavigationTime.current = now;
    return true;
  }, [isNavigating]);

  return (
    <NavigationContext.Provider
      value={{
        tabsVisible,
        setTabsVisible,
        isNavigating,
        setIsNavigating,
        canNavigate,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      'useNavigationContext must be used within NavigationProvider'
    );
  }
  return context;
};
