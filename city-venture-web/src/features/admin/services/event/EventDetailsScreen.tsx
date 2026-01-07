import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventDetails from "@/src/features/admin/services/event/components/EventDetails";
import EventForm from "@/src/features/admin/services/event/components/EventForm";
import { apiService } from "@/src/utils/api";
import type { Event, EventCategory } from "@/src/types/Event";
import PageContainer from "@/src/components/PageContainer";

const EventDetailsScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isEditVisible, setEditVisible] = useState(false);
  const [editStep, setEditStep] = useState(0);
  const [editEventData, setEditEventData] = useState<Event | undefined>(
    undefined
  );
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  if (!id) return null;

  const openEdit = async (step?: number) => {
    setEditStep(step ?? 0);
    try {
      // Fetch fresh data and categories
      const [eventData, categoriesData] = await Promise.all([
        apiService.getEventById(id),
        apiService.getEventCategories(),
      ]);
      setEditEventData(eventData);
      setCategories(categoriesData);
    } catch (e) {
      console.warn("Failed to prefetch event for edit", e);
      setEditEventData(undefined);
    }
    setEditVisible(true);
  };

  return (
    <PageContainer padding={20}>
      <EventDetails
        key={`${id}-${refreshTick}`}
        eventId={id}
        onBack={() => navigate(-1)}
        onEdit={openEdit}
      />
      <EventForm
        isVisible={isEditVisible}
        onClose={() => setEditVisible(false)}
        onEventUpdated={() => {
          setEditVisible(false);
          setRefreshTick((t) => t + 1);
        }}
        mode="edit"
        initialData={editEventData}
        categories={categories}
        initialStep={editStep}
      />
    </PageContainer>
  );
};

export default EventDetailsScreen;
