import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/src/utils/api';
import type { TouristSpot } from '@/src/types/TouristSpot';
import {
  Modal,
  ModalDialog,
  Typography,
  Button,
  Sheet,
  IconButton,
} from '@mui/joy';
import Autocomplete from '@mui/joy/Autocomplete';
import { IoClose } from 'react-icons/io5';
import "@/src/components/styles/touristspots/TouristSpotTable.css";

interface FeaturedSpotsModalProps {
  open: boolean;
  onClose: () => void;
}

const FeaturedSpotsModal: React.FC<FeaturedSpotsModalProps> = ({ open, onClose }) => {
  const [featured, setFeatured] = useState<TouristSpot[]>([]);
  const [nonFeatured, setNonFeatured] = useState<TouristSpot[]>([]);
  const [selectedToAddId, setSelectedToAddId] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<TouristSpot | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUnfeatureId, setPendingUnfeatureId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [f, nf] = await Promise.all([
        apiService.getFeaturedTouristSpots(),
        apiService.getNonFeaturedTouristSpots(),
      ]);
      setFeatured(f);
      setNonFeatured(nf);
    } catch (e) {
      console.error('Failed to load featured spots', e);
      alert('Failed to load featured spots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const handleAdd = async () => {
    if (!selectedToAddId) return;
    setLoading(true);
    try {
      await apiService.featureTouristSpot(selectedToAddId);
      setSelectedOption(null);
      setSelectedToAddId('');
      await loadData();
    } catch (e) {
      console.error('Failed to feature spot', e);
      alert('Failed to feature spot');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfeature = async () => {
    if (!pendingUnfeatureId) return;
    setLoading(true);
    try {
      await apiService.unfeatureTouristSpot(pendingUnfeatureId);
      setPendingUnfeatureId(null);
      setConfirmOpen(false);
      await loadData();
    } catch (e) {
      console.error('Failed to unfeature spot', e);
      alert('Failed to unfeature spot');
    } finally {
      setLoading(false);
    }
  };

  const nonFeaturedOptions = useMemo(() => nonFeatured.sort((a,b)=>a.name.localeCompare(b.name)), [nonFeatured]);

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 2000 }}>
      <ModalDialog sx={{ width: '90%', maxWidth: 900 }}>
        <Typography level="h4" sx={{ mb: 2 }}>Manage Featured Tourist Spots</Typography>

        <Sheet variant="soft" sx={{ p: 2, mb: 2, borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Typography level="title-md">Add a spot to featured</Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, justifyContent: 'flex-end' }}>
              <Autocomplete
                placeholder="Search tourist spot to feature"
                options={nonFeaturedOptions}
                getOptionLabel={(o) => o?.name || ''}
                value={selectedOption}
                isOptionEqualToValue={(o, v) => !!o && !!v && o.id === v.id}
                openOnFocus
                filterOptions={(options) => options}
                loading={loading}
                onChange={(_, v) => {
                  setSelectedOption(v);
                  setSelectedToAddId(v?.id || '');
                }}
                slotProps={{ listbox: { sx: { zIndex: 2200, maxHeight: 260 } } }}
                noOptionsText={loading ? 'Loading…' : 'No matches'}
                sx={{ minWidth: 320, maxWidth: 480, flex: 1 }}
              />
              <Button onClick={handleAdd} disabled={!selectedToAddId || loading}>Add</Button>
            </div>
          </div>
        </Sheet>

        <div className="table-container">
          <div style={{ display: 'flex', background: '#0A1B47', borderRadius: 8, padding: '8px 16px', marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <Typography level="title-md" sx={{ flex: 4, fontWeight: 700, color: '#fff' }}>Name</Typography>
            <Typography level="title-md" sx={{ flex: 1, fontWeight: 700, color: '#fff', textAlign: 'right' }}>Action</Typography>
          </div>

          {featured.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, marginBottom: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: '8px 16px' }}>
              <Typography level="body-md" color="neutral" sx={{ flex: 4 }}>{s.name}</Typography>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton color="danger" variant="soft" onClick={() => { setPendingUnfeatureId(s.id); setConfirmOpen(true); }} disabled={loading}>
                  <IoClose />
                </IconButton>
        {confirmOpen && (
          <Modal open onClose={() => { setConfirmOpen(false); setPendingUnfeatureId(null); }} sx={{ zIndex: 2500 }}>
            <ModalDialog>
              <Typography level="title-lg" sx={{ mb: 1 }}>Remove from Featured?</Typography>
              <Typography sx={{ mb: 2 }}>Are you sure you want to remove this tourist spot from featured?</Typography>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <Button variant="plain" onClick={() => { setConfirmOpen(false); setPendingUnfeatureId(null); }}>Cancel</Button>
                <Button color="danger" onClick={handleUnfeature} loading={loading}>Remove</Button>
              </div>
            </ModalDialog>
          </Modal>
        )}
              </div>
            </div>
          ))}

          {featured.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 16, textAlign: 'center', color: '#666' }}>
              No featured spots yet.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
          <Button variant="soft" onClick={onClose}>Close</Button>
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default FeaturedSpotsModal;
