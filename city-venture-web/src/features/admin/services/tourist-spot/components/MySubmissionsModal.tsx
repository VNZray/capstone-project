import React, { useEffect, useState } from 'react';
import { apiService } from '@/src/utils/api';
import type { TouristSpot } from '@/src/types/TouristSpot';
import {
  Modal,
  ModalDialog,
  Typography,
} from '@mui/joy';
import Button from '@/src/components/Button';
import "./TouristSpotTable.css";

interface MySubmissionsModalProps {
  open: boolean;
  onClose: () => void;
}

const MySubmissionsModal: React.FC<MySubmissionsModalProps> = ({ open, onClose }) => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getMySubmittedTouristSpots();
      setSpots(data);
    } catch (e) {
      console.error('Failed to load my submissions', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 2000 }}>
      <ModalDialog sx={{ width: '90%', maxWidth: 900 }}>
        <Typography level="h4" sx={{ mb: 2 }}>My Submissions</Typography>

        <div className="table-container" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', background: '#0A1B47', borderRadius: 8, padding: '8px 16px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Typography level="title-md" sx={{ flex: 2, fontWeight: 700, color: '#fff' }}>Name</Typography>
            <Typography level="title-md" sx={{ flex: 1, fontWeight: 700, color: '#fff' }}>Status</Typography>
            <Typography level="title-md" sx={{ flex: 1, fontWeight: 700, color: '#fff' }}>Date</Typography>
            <Typography level="title-md" sx={{ flex: 2, fontWeight: 700, color: '#fff' }}>Remarks</Typography>
          </div>

          {loading ? (
             <div style={{ background: '#fff', borderRadius: 8, padding: 16, textAlign: 'center', color: '#666' }}>
               Loading...
             </div>
          ) : spots.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, textAlign: 'center', color: '#666' }}>
              No submissions found.
            </div>
          ) : (
            spots.map((spot) => (
              <div key={spot.id} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: '8px 16px' }}>
                <Typography level="body-md" color="neutral" sx={{ flex: 2 }}>{spot.name}</Typography>
                <Typography level="body-md" color="neutral" sx={{ flex: 1 }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: 4, 
                    background: spot.spot_status === 'active' ? '#e6f4ea' : spot.spot_status === 'rejected' ? '#fce8e6' : spot.spot_status === 'pending_deletion' ? '#fff4e5' : '#f1f3f4',
                    color: spot.spot_status === 'active' ? '#1e8e3e' : spot.spot_status === 'rejected' ? '#d93025' : spot.spot_status === 'pending_deletion' ? '#b76e00' : '#5f6368',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {spot.spot_status}
                  </span>
                </Typography>
                <Typography level="body-md" color="neutral" sx={{ flex: 1 }}>
                  {spot.created_at ? new Date(spot.created_at).toLocaleDateString() : '-'}
                </Typography>
                <Typography level="body-md" color="neutral" sx={{ flex: 2, fontStyle: spot.rejection_reason ? 'normal' : 'italic', color: spot.rejection_reason ? 'inherit' : '#999' }}>
                  {spot.rejection_reason || '-'}
                </Typography>
              </div>
            ))
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
          <Button
            variant="solid"
            colorScheme="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default MySubmissionsModal;
