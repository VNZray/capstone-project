import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TouristSpotDetails from "@/src/features/admin/services/tourist-spot/components/TouristSpotDetails";
import TouristSpotForm from "@/src/features/admin/services/tourist-spot/components/TouristSpotForm";
import { apiService } from "@/src/utils/api";
import type { TouristSpot } from "@/src/types/TouristSpot";

const TouristSpotDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditVisible, setEditVisible] = useState(false);
  const [editStep, setEditStep] = useState(0);
  const [editSpotData, setEditSpotData] = useState<TouristSpot | undefined>(
    undefined
  );
  const [refreshTick, setRefreshTick] = useState(0);

  if (!id) return null;

  const openEdit = async (step?: number) => {
    setEditStep(step ?? 0);
    try {
      // Try to fetch fresh data to prefill the form; fallback to empty
      const data = await apiService.getTouristSpotById(id);
      setEditSpotData(data);
    } catch (e) {
      console.warn("Failed to prefetch spot for edit", e);
      setEditSpotData(undefined);
    }
    setEditVisible(true);
  };

  return (
    <>
      <TouristSpotDetails
        key={`${id}-${refreshTick}`}
        spotId={id}
        onBack={() => navigate(-1)}
        onEdit={openEdit}
      />
      <TouristSpotForm
        isVisible={isEditVisible}
        onClose={() => setEditVisible(false)}
        onSpotUpdated={() => {
          setEditVisible(false);
          setRefreshTick((t) => t + 1);
        }}
        mode="edit"
        initialData={editSpotData}
        initialStep={editStep}
      />
    </>
  );
};

export default TouristSpotDetailsScreen;
