import React, { useEffect, useMemo, useState } from "react";
import { apiService } from "@/src/utils/api";
import type { Event } from "@/src/types/Event";
import { Modal, ModalDialog, Typography, Sheet, IconButton } from "@mui/joy";
import Button from "@/src/components/Button";
import Autocomplete from "@mui/joy/Autocomplete";
import { IoClose } from "react-icons/io5";

interface FeaturedEventsModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const FeaturedEventsModal: React.FC<FeaturedEventsModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [featured, setFeatured] = useState<Event[]>([]);
  const [nonFeatured, setNonFeatured] = useState<Event[]>([]);
  const [selectedToAddId, setSelectedToAddId] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUnfeatureId, setPendingUnfeatureId] = useState<string | null>(
    null
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [f, nf] = await Promise.all([
        apiService.getFeaturedEvents(),
        apiService.getNonFeaturedEvents(),
      ]);
      setFeatured(f);
      setNonFeatured(nf);
    } catch (e) {
      console.error("Failed to load featured events", e);
      alert("Failed to load featured events");
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
      await apiService.featureEvent(selectedToAddId, featured.length);
      setSelectedOption(null);
      setSelectedToAddId("");
      await loadData();
      onSuccess?.();
    } catch (e) {
      console.error("Failed to feature event", e);
      alert("Failed to feature event");
    } finally {
      setLoading(false);
    }
  };

  const handleUnfeature = async () => {
    if (!pendingUnfeatureId) return;
    setLoading(true);
    try {
      await apiService.unfeatureEvent(pendingUnfeatureId);
      setPendingUnfeatureId(null);
      setConfirmOpen(false);
      await loadData();
      onSuccess?.();
    } catch (e) {
      console.error("Failed to unfeature event", e);
      alert("Failed to unfeature event");
    } finally {
      setLoading(false);
    }
  };

  const nonFeaturedOptions = useMemo(
    () => nonFeatured.sort((a, b) => a.name.localeCompare(b.name)),
    [nonFeatured]
  );

  const handleClose = () => {
    setSelectedOption(null);
    setSelectedToAddId("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} sx={{ zIndex: 2000 }}>
      <ModalDialog sx={{ width: "90%", maxWidth: 900 }}>
        <Typography level="h4" sx={{ mb: 2 }}>
          Manage Featured Events
        </Typography>

        <Sheet variant="soft" sx={{ p: 2, mb: 2, borderRadius: 8 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Typography level="title-md">Add an event to featured</Typography>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              <Autocomplete
                placeholder="Search event to feature"
                options={nonFeaturedOptions}
                getOptionLabel={(o) => o?.name || ""}
                value={selectedOption}
                isOptionEqualToValue={(o, v) => !!o && !!v && o.id === v.id}
                openOnFocus
                filterOptions={(options) => options}
                loading={loading}
                onChange={(_, v) => {
                  setSelectedOption(v);
                  setSelectedToAddId(v?.id || "");
                }}
                slotProps={{
                  listbox: { sx: { zIndex: 2200, maxHeight: 260 } },
                }}
                noOptionsText={loading ? "Loading…" : "No matches"}
                sx={{ minWidth: 320, maxWidth: 480, flex: 1 }}
              />
              <Button
                onClick={handleAdd}
                disabled={!selectedToAddId || loading}
                size="sm"
                variant="solid"
                colorScheme="primary"
                sx={{ borderRadius: "18px" }}
              >
                Add
              </Button>
            </div>
          </div>
        </Sheet>

        <div className="table-container">
          <div
            style={{
              display: "flex",
              background: "#0A1B47",
              borderRadius: 8,
              padding: "8px 16px",
              marginBottom: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            <Typography
              level="title-md"
              sx={{ flex: 4, fontWeight: 700, color: "#fff" }}
            >
              Name
            </Typography>
            <Typography
              level="title-md"
              sx={{ flex: 2, fontWeight: 700, color: "#fff" }}
            >
              Date
            </Typography>
            <Typography
              level="title-md"
              sx={{
                flex: 1,
                fontWeight: 700,
                color: "#fff",
                textAlign: "right",
              }}
            >
              Action
            </Typography>
          </div>

          {featured.map((event) => (
            <div
              key={event.id}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: 8,
                marginBottom: 8,
                boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                padding: "8px 16px",
              }}
            >
              <Typography level="body-md" color="neutral" sx={{ flex: 4 }}>
                {event.name}
              </Typography>
              <Typography
                level="body-sm"
                color="neutral"
                sx={{ flex: 2, opacity: 0.7 }}
              >
                {new Date(event.start_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Typography>
              <div
                style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
              >
                <IconButton
                  color="danger"
                  variant="soft"
                  onClick={() => {
                    setPendingUnfeatureId(event.id);
                    setConfirmOpen(true);
                  }}
                  disabled={loading}
                >
                  <IoClose />
                </IconButton>
              </div>
            </div>
          ))}

          {featured.length === 0 && (
            <div
              style={{
                background: "#fff",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                color: "#666",
              }}
            >
              No featured events yet.
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 16,
            gap: 8,
          }}
        >
          <Button
            variant="solid"
            colorScheme="primary"
            size="sm"
            onClick={handleClose}
          >
            Close
          </Button>
        </div>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <Modal
            open
            onClose={() => {
              setConfirmOpen(false);
              setPendingUnfeatureId(null);
            }}
            sx={{ zIndex: 2500 }}
          >
            <ModalDialog>
              <Typography level="title-lg" sx={{ mb: 1 }}>
                Remove from Featured?
              </Typography>
              <Typography sx={{ mb: 2 }}>
                Are you sure you want to remove this event from featured?
              </Typography>
              <div
                style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
              >
                <Button
                  variant="soft"
                  colorScheme="gray"
                  size="sm"
                  onClick={() => {
                    setConfirmOpen(false);
                    setPendingUnfeatureId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="error"
                  variant="solid"
                  size="sm"
                  onClick={handleUnfeature}
                  disabled={loading}
                >
                  Remove
                </Button>
              </div>
            </ModalDialog>
          </Modal>
        )}
      </ModalDialog>
    </Modal>
  );
};

export default FeaturedEventsModal;
