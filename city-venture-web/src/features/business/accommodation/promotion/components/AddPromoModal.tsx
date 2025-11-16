import * as React from "react";
import {
  Modal,
  ModalDialog,
  DialogActions,
  Button,
  Input,
  Select,
  Option,
  FormControl,
  FormLabel,
  Stack,
  Textarea,
  Grid,
  Switch,
  Autocomplete,
  Radio,
  RadioGroup,
  Box,
} from "@mui/joy";
import { supabase } from "@/src/lib/supabase";
import { UploadIcon } from "lucide-react";
import placeholderImage from "@/src/assets/images/placeholder-image.png";
import { insertData } from "@/src/services/Service";
import { useBusiness } from "@/src/context/BusinessContext";
import Typography from "@/src/components/Typography";
interface AddPromoModalProps {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void; // callback after successful add
}

type PromoType = "DISCOUNT" | "CODE" | "BOGO" | "FREE_TRIAL";

interface PromoDraft {
  title: string;
  description: string;
  promo_type: PromoType;
  discount_value?: number;
  promo_code?: string;
  amount?: number;
  start_date: string; // ISO yyyy-mm-dd
  end_date: string; // ISO yyyy-mm-dd
  usage_limit?: number;
  business_id?: string;
  banner_image?: string; // URL
  auto_pause_when_depleted: boolean;
  pause_on_expiry: boolean;
  applies_to_all: boolean;
  room_ids: string[];
}

const emptyDraft: PromoDraft = {
  title: "",
  description: "",
  promo_type: "DISCOUNT",
  discount_value: undefined,
  promo_code: "",
  amount: undefined,
  start_date: "",
  end_date: "",
  usage_limit: undefined,
  business_id: undefined,
  banner_image: undefined,
  auto_pause_when_depleted: true,
  pause_on_expiry: true,
  applies_to_all: true,
  room_ids: [],
};

// Static mock rooms for selection (replace with real data fetch later)
const staticRooms = [
  { id: "room_1", name: "Deluxe Suite" },
  { id: "room_2", name: "Executive King" },
  { id: "room_3", name: "Garden View" },
  { id: "room_4", name: "Poolside Villa" },
  { id: "room_5", name: "Family Loft" },
];

