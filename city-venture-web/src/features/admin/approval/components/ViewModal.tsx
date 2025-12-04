import React, { useEffect, useRef, useState } from "react";
import { diffWords, diffChars } from "diff";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Stack,
  Divider,
  Sheet,
  Box,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import "@/src/features/admin/approval/styles/ViewModal.css";
import Button from "@/src/components/Button";
import Typography from "@/src/components/Typography";
import { getPermitsByBusiness } from "@/src/services/approval/PermitService";
import type { Permit } from "@/src/types/Permit";

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
  const [permits, setPermits] = useState<Permit[] | null>(null);
  const [loadingPermits, setLoadingPermits] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    setTimeout(() => modalRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    const entityType = String((item as any)?.entityType || "").toLowerCase();
    const businessId = String((item as any)?.id || "");
    if (!isOpen || !item || entityType !== "businesses" || !businessId) {
      setPermits(null);
      return;
    }
    (async () => {
      try {
        setLoadingPermits(true);
        const data = await getPermitsByBusiness(businessId);
        setPermits(data || []);
      } catch (e) {
        setPermits([]);
      } finally {
        setLoadingPermits(false);
      }
    })();
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const existingSpot =
    (item.existingSpot as Record<string, unknown> | undefined) ?? null;

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
    if (field === "category_id") {
      for (const k of fallbacks) {
        if (rec[k] != null) return rec[k];
      }
      if (rec[field] != null) return rec[field];
      return null;
    }

    if (rec[field] != null) return rec[field];
    for (const k of fallbacks) {
      if (rec[k] != null) return rec[k];
    }
    return null;
  };

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

  const hasChanged = (field: string) => {
    const cur = normalize(field, getCurrent(field));
    const next = normalize(field, getProposed(field));
    return cur !== next;
  };

  const InlineWordDiff: React.FC<{
    oldText: string;
    newText: string;
    mode: "old" | "new";
  }> = ({ oldText, newText, mode }) => {
    const parts = diffWords(oldText ?? "", newText ?? "");
    const out: React.ReactNode[] = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const next = parts[i + 1];
      const isReplacePair = p && next && p.removed && next.added;

      if (isReplacePair) {
        const oldVal = p.value.trim();
        const newVal = next.value.trim();
        const oldWordCount = oldVal.split(/\s+/).length;
        const newWordCount = newVal.split(/\s+/).length;
        const simpleSingleWord = oldWordCount === 1 && newWordCount === 1;
        let doCharLevel = false;
        if (simpleSingleWord) {
          const chars = diffChars(oldVal, newVal);
          let unchangedChars = 0;
            chars.forEach(c => { if (!c.added && !c.removed) unchangedChars += c.value.length; });
          const similarity = unchangedChars / Math.max(oldVal.length, newVal.length);
          if (similarity >= 0.5 && Math.max(oldVal.length, newVal.length) <= 30) {
            doCharLevel = true;
            if (mode === "old") {
              chars.forEach((c, idx) => {
                if (c.added) return;
                if (c.removed) {
                  out.push(
                    <span key={`o-${i}-${idx}`} style={{ color: "#b00020", textDecoration: "line-through" }}>
                      {c.value}
                    </span>
                  );
                } else {
                  out.push(
                    <span key={`o-${i}-${idx}`} style={{ color: "inherit" }}>
                      {c.value}
                    </span>
                  );
                }
              });
            } else {
              chars.forEach((c, idx) => {
                if (c.removed) return;
                if (c.added) {
                  out.push(
                    <span key={`n-${i}-${idx}`} style={{ color: "#1a7f37", fontWeight: 600 }}>
                      {c.value}
                    </span>
                  );
                } else {
                  out.push(
                    <span key={`n-${i}-${idx}`} style={{ color: "inherit" }}>
                      {c.value}
                    </span>
                  );
                }
              });
            }
          }
        }
        if (!doCharLevel) {
          if (mode === "old") {
            out.push(
              <span key={`o-${i}`} style={{ color: "#b00020", textDecoration: "line-through" }}>
                {p.value}
              </span>
            );
          } else {
            out.push(
              <span key={`n-${i}`} style={{ color: "#1a7f37", fontWeight: 600 }}>
                {next.value}
              </span>
            );
          }
        }
        i++;
        continue;
      }

      if (mode === "old") {
        if (p.added) {
          continue;
        }
        if (p.removed) {
          out.push(
            <span key={`o-${i}`} style={{ color: "#b00020", textDecoration: "line-through" }}>
              {p.value}
            </span>
          );
          continue;
        }
        out.push(
          <span key={`o-${i}`} style={{ color: "inherit" }}>
            {p.value}
          </span>
        );
      } else {
        if (p.removed) {
          continue;
        }
        if (p.added) {
          out.push(
            <span key={`n-${i}`} style={{ color: "#1a7f37", fontWeight: 600 }}>
              {p.value}
            </span>
          );
          continue;
        }
        out.push(
          <span key={`n-${i}`} style={{ color: "inherit" }}>
            {p.value}
          </span>
        );
      }
    }
    return <>{out}</>;
  };

  const renderDiffRow = (label: string, field: string, format?: (v: unknown) => string) => {
    const current = getCurrent(field);
    const proposed = getProposed(field);
    const changed = hasChanged(field);
    const fmt = (v: unknown) => (format ? format(v) : formatValue(field, v));
    const isLikelyText = ![
      "entry_fee",
      "latitude",
      "longitude",
      "contact_phone",
      "phone",
      "contact_email",
      "website",
    ].includes(field);
    return (
      <Stack spacing={0.5} sx={{ mb: 1 }}>
        <Typography.CardTitle size="xs" sx={{ opacity: 0.8 }}>{label}</Typography.CardTitle>
        {changed ? (
          <div>
            {current != null && current !== "" && (
              <span style={{
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: 8,
                background: '#ffe5e5',
                marginRight: 6,
              }}>
                {isLikelyText ? (
                  <InlineWordDiff oldText={String(fmt(current))} newText={String(fmt(proposed))} mode="old" />
                ) : (
                  <span style={{ textDecoration: 'line-through' }}>{fmt(current)}</span>
                )}
              </span>
            )}
            <span style={{
              display: 'inline-block',
              padding: '4px 8px',
              borderRadius: 8,
              background: '#e6ffec',
              fontWeight: 600,
            }}>
              {isLikelyText ? (
                <InlineWordDiff oldText={String(fmt(current))} newText={String(fmt(proposed))} mode="new" />
              ) : (
                <>{fmt(proposed)}</>
              )}
            </span>
          </div>
        ) : (
          <Typography.Body size="sm">{fmt(current)}</Typography.Body>
        )}
      </Stack>
    );
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
          width: { xs: "100%", md: "96%" },
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
              {(() => {
                const entityType = String(item.entityType || "").toLowerCase();
                const baseName = String(item.name ?? item.business_name ?? "");
                const labelMap: Record<string, string> = {
                  tourist_spots: "Tourist Spot Details",
                  businesses: "Business Details",
                  events: "Event Details",
                };
                return (
                  <>
                    <Typography.Header size="md" color="primary">
                      {isEdit ? `Edit Request: ${baseName}` : baseName}
                    </Typography.Header>
                    <Typography.Body size="xs" color="default">
                      {isEdit
                        ? "Review proposed changes"
                        : labelMap[entityType] || "Submission Details"}
                    </Typography.Body>
                  </>
                );
              })()}
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
            <Sheet variant="plain" sx={{ p: 3, borderRadius: "lg" }}>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography.CardTitle size="md" color="primary">
                    Edit Request: {String(item.name ?? "")}
                  </Typography.CardTitle>
                  <Typography.Body size="xs" sx={{ backgroundColor: 'warning.100', color: 'warning.700', px: 1.5, py: 0.5, borderRadius: 'sm', fontWeight: 500 }}>
                    Review changes
                  </Typography.Body>
                </Stack>
                <Divider />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Typography.CardTitle size="sm" sx={{ mb: 1 }}>Basic Information</Typography.CardTitle>
                      {renderDiffRow('Name', 'name')}
                      {renderDiffRow('Description', 'description')}
                      {renderDiffRow('Entry Fee', 'entry_fee', (v) => formatValue('entry_fee', v))}
                    </Sheet>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md', mt: 2 }}>
                      <Typography.CardTitle size="sm" sx={{ mb: 1 }}>Location</Typography.CardTitle>
                      {renderDiffRow('Province', 'province')}
                      {renderDiffRow('Municipality', 'municipality')}
                      {renderDiffRow('Barangay', 'barangay')}
                      {renderDiffRow('Latitude', 'latitude')}
                      {renderDiffRow('Longitude', 'longitude')}
                    </Sheet>
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md' }}>
                      <Typography.CardTitle size="sm" sx={{ mb: 1 }}>Contact</Typography.CardTitle>
                      {renderDiffRow('Phone', 'contact_phone')}
                      {renderDiffRow('Email', 'contact_email')}
                      {renderDiffRow('Website', 'website')}
                    </Sheet>
                  </Box>
                </Stack>
              </Stack>
            </Sheet>
          ) : (
            (() => {
              const entityType = String(item.entityType || "").toLowerCase();
              const isBusiness = entityType === "businesses";
              return (
                <Sheet variant="plain" sx={{ p: 1, borderRadius: "lg" }}>
                  <Stack spacing={1}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack spacing={2}>
                          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                            <Typography.CardTitle size="sm" sx={{ mb: 1 }}>
                              Basic Information
                            </Typography.CardTitle>
                            <Typography.Body size="sm">
                              <strong>Name:</strong> {formatValue("name", getProposed("name") ?? getCurrent("name") ?? (item.business_name as any))}
                            </Typography.Body>
                            <Typography.Body size="sm">
                              <strong>Description:</strong> {formatValue("description", getProposed("description") ?? getCurrent("description"))}
                            </Typography.Body>
                            {isBusiness ? (
                              <>
                                <Typography.Body size="sm">
                                  <strong>Type:</strong> {formatValue("business_type_name", (item as any).business_type_name)}
                                </Typography.Body>
                                <Typography.Body size="sm">
                                  <strong>Category:</strong> {formatValue("business_category_name", (item as any).business_category_name)}
                                </Typography.Body>
                                <Typography.Body size="sm">
                                  <strong>Price Range:</strong> {(() => {
                                    const min = (item as any).min_price;
                                    const max = (item as any).max_price;
                                    if (min == null && max == null) return "-";
                                    if (min != null && max != null) return `₱${min} - ₱${max}`;
                                    return `₱${min ?? max}`;
                                  })()}
                                </Typography.Body>
                              </>
                            ) : (
                              <>
                                {(() => {
                                  const cats = (item.categories as any[]) || [];
                                  const catText = cats.length
                                    ? cats
                                        .map((c: any) => c?.category || c?.label || c?.name)
                                        .filter(Boolean)
                                        .join(", ")
                                    : "-";
                                  return (
                                    <Typography.Body size="sm">
                                      <strong>Categories:</strong> {catText}
                                    </Typography.Body>
                                  );
                                })()}
                                <Typography.Body size="sm">
                                  <strong>Entry Fee:</strong> {formatValue("entry_fee", getProposed("entry_fee") ?? getCurrent("entry_fee"))}
                                </Typography.Body>
                              </>
                            )}
                          </Sheet>
                          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                            <Typography.CardTitle size="sm" sx={{ mb: 1 }}>
                              Location
                            </Typography.CardTitle>
                            {isBusiness ? (
                              <Typography.Body size="sm">
                                <strong>Address:</strong> {formatValue("address", (item as any).address) || `${formatValue("barangay", getProposed("barangay") ?? getCurrent("barangay"))}, ${formatValue("municipality", getProposed("municipality") ?? getCurrent("municipality"))}, ${formatValue("province", getProposed("province") ?? getCurrent("province"))}`}
                              </Typography.Body>
                            ) : (
                              <Typography.Body size="sm">
                                <strong>Address:</strong> {formatValue("barangay", getProposed("barangay") ?? getCurrent("barangay"))}, {formatValue("municipality", getProposed("municipality") ?? getCurrent("municipality"))}, {formatValue("province", getProposed("province") ?? getCurrent("province"))}
                              </Typography.Body>
                            )}
                            <Typography.Body size="sm">
                              <strong>Coordinates:</strong> {formatValue("latitude", getProposed("latitude") ?? getCurrent("latitude"))}{getProposed("latitude") ?? getCurrent("latitude") ? ", " : ""}{formatValue("longitude", getProposed("longitude") ?? getCurrent("longitude"))}
                            </Typography.Body>
                          </Sheet>
                        </Stack>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack spacing={2}>
                          <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                            <Typography.CardTitle size="sm" sx={{ fontWeight: 600, color: "#0A1B47", mb: 1 }}>
                              Contact Information
                            </Typography.CardTitle>
                            {(() => {
                              const v = (item as any).phone_number ?? getProposed("contact_phone") ?? getCurrent("contact_phone");
                              return v ? (
                                <Typography.Body size="sm">
                                  <strong>Phone:</strong> {formatValue("contact_phone", v)}
                                </Typography.Body>
                              ) : null;
                            })()}
                            {(() => {
                              const v = (item as any).email ?? getProposed("contact_email") ?? getCurrent("contact_email");
                              return v ? (
                                <Typography.Body size="sm">
                                  <strong>Email:</strong> {formatValue("contact_email", v)}
                                </Typography.Body>
                              ) : null;
                            })()}
                            {(() => {
                              const v = (item as any).website_url ?? getProposed("website") ?? getCurrent("website");
                              return v ? (
                                <Typography.Body size="sm">
                                  <strong>Website:</strong> {formatValue("website", v)}
                                </Typography.Body>
                              ) : (
                                !( (item as any).phone_number || (item as any).email ) && !(getProposed("contact_phone") ?? getCurrent("contact_phone")) && !(getProposed("contact_email") ?? getCurrent("contact_email")) && (
                                  <Typography.Body sx={{ color: "text.tertiary" }}>No contact information provided</Typography.Body>
                                )
                              );
                            })()}
                          </Sheet>
                              {!isBusiness && (
                            <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                              <Typography.CardTitle size="sm" sx={{ mb: 1 }}>
                                Operating Hours
                              </Typography.CardTitle>
                              {(() => {
                                const schedules = (item.schedules as any[]) || [];
                                const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                                const openDays = schedules.filter((s: any) => !s.is_closed);
                                if (!schedules.length) return <Typography.Body sx={{ color: "text.tertiary" }}>No operating hours available</Typography.Body>;
                                if (!openDays.length) return <Typography.Body sx={{ color: "text.tertiary" }}>Closed all week</Typography.Body>;
                                return (
                                  <>
                                    {openDays.map((s: any) => (
                                      <Typography.Body key={s.day_of_week}>
                                        <strong>{days[s.day_of_week] || `Day ${s.day_of_week}`}:</strong> {String(s.open_time).slice(0,5)} - {String(s.close_time).slice(0,5)}
                                      </Typography.Body>
                                    ))}
                                  </>
                                );
                              })()}
                            </Sheet>
                          )}
                          {isBusiness && (
                            <Sheet variant="outlined" sx={{ p: 2, borderRadius: "md" }}>
                              <Typography.CardTitle size="sm" sx={{ mb: 1 }}>
                                Permits
                              </Typography.CardTitle>
                              {loadingPermits ? (
                                <Typography.Body size="sm" sx={{ color: "text.tertiary" }}>
                                  Loading permits...
                                </Typography.Body>
                              ) : !permits || permits.length === 0 ? (
                                <Typography.Body size="sm" sx={{ color: "text.tertiary" }}>
                                  No permits uploaded
                                </Typography.Body>
                              ) : (
                                <>
                                  {permits.map((p) => (
                                    <Box key={p.id} sx={{ mb: 1 }}>
                                      <Typography.Body size="sm">
                                        <strong>{p.permit_type}</strong>{" "}
                                        <span style={{ opacity: 0.8 }}>({p.status})</span>
                                      </Typography.Body>
                                      <Typography.Body size="xs" sx={{ color: "text.tertiary" }}>
                                        {p.expiration_date ? `Expires: ${p.expiration_date}` : "No expiration set"}
                                      </Typography.Body>
                                      <Typography.Body size="xs">
                                        <a href={p.file_url} target="_blank" rel="noreferrer">
                                          View file ({p.file_format.toUpperCase()})
                                        </a>
                                      </Typography.Body>
                                    </Box>
                                  ))}
                                </>
                              )}
                            </Sheet>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Stack>
                </Sheet>
              );
            })()
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
            disabled={
              !onReject || (processingId != null && processingId === id)
            }
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
            disabled={
              !onApprove || (processingId != null && processingId === id)
            }
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

