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
import Button from "@/src/components/Button";

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Record<string, unknown> | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  processingId?: string | null;
}

const ViewModal: React.FC<ViewModalProps> = ({
  isOpen,
  onClose,
  item,
  onApprove,
  onReject,
  processingId,
}) => {
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

  // canonical list removed in favor of sectioned layout

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
          borderRadius: "lg",
          boxShadow: "lg",
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
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={0.5}>
              <Typography
                level="title-lg"
                sx={{ fontWeight: 600, color: "#0A1B47" }}
              >
                {isEdit
                  ? `Edit Request: ${String(item.name ?? "")}`
                  : String(item.name ?? "")}
              </Typography>
              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
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
                borderRadius: "sm",
                "&:hover": {
                  backgroundColor: "danger.50",
                  color: "danger.500",
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: "80vh", overflow: "auto", p: 3 }}>
          {isEdit ? (
            <Sheet
              variant="plain"
              sx={{ p: 3, borderRadius: "lg" }}
            >
              <Stack spacing={2}>
                <Divider />
                {/* Two-column sectioned layout: Current vs Proposed */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {/* Current column */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography level="title-sm" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                      Current
                    </Typography>
                    <Stack spacing={2}>
                      {/* Basic Information */}
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Basic Information
                        </Typography>
                        <Typography level="body-sm"><strong>Name:</strong> {formatValue("name", getCurrent("name"))}</Typography>
                        <Typography level="body-sm"><strong>Description:</strong> {formatValue("description", getCurrent("description"))}</Typography>
                        <Typography level="body-sm"><strong>Entry Fee:</strong> {formatValue("entry_fee", getCurrent("entry_fee"))}</Typography>
                      </Sheet>

                      {/* Location */}
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Location
                        </Typography>
                        <Typography level="body-sm">
                          <strong>Address:</strong> {formatValue("barangay", getCurrent("barangay"))}, {formatValue("municipality", getCurrent("municipality"))}, {formatValue("province", getCurrent("province"))}
                        </Typography>
                        <Typography level="body-sm">
                          <strong>Coordinates:</strong> {formatValue("latitude", getCurrent("latitude"))}{getCurrent("latitude") ? ", " : ""}{formatValue("longitude", getCurrent("longitude"))}
                        </Typography>
                      </Sheet>

                      {/* Contact Information */}
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Contact Information
                        </Typography>
                        {getCurrent("contact_phone") ? (
                          <Typography level="body-sm"><strong>Phone:</strong> {formatValue("contact_phone", getCurrent("contact_phone"))}</Typography>
                        ) : null}
                        {getCurrent("contact_email") ? (
                          <Typography level="body-sm"><strong>Email:</strong> {formatValue("contact_email", getCurrent("contact_email"))}</Typography>
                        ) : null}
                        {getCurrent("website") ? (
                          <Typography level="body-sm"><strong>Website:</strong> {formatValue("website", getCurrent("website"))}</Typography>
                        ) : (
                          !getCurrent("contact_phone") && !getCurrent("contact_email") && (
                            <Typography level="body-sm" sx={{ color: "text.tertiary" }}>No contact information provided</Typography>
                          )
                        )}
                      </Sheet>
                    </Stack>
                  </Box>

                  {/* Proposed column */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography level="title-sm" sx={{ fontWeight: 600, color: "text.secondary", mb: 1 }}>
                      Proposed
                    </Typography>
                    <Stack spacing={2}>
                      {/* Basic Information */}
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Basic Information
                        </Typography>
                        {(() => {
                          const changed = normalize("name", getCurrent("name")) !== normalize("name", getProposed("name"));
                          return (
                            <Typography level="body-sm"><strong>Name:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("name", getProposed("name"))}</span></Typography>
                          );
                        })()}
                        {(() => {
                          const changed = normalize("description", getCurrent("description")) !== normalize("description", getProposed("description"));
                          return (
                            <Typography level="body-sm"><strong>Description:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("description", getProposed("description"))}</span></Typography>
                          );
                        })()}
                        {(() => {
                          const changed = normalize("entry_fee", getCurrent("entry_fee")) !== normalize("entry_fee", getProposed("entry_fee"));
                          return (
                            <Typography level="body-sm"><strong>Entry Fee:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("entry_fee", getProposed("entry_fee"))}</span></Typography>
                          );
                        })()}
                      </Sheet>

                      {/* Location */}
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Location
                        </Typography>
                        {(() => {
                          const changed = (
                            normalize("province", getCurrent("province")) !== normalize("province", getProposed("province")) ||
                            normalize("municipality", getCurrent("municipality")) !== normalize("municipality", getProposed("municipality")) ||
                            normalize("barangay", getCurrent("barangay")) !== normalize("barangay", getProposed("barangay"))
                          );
                          return (
                            <Typography level="body-sm">
                              <strong>Address:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("barangay", getProposed("barangay"))}, {formatValue("municipality", getProposed("municipality"))}, {formatValue("province", getProposed("province"))}</span>
                            </Typography>
                          );
                        })()}
                        {(() => {
                          const changed = (
                            normalize("latitude", getCurrent("latitude")) !== normalize("latitude", getProposed("latitude")) ||
                            normalize("longitude", getCurrent("longitude")) !== normalize("longitude", getProposed("longitude"))
                          );
                          const lat = formatValue("latitude", getProposed("latitude"));
                          const lon = formatValue("longitude", getProposed("longitude"));
                          return (
                            <Typography level="body-sm">
                              <strong>Coordinates:</strong> <span className={changed ? "value-changed" : undefined}>{lat}{lat && lon ? ", " : ""}{lon}</span>
                            </Typography>
                          );
                        })()}
                      </Sheet>

                      {/* Contact Information */}
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Contact Information
                        </Typography>
                        {(() => {
                          const changed = normalize("contact_phone", getCurrent("contact_phone")) !== normalize("contact_phone", getProposed("contact_phone"));
                          const v = getProposed("contact_phone");
                          return v ? (
                            <Typography level="body-sm"><strong>Phone:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("contact_phone", v)}</span></Typography>
                          ) : null;
                        })()}
                        {(() => {
                          const changed = normalize("contact_email", getCurrent("contact_email")) !== normalize("contact_email", getProposed("contact_email"));
                          const v = getProposed("contact_email");
                          return v ? (
                            <Typography level="body-sm"><strong>Email:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("contact_email", v)}</span></Typography>
                          ) : null;
                        })()}
                        {(() => {
                          const changed = normalize("website", getCurrent("website")) !== normalize("website", getProposed("website"));
                          const v = getProposed("website");
                          return v ? (
                            <Typography level="body-sm"><strong>Website:</strong> <span className={changed ? "value-changed" : undefined}>{formatValue("website", v)}</span></Typography>
                          ) : null;
                        })()}
                        {!getProposed("contact_phone") && !getProposed("contact_email") && !getProposed("website") && (
                          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>No contact information provided</Typography>
                        )}
                      </Sheet>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Sheet>
          ) : (
            <Sheet variant="plain" sx={{ p: 3, borderRadius: "lg" }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography
                    level="title-md"
                    sx={{ fontWeight: 600, color: "#0A1B47" }}
                  >
                    Tourist Spot Details
                  </Typography>
                  <Typography
                    level="body-xs"
                    sx={{
                      backgroundColor: "primary.100",
                      color: "primary.700",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "sm",
                      fontWeight: 500,
                    }}
                  >
                    New Submission
                  </Typography>
                </Stack>
                <Divider />
                {/* Sectioned layout mirroring the Review step */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {/* Left Column */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack spacing={2}>
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Basic Information
                        </Typography>
                        <Typography level="body-sm"><strong>Name:</strong> {formatValue("name", getProposed("name") ?? getCurrent("name"))}</Typography>
                        <Typography level="body-sm"><strong>Description:</strong> {formatValue("description", getProposed("description") ?? getCurrent("description"))}</Typography>
                        {(() => {
                          const cats = (item.categories as any[]) || [];
                          const catText = cats.length ? cats.map((c:any) => c?.category || c?.label || c?.name).filter(Boolean).join(", ") : "-";
                          return (
                            <Typography level="body-sm"><strong>Categories:</strong> {catText}</Typography>
                          );
                        })()}
                        <Typography level="body-sm"><strong>Entry Fee:</strong> {formatValue("entry_fee", getProposed("entry_fee") ?? getCurrent("entry_fee"))}</Typography>
                      </Sheet>

                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Location
                        </Typography>
                        <Typography level="body-sm">
                          <strong>Address:</strong> {formatValue("barangay", getProposed("barangay") ?? getCurrent("barangay"))}, {formatValue("municipality", getProposed("municipality") ?? getCurrent("municipality"))}, {formatValue("province", getProposed("province") ?? getCurrent("province"))}
                        </Typography>
                        <Typography level="body-sm">
                          <strong>Coordinates:</strong> {formatValue("latitude", getProposed("latitude") ?? getCurrent("latitude"))}{(getProposed("latitude") ?? getCurrent("latitude")) ? ", " : ""}{formatValue("longitude", getProposed("longitude") ?? getCurrent("longitude"))}
                        </Typography>
                      </Sheet>
                    </Stack>
                  </Box>

                  {/* Right Column */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack spacing={2}>
                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Contact Information
                        </Typography>
                        {(() => {
                          const v = getProposed("contact_phone") ?? getCurrent("contact_phone");
                          return v ? (
                            <Typography level="body-sm"><strong>Phone:</strong> {formatValue("contact_phone", v)}</Typography>
                          ) : null;
                        })()}
                        {(() => {
                          const v = getProposed("contact_email") ?? getCurrent("contact_email");
                          return v ? (
                            <Typography level="body-sm"><strong>Email:</strong> {formatValue("contact_email", v)}</Typography>
                          ) : null;
                        })()}
                        {(() => {
                          const v = getProposed("website") ?? getCurrent("website");
                          return v ? (
                            <Typography level="body-sm"><strong>Website:</strong> {formatValue("website", v)}</Typography>
                          ) : (
                            !(getProposed("contact_phone") ?? getCurrent("contact_phone")) &&
                            !(getProposed("contact_email") ?? getCurrent("contact_email")) && (
                              <Typography level="body-sm" sx={{ color: "text.tertiary" }}>No contact information provided</Typography>
                            )
                          );
                        })()}
                      </Sheet>

                      <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                        <Typography level="title-sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                          Operating Hours
                        </Typography>
                        {(() => {
                          const schedules = (item.schedules as any[]) || [];
                          const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
                          const openDays = schedules.filter((s:any) => !s.is_closed);
                          if (!schedules.length) {
                            return <Typography level="body-sm" sx={{ color: "text.tertiary" }}>No operating hours available</Typography>;
                          }
                          if (!openDays.length) {
                            return <Typography level="body-sm" sx={{ color: "text.tertiary" }}>Closed all week</Typography>;
                          }
                          return (
                            <>
                              {openDays.map((s:any) => (
                                <Typography level="body-sm" key={s.day_of_week}>
                                  <strong>{days[s.day_of_week] || `Day ${s.day_of_week}`}:</strong> {String(s.open_time).slice(0,5)} - {String(s.close_time).slice(0,5)}
                                </Typography>
                              ))}
                            </>
                          );
                        })()}
                      </Sheet>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Sheet>
          )}
        </DialogContent>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "flex-end",
            p: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.surface",
          }}
        >
          <Button
            variant="outlined"
            colorScheme="error"
            onClick={handleRejectClick}
            disabled={!onReject || (processingId != null && processingId === id)}
            startDecorator={<CloseRoundedIcon />}
            size="sm"
            sx={{ minWidth: 120, fontWeight: 500, borderRadius: "10px" }}
          >
            Reject
          </Button>
          <Button
            variant="solid"
            colorScheme="primary"
            onClick={handleApproveClick}
            disabled={!onApprove || (processingId != null && processingId === id)}
            startDecorator={<CheckRoundedIcon />}
            size="sm"
            sx={{ minWidth: 120, fontWeight: 600, borderRadius: "10px" }}
          >
            Approve
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default ViewModal;
