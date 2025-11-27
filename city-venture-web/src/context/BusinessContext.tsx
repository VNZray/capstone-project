import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import type { Business } from "@/src/types/Business";
import {
  getStoredBusinessId,
  setStoredBusinessId,
  clearStoredBusinessId,
  fetchBusinessDetails,
} from "@/src/services/BusinessService";
import { useAuth } from "./AuthContext";

interface BusinessContextType {
  selectedBusinessId: string | null;
  businessDetails: Business | null | undefined;
  loading: boolean;
  setBusinessId: (id: string) => void;
  clearBusinessId: () => void;
  refreshBusiness: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

interface BusinessProviderProps {
  children: ReactNode;
}

export const BusinessProvider: React.FC<BusinessProviderProps> = ({
  children,
}) => {
  const { user } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);

  // Load stored business ID on mount, but only if user is authenticated
  useEffect(() => {
    const loadStoredBusinessId = async () => {
      if (!user) {
        // Clear stored business ID if user logs out
        setSelectedBusinessId(null);
        return;
      }
      const id = await getStoredBusinessId();
      setSelectedBusinessId(id);
    };
    loadStoredBusinessId();
  }, [user]);

  const [businessDetails, setBusinessDetails] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);

  /** Set the selected business ID and store it locally */
  const setBusinessId = useCallback((id: string) => {
    setSelectedBusinessId(id);
    setStoredBusinessId(id);
  }, []);

  /** Clear selected business */
  const clearBusinessId = useCallback(() => {
    setSelectedBusinessId(null);
    setBusinessDetails(null);
    clearStoredBusinessId();
  }, []);

  /** Fetch business details from API */
  const fetchBusiness = useCallback(async () => {
    if (!selectedBusinessId || !user) return;
    setLoading(true);
    try {
      const data = await fetchBusinessDetails(selectedBusinessId);
      setBusinessDetails(data);
    } catch (error) {
      console.error("Failed to fetch business:", error);
      setBusinessDetails(null);
    } finally {
      setLoading(false);
    }
  }, [selectedBusinessId, user]);

  

  /** Fetch when ID changes */
  useEffect(() => {
    if (selectedBusinessId) {
      fetchBusiness();
    }
  }, [selectedBusinessId, fetchBusiness]);

  return (
    <BusinessContext.Provider
      value={{
        selectedBusinessId,
        businessDetails,
        loading,
        setBusinessId,
        clearBusinessId,
        refreshBusiness: fetchBusiness,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = (): BusinessContextType => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
};
