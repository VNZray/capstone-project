import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { useAuth } from "@/src/context/AuthContext";
import type { Business } from "../types/Business";
const API_URL = "http://192.168.1.2:3000/api";

interface BusinessContextType {
  selectedBusinessId: string | null;
  businessDetails: Business | null;
  loading: boolean;
  setBusinessId: (id: string) => void;
  clearBusinessId: () => void;
  refreshBusiness: () => Promise<void>;
    API_URL: typeof API_URL;

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
  const { API_URL, user } = useAuth();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    () => localStorage.getItem("selectedBusinessId") || null
  );
  const [businessDetails, setBusinessDetails] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);

  /** Set the selected business ID and store it locally */
  const setBusinessId = useCallback((id: string) => {
    setSelectedBusinessId(id);
    localStorage.setItem("selectedBusinessId", id);
  }, []);

  /** Clear selected business */
  const clearBusinessId = useCallback(() => {
    setSelectedBusinessId(null);
    setBusinessDetails(null);
    localStorage.removeItem("selectedBusinessId");
  }, []);

  /** Fetch business details from API */
  const fetchBusiness = useCallback(async () => {
    if (!selectedBusinessId) return;
    setLoading(true);
    try {
      const { data } = await axios.get<Business>(
        `${API_URL}/business/${selectedBusinessId}`
      );
      setBusinessDetails(data);
    } catch (error) {
      console.error("Failed to fetch business:", error);
      setBusinessDetails(null);
    } finally {
      setLoading(false);
    }
  }, [API_URL, selectedBusinessId]);

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
        API_URL
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
