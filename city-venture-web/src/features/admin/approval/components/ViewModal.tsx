import React, { useEffect, useRef } from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Stack,
  Divider,
  Sheet,
  Box,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import "./ViewModal.css";
import ResponsiveButton from "@/src/components/ResponsiveButton";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Record<string, unknown> | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  processingId?: string | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, item, onApprove, onReject, processingId }) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => modalRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const existingSpot =
    (item.existingSpot as Record<string, unknown> | undefined) ?? null;

  // canonical list of attributes we want to show (order matters)
  const ATTRS: { field: string; label: string }[] = [
    { field: "name", label: "Name" },
    { field: "description", label: "Description" },
    { field: "type", label: "Type" },
    { field: "category_id", label: "Category" },
    { field: "province", label: "Province" },
    { field: "municipality", label: "Municipality" },
    { field: "barangay", label: "Barangay" },
    { field: "latitude", label: "Latitude" },
    { field: "longitude", label: "Longitude" },
    { field: "contact_phone", label: "Contact Phone" },
    { field: "contact_email", label: "Contact Email" },
    { field: "website", label: "Website" },
    { field: "entry_fee", label: "Entry Fee" },
    { field: "created_at", label: "Submitted" },
  ];

  // extra fallbacks per logical field name
  const FALLBACK_KEYS: Record<string, string[]> = {
    category_id: ["category", "category_name", "category_id"],
    contact_email: ["contact_email", "email"],
    latitude: ["latitude", "lat"],
    longitude: ["longitude", "lng", "lon", "long"],
    contact_phone: ["contact_phone", "phone", "mobile", "contact"],
  };

  const resolveField = (
    rec: Record<string, unknown> | null | undefined,
    field: string
  ) => {
    if (!rec) return null;
    const fallbacks = FALLBACK_KEYS[field] ?? [];
    // For category_id prefer human-readable fallbacks before the numeric id
    if (field === "category_id") {
      for (const k of fallbacks) {
        if (rec[k] != null) return rec[k];
      }
      if (rec[field] != null) return rec[field];
      return null;
    }

    // default: direct hit first, then fallbacks
    if (rec[field] != null) return rec[field];
    for (const k of fallbacks) {
      if (rec[k] != null) return rec[k];
    }
    return null;
  };

  // improved getters that use fallbacks
  const getCurrent = (field: string) => {
    const fromExisting = resolveField(existingSpot ?? null, field);
    if (fromExisting != null) return fromExisting;
    const asRecord = item as Record<string, unknown>;
    const origKey = `original_${field}`;
    if (asRecord[origKey] != null) return asRecord[origKey];
    // last resort try fallbacks on the main record
    return resolveField(asRecord, field);
  };

  const getProposed = (field: string) => {
    const asRecord = item as Record<string, unknown>;
    const direct = resolveField(asRecord, field) ?? asRecord[field];
    if (direct != null) return direct;
    const alt = asRecord[`new_${field}`] ?? asRecord[`${field}_id`];
    if (alt != null) return alt;
    return null;
  };

  const normalize = (field: string, v: unknown) => {
    if (v == null) return "";
    if (field === "entry_fee") {
      const n = Number(String(v));
      return isNaN(n) ? "" : String(n);
    }
    if (field.toLowerCase().includes("phone"))
      return String(v).replace(/\D/g, "");
    if (
      field === "latitude" ||
      field === "longitude" ||
      field === "lat" ||
      field === "lng"
    ) {
      const n = Number(String(v));
      if (isNaN(n)) return "";
      // round to 6 decimals for comparison tolerance
      return n.toFixed(6);
    }
    return String(v).trim().toLowerCase();
  };

  const isEdit = (item.action_type as string) === "edit";
  const isNew = (item.action_type as string) === "new";

  // showVal removed in favor of formatValue

  const formatValue = (field: string, v: unknown) => {
    if (v == null || v === "") return "-";
    if (field === "entry_fee") return `₱${String(v)}`;
    if (field === "created_at" || field === "submitted_at") {
      const d = new Date(String(v));
      return isNaN(d.getTime()) ? String(v) : d.toLocaleString();
    }
    if (field.toLowerCase().includes("phone"))
      return String(v).replace(/\D/g, "");
    return String(v);
  };

  const id = String(item.id ?? "");

  const handleApproveClick = () => {
    if (!id) return;
    onApprove?.(id);
    onClose();
  };

  const handleRejectClick = () => {
    if (!id) return;
    onReject?.(id);
    onClose();
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        size="lg"
        aria-label={
          isEdit
            ? `Edit Request: ${String(item.name ?? "")}`
            : String(item.name ?? "")
        }
        sx={{ 
          width: "95%", 
          maxWidth: 1400,
          borderRadius: 'lg',
          boxShadow: 'lg',
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ 
              width: "100%",
              pb: 1,
              borderBottom: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Stack spacing={0.5}>
              <Typography level="title-lg" sx={{ fontWeight: 600, color: '#0A1B47' }}>
                {isEdit
                  ? `Edit Request: ${String(item.name ?? "")}`
                  : String(item.name ?? "")}
              </Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                {isEdit ? "Review proposed changes" : "Tourist spot details"}
              </Typography>
            </Stack>
            <IconButton
              variant="soft"
              color="neutral"
              onClick={onClose}
              aria-label="Close"
              size="sm"
              sx={{ 
                borderRadius: 'sm',
                '&:hover': { 
                  backgroundColor: 'danger.50',
                  color: 'danger.500'
                }
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
  <DialogContent sx={{ maxHeight: "80vh", overflow: "auto", p: 3 }}>
          {isEdit ? (
            <Sheet 
              variant="soft" 
              sx={{ 
                p: 3, 
                borderRadius: 'lg',
                backgroundColor: 'background.level1',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography level="title-md" sx={{ fontWeight: 600, color: '#0A1B47' }}>
                    Proposed Changes
                  </Typography>
                  <Typography 
                    level="body-xs" 
                    sx={{ 
                      backgroundColor: 'warning.100',
                      color: 'warning.700',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 'sm',
                      fontWeight: 500
                    }}
                  >
                    Pending Review
                  </Typography>
                </Stack>
                <Divider />
                <div className="comparison-table">
                <div className="table-head label">Field</div>
                <div className="table-head current">Current</div>
                <div className="table-head proposed">Proposed</div>
                {ATTRS.map(({ field, label }) => {
                  const cur = getCurrent(field);
                  const next = getProposed(field);
                  if (cur == null && next == null) return null;
                  const changed =
                    normalize(field, cur) !== normalize(field, next);
                  return (
                    <React.Fragment key={field}>
                      <div className="label">{label}</div>
                      <div
                        className={`current detail-row ${!cur ? "muted" : ""}`}
                      >
                        <span style={{ color: isNew && !cur ? '#222' : undefined }}>{formatValue(field, cur)}</span>
                      </div>
                      <div
                        className={`proposed detail-row ${
                          changed ? "changed" : ""
                        }`}
                      >
                        <span style={{ fontWeight: isNew && next ? 600 : undefined }}>{formatValue(field, next)}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
              </Stack>
            </Sheet>
          ) : (
            <Sheet 
              variant="soft" 
              sx={{ 
                p: 3, 
                borderRadius: 'lg',
                backgroundColor: 'background.level1',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography level="title-md" sx={{ fontWeight: 600, color: '#0A1B47' }}>
                    Tourist Spot Details
                  </Typography>
                  <Typography 
                    level="body-xs" 
                    sx={{ 
                      backgroundColor: 'primary.100',
                      color: 'primary.700',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 'sm',
                      fontWeight: 500
                    }}
                  >
                    New Submission
                  </Typography>
                </Stack>
                <Divider />
                <div className="comparison-table two-column">
                <div className="table-head label">Field</div>
                <div className="table-head current">Value</div>
                {ATTRS.map(({ field, label }) => {
                  const v = getProposed(field) ?? getCurrent(field);
                  if (v == null) return null;
                  return (
                    <React.Fragment key={field}>
                      <div className="label">{label}</div>
                      <div className="current detail-row">
                        <span style={{ color: isNew ? '#222' : undefined }}>{formatValue(field, v)}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
                </div>
              </Stack>
            </Sheet>
          )}
        </DialogContent>
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-end', 
          p: 3, 
          pt: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.surface'
        }}>
          <ResponsiveButton
            variant="outlined"
            color="error"
            onClick={handleRejectClick}
            disabled={!onReject || (processingId != null && processingId === id)}
            startIcon={<CloseRoundedIcon />}
            size="sm"
            hoverEffect="lift"
            style={{ minWidth: 120, fontWeight: 500, borderRadius: '10px' }}
          >
            Reject
          </ResponsiveButton>
          <ResponsiveButton
            variant="solid"
            color="primary"
            onClick={handleApproveClick}
            disabled={!onApprove || (processingId != null && processingId === id)}
            startIcon={<CheckRoundedIcon />}
            size="sm"
            hoverEffect="lift"
            style={{ minWidth: 120, fontWeight: 600, borderRadius: '10px' }}
          >
            Approve
          </ResponsiveButton>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ViewModal;
