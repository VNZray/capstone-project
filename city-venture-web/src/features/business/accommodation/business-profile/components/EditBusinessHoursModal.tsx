import * as React from "react";
import BaseEditModal from '@/src/components/BaseEditModal';
import { updateData, insertData, getData } from "@/src/services/Service";
import Container from "@/src/components/Container";
import type { BusinessHours } from "@/src/types/Business";

interface EditBusinessHoursModalProps {
  open: boolean;
  businessId?: string;
  initialBusinessHours: BusinessHours[];
  onClose: () => void;
  onUpdate?: (updatedHours: BusinessHours[]) => void;
}

const defaultWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const EditBusinessHoursModal: React.FC<EditBusinessHoursModalProps> = ({
  open,
  businessId,
  initialBusinessHours,
  onClose,
  onUpdate,
}) => {
  // if no initial hours, create defaults so the user can edit them
  const init = (initialBusinessHours && initialBusinessHours.length > 0)
    ? initialBusinessHours
  : defaultWeek.map((d) => ({ id: undefined as unknown as number, day_of_week: d, open_time: '09:00', close_time: '17:00', is_open: true } as BusinessHours));

  const [hours, setHours] = React.useState<BusinessHours[]>(init);

  React.useEffect(() => {
    const updated = (initialBusinessHours && initialBusinessHours.length > 0)
      ? initialBusinessHours
      : defaultWeek.map((d) => ({ id: undefined as unknown as number, day_of_week: d, open_time: '09:00', close_time: '17:00', is_open: true } as BusinessHours));
    setHours(updated);
  }, [initialBusinessHours, open]);

  const handleSave = async () => {
    try {
      if (businessId) {
        // loop through each day and update/create
        for (const h of hours) {
          // determine if this row represents an existing DB row with a valid id
          const hasValidId = h.id !== undefined && h.id !== null && String(h.id).trim() !== "";
          if (hasValidId) {
            // update existing row
            await updateData(
              String(h.id),
              {
                day_of_week: h.day_of_week,
                open_time: h.open_time,
                close_time: h.close_time,
                is_open: h.is_open,
              },
              "business-hours"
            );
          } else {
            // insert new business hour and attach business_id
            await insertData(
              {
                business_id: businessId,
                day_of_week: h.day_of_week,
                open_time: h.open_time,
                close_time: h.close_time,
                is_open: h.is_open,
              },
              "business-hours"
            );
          }
        }

        // After saving, re-fetch the business-hours from the server so we have canonical rows (with ids)
        try {
          const all = await getData("business-hours");
          // narrow to unknown[] then filter safely
          const rows = Array.isArray(all) ? (all as unknown[]) : [];
          const filtered = rows.filter((row) => {
            const r = row as Record<string, unknown>;
            return String(r.business_id) === String(businessId);
          }) as BusinessHours[];
          if (onUpdate) onUpdate(filtered);
        } catch (fetchErr) {
          // If re-fetch fails, still call onUpdate with local state as a fallback
          console.warn("Failed to re-fetch business hours after save", fetchErr);
          if (onUpdate) onUpdate(hours);
        }
      }
      // close modal
      onClose();
    } catch (err) {
      console.error("Failed to update business hours", err);
    }
  };

  return (
    <BaseEditModal
      open={open}
      onClose={onClose}
      title="Edit Business Hours"
      description="Configure opening hours for each day"
      maxWidth={640}
      actions={[{ label: 'Cancel', onClick: onClose }, { label: 'Save', onClick: handleSave, variant: 'primary' }]}
    >
      <div>
        {hours.map((hour, index) => (
          <Container key={hour.day_of_week} padding="8px 0" align="center" direction="row" style={{ gap: 12 }}>
            <div style={{ width: 100, color: 'var(--primary-color)', fontWeight: 600 }}>{hour.day_of_week}</div>

            <input
              type="time"
              value={hour.open_time}
              readOnly={!hour.is_open}
              onChange={(e) => {
                const newTime = e.target.value;
                setHours((prev) => prev.map((h, i) => (i === index ? { ...h, open_time: newTime } : h)));
              }}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />

            <input
              type="time"
              value={hour.close_time}
              readOnly={!hour.is_open}
              onChange={(e) => {
                const newTime = e.target.value;
                setHours((prev) => prev.map((h, i) => (i === index ? { ...h, close_time: newTime } : h)));
              }}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #e5e7eb' }}
            />

            <div style={{ minWidth: 80, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: 999,
                background: hour.is_open ? 'var(--primary-color)' : '#d1d5db'
              }} />
              <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{hour.is_open ? 'Open' : 'Closed'}</span>
            </div>
            <input
              type="checkbox"
              checked={hour.is_open}
              onChange={(e) => {
                const checked = e.target.checked;
                setHours((prev) => prev.map((h, i) => (i === index ? { ...h, is_open: checked } : h)));
              }}
              style={{ accentColor: 'var(--primary-color)' }}
            />
          </Container>
        ))}
      </div>
    </BaseEditModal>
  );
};

export default EditBusinessHoursModal;
