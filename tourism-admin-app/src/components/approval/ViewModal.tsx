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
  Button,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import "../styles/approval/ViewModal.css";

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
        sx={{ width: "95%", maxWidth: 1400 }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ width: "100%" }}
          >
            <Typography level="title-lg">
              {isEdit
                ? `Edit Request: ${String(item.name ?? "")}`
                : String(item.name ?? "")}
            </Typography>
            <IconButton
              variant="plain"
              color="neutral"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
  <DialogContent sx={{ maxHeight: "80vh", overflow: "auto" }}>
          {isEdit ? (
            <Sheet variant="soft" sx={{ p: 2, borderRadius: 8 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Proposed vs Current
              </Typography>
              <Divider sx={{ mb: 1 }} />
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
            </Sheet>
          ) : (
            <Sheet variant="soft" sx={{ p: 2, borderRadius: 8 }}>
              <Typography level="title-sm" sx={{ mb: 1 }}>
                Details
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <div className="details-list">
                {ATTRS.map(({ field, label }) => {
                  const v = getProposed(field) ?? getCurrent(field);
                  if (v == null) return null;
                  return (
                    <div className="detail-section" key={field}>
                      <div className="card-title">{label}</div>
                      <div className="normal" style={{ color: isNew ? '#222' : undefined }}>{formatValue(field, v)}</div>
                    </div>
                  );
                })}
              </div>
            </Sheet>
          )}
        </DialogContent>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', p: 2, pt: 0 }}>
          <Button
            variant="outlined"
            color="danger"
            onClick={handleRejectClick}
            disabled={!onReject || (processingId != null && processingId === id)}
            startDecorator={<CloseRoundedIcon />}
          >
            Reject
          </Button>
          <Button
            variant="solid"
            color="success"
            onClick={handleApproveClick}
            disabled={!onApprove || (processingId != null && processingId === id)}
            startDecorator={<CheckRoundedIcon />}
          >
            Approve
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ViewModal;