const AddPromoModal: React.FC<AddPromoModalProps> = ({
  open,
  onClose,
  onAdded,
}) => {
  const { businessDetails } = useBusiness();
  const [draft, setDraft] = React.useState<PromoDraft>({
    ...emptyDraft,
    business_id: businessDetails?.id || undefined,
  });
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setDraft({
        ...emptyDraft,
        business_id: businessDetails?.id || undefined,
      });
      setPreviewUrl(null);
      setErrorMsg(null);
    }
  }, [open, businessDetails?.id]);

  const update = <K extends keyof PromoDraft>(key: K, value: PromoDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeTitle = draft.title
        ? draft.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
        : "promo";
      const fileName = `${safeTitle}-${timestamp}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("promotion-banners")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no path returned");
      const { data: pub } = supabase.storage
        .from("promotion-banners")
        .getPublicUrl(uploadData.path);
      if (!pub?.publicUrl) throw new Error("Failed to get public URL");
      update("banner_image", pub.publicUrl);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Image upload failed");
    }
  };

  const validate = () => {
    if (!draft.title.trim()) return "Title is required";
    if (!draft.start_date || !draft.end_date)
      return "Start & end dates required";
    if (new Date(draft.start_date) > new Date(draft.end_date))
      return "Start date must be before end date";
    if (draft.promo_type === "DISCOUNT" && (draft.discount_value ?? 0) <= 0)
      return "Discount value must be > 0";
    if (draft.promo_type === "CODE" && !draft.promo_code?.trim())
      return "Promo code required for CODE type";
    if (draft.promo_type === "CODE" && (!draft.amount || draft.amount <= 0))
      return "Amount must be greater than 0 for CODE type";
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim(),
        promo_type: draft.promo_type,
        discount_value:
          draft.promo_type === "DISCOUNT" ? draft.discount_value : undefined,
        promo_code:
          draft.promo_type === "CODE" ? draft.promo_code?.trim() : undefined,
        amount: draft.promo_type === "CODE" ? draft.amount : undefined,
        start_date: draft.start_date,
        end_date: draft.end_date,
        usage_limit: draft.usage_limit,
        business_id: draft.business_id,
        banner_image: draft.banner_image,
        auto_pause_when_depleted: draft.auto_pause_when_depleted,
        pause_on_expiry: draft.pause_on_expiry,
        applies_to_all: draft.applies_to_all,
        room_ids: draft.applies_to_all ? [] : draft.room_ids,
      };
      // For now we call generic insertData; replace 'promotions' with actual API endpoint when ready.
      await insertData(payload, "promotions");
      onAdded?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to save promotion");
    } finally {
      setSaving(false);
    }
  };

  const showDiscountField = draft.promo_type === "DISCOUNT";
  const showCodeField = draft.promo_type === "CODE";

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        size="lg"
        variant="outlined"
        sx={{
          width: 760,
          maxWidth: "90vw",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        role="dialog"
        aria-labelledby="add-promo-title"
      >
        <Typography.CardTitle>
          Create Promotion
        </Typography.CardTitle>
        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 1 }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Stack spacing={2}>
              {errorMsg && (
                <Typography.Body color="error" sx={{ mt: 1 }}>
                  {errorMsg}
                </Typography.Body>
              )}
              <Grid container spacing={2}>
                <Grid xs={8} sx={{ pl: 0 }}>
                  <FormControl required>
                    <FormLabel>Title</FormLabel>
                    <Input
                      placeholder="E.g. Summer Splash 20% Off"
                      value={draft.title}
                      onChange={(e) => update("title", e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={4} sx={{ pr: 0 }}>
                  <FormControl>
                    <FormLabel>Usage Limit</FormLabel>
                    <Input
                      type="number"
                      placeholder="e.g. 500"
                      value={draft.usage_limit ?? ""}
                      onChange={(e) =>
                        update(
                          "usage_limit",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid xs={4} sx={{ pl: 0 }}>
                  <FormControl required>
                    <FormLabel>Type</FormLabel>
                    <Select
                      value={draft.promo_type}
                      onChange={(_, val) =>
                        update("promo_type", (val as PromoType) || "DISCOUNT")
                      }
                    >
                      <Option value="DISCOUNT">Discount</Option>
                      <Option value="CODE">Promo Code</Option>
                      <Option value="BOGO">BOGO</Option>
                    </Select>
                  </FormControl>
                </Grid>
                {showDiscountField && (
                  <Grid xs={4}>
                    <FormControl required>
                      <FormLabel>Discount %</FormLabel>
                      <Input
                        type="number"
                        placeholder="e.g. 20"
                        value={draft.discount_value ?? ""}
                        onChange={(e) =>
                          update(
                            "discount_value",
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                      />
                    </FormControl>
                  </Grid>
                )}
                {showCodeField && (
                  <>
                    <Grid xs={4}>
                      <FormControl required>
                        <FormLabel>Promo Code</FormLabel>
                        <Input
                          placeholder="e.g. WEEKND50"
                          value={draft.promo_code}
                          onChange={(e) =>
                            update("promo_code", e.target.value.toUpperCase())
                          }
                        />
                      </FormControl>
                    </Grid>
                    <Grid xs={4}>
                      <FormControl required>
                        <FormLabel>Amount</FormLabel>
                        <Input
                          type="number"
                          placeholder="e.g. 500"
                          value={draft.amount ?? ""}
                          onChange={(e) =>
                            update(
                              "amount",
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                          startDecorator={<span>₱</span>}
                        />
                      </FormControl>
                    </Grid>
                  </>
                )}
                <Grid
                  xs={showCodeField || showDiscountField ? 4 : 8}
                  sx={{ pr: 0 }}
                >
                  <FormControl required>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={draft.start_date}
                      onChange={(e) => update("start_date", e.target.value)}
                    />
                  </FormControl>
                </Grid>
                <Grid xs={4} sx={{ pl: 0 }}>
                  <FormControl required>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={draft.end_date}
                      onChange={(e) => update("end_date", e.target.value)}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  minRows={3}
                  placeholder="Describe this promotion..."
                  value={draft.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </FormControl>

              {/* Scope Selection */}
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <FormControl>
                  <FormLabel>Applies To</FormLabel>
                  <RadioGroup
                    orientation="horizontal"
                    value={draft.applies_to_all ? "all" : "specific"}
                    onChange={(event) =>
                      update(
                        "applies_to_all",
                        (event.target as HTMLInputElement).value === "all"
                      )
                    }
                  >
                    <Radio value="all" label="All Rooms" />
                    <Radio value="specific" label="Specific Rooms" />
                  </RadioGroup>
                </FormControl>
                {!draft.applies_to_all && (
                  <FormControl>
                    <FormLabel>Select Rooms</FormLabel>
                    <Autocomplete
                      multiple
                      placeholder="Search & select rooms"
                      options={staticRooms}
                      getOptionLabel={(r) => r.name}
                      value={staticRooms.filter((r) =>
                        draft.room_ids.includes(r.id)
                      )}
                      onChange={(_, val) =>
                        update(
                          "room_ids",
                          (val as { id: string; name: string }[]).map(
                            (r) => r.id
                          )
                        )
                      }
                    />
                    <Typography.Body
                      sx={{ mt: 0.5 }}
                    >
                      {draft.room_ids.length === 0
                        ? "No rooms selected"
                        : `${draft.room_ids.length} room${
                            draft.room_ids.length === 1 ? "" : "s"
                          } selected`}
                    </Typography.Body>
                  </FormControl>
                )}
              </Stack>

              {/* Image Upload */}
              <FormControl sx={{ alignItems: "flex-start", gap: 1 }}>
                <FormLabel>Banner Image</FormLabel>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    width: 200,
                    height: 120,
                    borderStyle: "dashed",
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={previewUrl || draft.banner_image || placeholderImage}
                    alt="Promo Banner Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outlined"
                  color="primary"
                  startDecorator={<UploadIcon />}
                  onClick={() =>
                    document.getElementById("promo-image-upload")?.click()
                  }
                >
                  Upload Banner
                </Button>
                <input
                  id="promo-image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: "none" }}
                />
              </FormControl>

              {/* Toggles */}
              <Grid container spacing={2}>
                <Grid xs={6} sx={{ pl: 0 }}>
                  <FormControl
                    orientation="horizontal"
                    sx={{ alignItems: "center", gap: 1 }}
                  >
                    <Switch
                      checked={draft.auto_pause_when_depleted}
                      onChange={(e) =>
                        update("auto_pause_when_depleted", e.target.checked)
                      }
                    />
                    <FormLabel>Auto-pause when usage limit reached</FormLabel>
                  </FormControl>
                </Grid>
                <Grid xs={6} sx={{ pr: 0 }}>
                  <FormControl
                    orientation="horizontal"
                    sx={{ alignItems: "center", gap: 1 }}
                  >
                    <Switch
                      checked={draft.pause_on_expiry}
                      onChange={(e) =>
                        update("pause_on_expiry", e.target.checked)
                      }
                    />
                    <FormLabel>Pause automatically on end date</FormLabel>
                  </FormControl>
                </Grid>
              </Grid>

              <DialogActions
                sx={{
                  position: "sticky",
                  bottom: 0,
                  bgcolor: "background.body",
                  pt: 1,
                }}
              >
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  loading={saving}
                  disabled={saving}
                >
                  Save Promotion
                </Button>
              </DialogActions>
            </Stack>
          </form>
        </Box>
      </ModalDialog>
    </Modal>
  );
};

export default AddPromoModal;
