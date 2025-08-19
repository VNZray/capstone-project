import React, { useEffect, useRef } from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Grid,
  Stack,
  Divider,
  Sheet,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import "../styles/ViewModal.css";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Record<string, unknown> | null;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, item }) => {
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

  const existingSpot = (item.existingSpot as Record<string, unknown> | undefined) ?? null;

  const getCurrent = (field: string) => {
    const fromExisting = existingSpot && existingSpot[field];
    if (fromExisting != null) return fromExisting;
    const origKey = `original_${field}`;
    const asRecord = item as Record<string, unknown>;
    if (asRecord[origKey] != null) return asRecord[origKey];
    return null;
  };

  const getProposed = (field: string) => {
    const asRecord = item as Record<string, unknown>;
    const v = asRecord[field];
    if (v != null) return v;
    const alt = asRecord[`new_${field}`] ?? asRecord[`${field}_id`];
    return alt ?? null;
  };

  const normalize = (field: string, v: unknown) => {
    if (v == null) return "";
    if (field === "entry_fee") {
      const n = Number(String(v));
      return isNaN(n) ? "" : String(n);
    }
    if (field.toLowerCase().includes("phone")) return String(v).replace(/\D/g, "");
    return String(v).trim().toLowerCase();
  };

  const hasChanged = (field: string) => {
    const cur = getCurrent(field);
    const next = getProposed(field);
    if (cur == null && next == null) return false;
    if (cur == null) return true;
    return normalize(field, cur) !== normalize(field, next);
  };

  const hasLocationChanged = () => {
    const curProv = String(getCurrent("province") ?? "").trim();
    const curMun = String(getCurrent("municipality") ?? "").trim();
    const curBar = String(getCurrent("barangay") ?? "").trim();
    const nextProv = String(getProposed("province") ?? "").trim();
    const nextMun = String(getProposed("municipality") ?? "").trim();
    const nextBar = String(getProposed("barangay") ?? "").trim();
    return curProv !== nextProv || curMun !== nextMun || curBar !== nextBar;
  };

  const isEdit = (item.action_type as string) === "edit";

  const showVal = (v: unknown) => (v == null ? "-" : String(v));

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalDialog variant="outlined" aria-label={isEdit ? `Edit Request: ${String(item.name ?? "")}` : String(item.name ?? "")}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
            <Typography level="title-lg">{isEdit ? `Edit Request: ${String(item.name ?? "")}` : String(item.name ?? "")}</Typography>
            <IconButton variant="plain" color="neutral" onClick={onClose} aria-label="Close">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '60vh', overflow: 'auto' }}>
          {isEdit ? (
            <Grid container spacing={2}>
              <Grid xs={12} md={6}>
                <Sheet variant="soft" sx={{ p: 2, borderRadius: 8 }}>
                  <Typography level="title-sm" sx={{ mb: 1 }}>Current Version</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Stack spacing={1}>
                    <Typography level="body-sm"><b>Name:</b> {showVal(getCurrent("name"))}</Typography>
                    <Typography level="body-sm"><b>Description:</b> {showVal(getCurrent("description"))}</Typography>
                    <Typography level="body-sm"><b>Type:</b> {showVal(getCurrent("type"))}</Typography>
                    <Typography level="body-sm"><b>Location:</b> {`${showVal(getCurrent("province"))}, ${showVal(getCurrent("municipality"))}, ${showVal(getCurrent("barangay"))}`}</Typography>
                    {getCurrent("contact_phone") != null && (
                      <Typography level="body-sm"><b>Contact Phone:</b> {showVal(getCurrent("contact_phone"))}</Typography>
                    )}
                    {getCurrent("website") != null && (
                      <Typography level="body-sm"><b>Website:</b> {showVal(getCurrent("website"))}</Typography>
                    )}
                    {getCurrent("entry_fee") != null && (
                      <Typography level="body-sm"><b>Entry Fee:</b> {showVal(getCurrent("entry_fee"))}</Typography>
                    )}
                  </Stack>
                </Sheet>
              </Grid>
              <Grid xs={12} md={6}>
                <Sheet variant="soft" sx={{ p: 2, borderRadius: 8 }}>
                  <Typography level="title-sm" sx={{ mb: 1 }}>Proposed Changes</Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Stack spacing={1}>
                    <Typography level="body-sm" sx={{ bgcolor: hasChanged("name") ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Name:</b> {showVal(getProposed("name"))}</Typography>
                    <Typography level="body-sm" sx={{ bgcolor: hasChanged("description") ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Description:</b> {showVal(getProposed("description"))}</Typography>
                    <Typography level="body-sm" sx={{ bgcolor: hasChanged("type") ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Type:</b> {showVal(getProposed("type"))}</Typography>
                    <Typography level="body-sm" sx={{ bgcolor: hasLocationChanged() ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Location:</b> {`${showVal(getProposed("province"))}, ${showVal(getProposed("municipality"))}, ${showVal(getProposed("barangay"))}`}</Typography>
                    {getProposed("contact_phone") != null && (
                      <Typography level="body-sm" sx={{ bgcolor: hasChanged("contact_phone") ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Contact Phone:</b> {showVal(getProposed("contact_phone"))}</Typography>
                    )}
                    {getProposed("website") != null && (
                      <Typography level="body-sm" sx={{ bgcolor: hasChanged("website") ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Website:</b> {showVal(getProposed("website"))}</Typography>
                    )}
                    {getProposed("entry_fee") != null && (
                      <Typography level="body-sm" sx={{ bgcolor: hasChanged("entry_fee") ? 'warning.softBg' : undefined, p: 0.5, borderRadius: 6 }}><b>Entry Fee:</b> {showVal(getProposed("entry_fee"))}</Typography>
                    )}
                  </Stack>
                </Sheet>
              </Grid>
            </Grid>
          ) : (
            <Stack spacing={1}>
              <Typography level="body-sm"><b>Description:</b> {showVal(item.description)}</Typography>
              <Typography level="body-sm"><b>Type:</b> {showVal(item.type)}</Typography>
              <Typography level="body-sm"><b>Location:</b> {`${showVal(item.province)}, ${showVal(item.municipality)}, ${showVal(item.barangay)}`}</Typography>
              {item.contact_phone != null && (
                <Typography level="body-sm"><b>Contact Phone:</b> {showVal(item.contact_phone)}</Typography>
              )}
              {item.website != null && (
                <Typography level="body-sm"><b>Website:</b> {showVal(item.website)}</Typography>
              )}
              {item.entry_fee != null && (
                <Typography level="body-sm"><b>Entry Fee:</b> ₱{showVal(item.entry_fee)}</Typography>
              )}
              <Typography level="body-sm"><b>Submitted:</b> {new Date(String(item.created_at ?? item.submitted_at ?? "")).toLocaleDateString()}</Typography>
            </Stack>
          )}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
};

export default ViewModal;
