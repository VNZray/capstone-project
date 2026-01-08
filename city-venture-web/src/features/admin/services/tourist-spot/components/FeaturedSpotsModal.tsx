import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '@/src/utils/api';
import type { TouristSpot } from '@/src/types/TouristSpot';
import {
  Modal,
  ModalDialog,
  Typography,
  Sheet,
  IconButton,
} from '@mui/joy';
import Button from '@/src/components/Button';
// Removed ResponsiveButton import
import Autocomplete from '@mui/joy/Autocomplete';
import { IoClose } from 'react-icons/io5';
import "./TouristSpotTable.css";
import Alert from "@/src/components/Alert";

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
  const [pendingUnfeatureId, setPendingUnfeatureId] = useState<string | null>(null);

  const [alertConfig, setAlertConfig] = useState<{
    open: boolean;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    onConfirm?: () => void;
    showCancel?: boolean;
    confirmText?: string;
    cancelText?: string;
  }>({
    open: false,
    type: "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      showCancel?: boolean;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    setAlertConfig({
      open: true,
      type,
      title,
      message,
      onConfirm: options?.onConfirm,
      showCancel: options?.showCancel,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
    });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, open: false }));
  };

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
      showAlert("error", "Error", "Failed to load featured spots");
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
      showAlert("error", "Error", "Failed to feature spot");
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
      closeAlert();
      await loadData();
    } catch (e) {
      console.error('Failed to unfeature spot', e);
      showAlert("error", "Error", "Failed to unfeature spot");
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
              <Button
                onClick={handleAdd}
                disabled={!selectedToAddId || loading}
                size="sm"
                variant="solid"
                colorScheme="primary"
                sx={{ borderRadius: '18px' }}
              >
                Add
              </Button>
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
                <IconButton
                  color="danger"
                  variant="soft"
                  onClick={() => {
                    setPendingUnfeatureId(s.id);
                    showAlert(
                      "warning",
                      "Remove Featured Spot",
                      `Are you sure you want to remove "${s.name}" from featured spots?`,
                      {
                        onConfirm: () => handleUnfeature(),
                        showCancel: true,
                        confirmText: "Remove",
                      }
                    );
                  }}
                  disabled={loading}
                >
                  <IoClose />
                </IconButton>
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
          <Button
            variant="solid"
            colorScheme="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
        <Alert
          open={alertConfig.open}
          onClose={closeAlert}
          onConfirm={alertConfig.onConfirm}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          showCancel={alertConfig.showCancel}
          confirmText={alertConfig.confirmText}
          cancelText={alertConfig.cancelText}
        />
      </ModalDialog>
    </Modal>
  );
};

export default FeaturedSpotsModal;
