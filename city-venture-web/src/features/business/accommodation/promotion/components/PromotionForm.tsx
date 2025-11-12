import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Stack,
  Box,
  Alert,
  Card,
  Grid,
  Breadcrumbs,
  Link,
  Switch,
  FormHelperText,
  IconButton,
  Select,
  Option,
  Autocomplete,
} from "@mui/joy";
import {
  FiAlertCircle,
  FiVolume2,
  FiImage,
  FiExternalLink,
  FiUpload,
  FiX,
  FiTag,
  FiPercent,
} from "react-icons/fi";
import PageContainer from "@/src/components/PageContainer";
import { useBusiness } from "@/src/context/BusinessContext";
import * as PromotionService from "@/src/services/PromotionService";
import type { CreatePromotionPayload } from "@/src/types/Promotion";
import { supabase } from "@/src/lib/supabase";
import Container from "@/src/components/Container";

// Helper function to get datetime +1 hour from a given datetime string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getDateTimeOneHourLater = (dateTimeString: string): string => {
  if (!dateTimeString) return "";

  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, 0);
  date.setHours(date.getHours() + 1);

  const newYear = date.getFullYear();
  const newMonth = String(date.getMonth() + 1).padStart(2, "0");
  const newDay = String(date.getDate()).padStart(2, "0");
  const newHours = String(date.getHours()).padStart(2, "0");
  const newMinutes = String(date.getMinutes()).padStart(2, "0");

  return `${newYear}-${newMonth}-${newDay}T${newHours}:${newMinutes}`;
};

// Helper function to get current datetime in local format for datetime-local input
const getCurrentDateTimeLocal = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

// Helper function to convert UTC datetime string to local datetime string
const convertUTCToLocalDateTime = (utcDateString: string): string => {
  if (!utcDateString) return "";

  const utcDate = new Date(utcDateString);
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, "0");
  const date = String(utcDate.getDate()).padStart(2, "0");
  const hours = String(utcDate.getHours()).padStart(2, "0");
  const minutes = String(utcDate.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${date}T${hours}:${minutes}`;
};

// Helper function to convert local datetime string to UTC ISO string
const convertLocalDateTimeToUTC = (localDateString: string): string => {
  if (!localDateString) return "";

  const [datePart, timePart] = localDateString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  const localDate = new Date(year, month - 1, day, hours, minutes, 0);
  const timezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;
  const utcDate = new Date(localDate.getTime() - timezoneOffset);

  return utcDate.toISOString();
};

export default function PromotionForm(): React.ReactElement {
  const navigate = useNavigate();
  const { id: promotionId } = useParams<{ id?: string }>();
  const { businessDetails } = useBusiness();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasEndDate, setHasEndDate] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [savedEndDate, setSavedEndDate] = useState<string>(""); // Track original end date

  const [formData, setFormData] = useState<CreatePromotionPayload>({
    business_id: businessDetails?.id || "",
    title: "",
    description: "",
    image_url: "",
    external_link: "",
    start_date: getCurrentDateTimeLocal(),
    end_date: "",
  });

  // Additional UI-only promo fields (not yet persisted by backend)
  type PromoType = "DISCOUNT" | "CODE";
  const [promoType, setPromoType] = useState<PromoType>("DISCOUNT");
  const [discountValue, setDiscountValue] = useState<number | "">("");
  const [promoCode, setPromoCode] = useState<string>("");
  const [amount, setAmount] = useState<number | "">("");
  const [appliesToAll, setAppliesToAll] = useState<boolean>(true);
  const staticRooms = [
    { id: "room_101", name: "Room 101" },
    { id: "room_102", name: "Room 102" },
    { id: "room_201", name: "Room 201" },
    { id: "room_202", name: "Room 202" },
    { id: "room_301", name: "Room 301" },
  ];
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  // Update business_id when businessDetails changes
  useEffect(() => {
    if (businessDetails?.id && !promotionId) {
      setFormData((prev) => ({
        ...prev,
        business_id: businessDetails.id || "",
      }));
    }
  }, [businessDetails?.id, promotionId]);

  // Fetch promotion data if editing
  useEffect(() => {
    const fetchData = async () => {
      if (!businessDetails?.id) {
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);

      try {
        if (promotionId) {
          const promotionData = await PromotionService.fetchPromotionById(
            promotionId
          );

          const convertedStartDate = convertUTCToLocalDateTime(
            promotionData.start_date
          );
          const convertedEndDate = promotionData.end_date
            ? convertUTCToLocalDateTime(promotionData.end_date)
            : "";

          const newFormData = {
            business_id: promotionData.business_id,
            title: promotionData.title,
            description: promotionData.description || "",
            image_url: promotionData.image_url || "",
            external_link: promotionData.external_link || "",
            start_date: convertedStartDate,
            end_date: convertedEndDate,
          };

          setFormData(newFormData);

          setHasEndDate(!!promotionData.end_date);

          // Save the original end date for toggling
          if (convertedEndDate) {
            setSavedEndDate(convertedEndDate);
          }

          // Set preview URL if image exists
          if (promotionData.image_url) {
            setPreviewUrl(promotionData.image_url);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrors({ fetch: "Failed to load data. Please try again." });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [businessDetails?.id, promotionId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = "Promotion title is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (
      hasEndDate &&
      formData.end_date &&
      formData.start_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    // Promo type specific validation (UI only)
    if (promoType === "DISCOUNT") {
      const val =
        typeof discountValue === "number" ? discountValue : Number.NaN;
      if (!val || isNaN(val) || val <= 0) {
        newErrors.discount_value = "Discount % must be greater than 0";
      }
      if (!appliesToAll && selectedRooms.length === 0) {
        newErrors.room_ids = "Select at least one room or choose All Rooms";
      }
    }
    if (promoType === "CODE") {
      if (!promoCode.trim()) {
        newErrors.promo_code = "Promo code is required";
      }
      const amt = typeof amount === "number" ? amount : Number.NaN;
      if (!amt || isNaN(amt) || amt <= 0) {
        newErrors.amount = "Amount must be greater than 0";
      }
    }

    // Validate URLs if provided
    if (formData.image_url?.trim()) {
      try {
        new URL(formData.image_url);
      } catch {
        newErrors.image_url = "Please enter a valid image URL";
      }
    }

    if (formData.external_link?.trim()) {
      try {
        new URL(formData.external_link);
      } catch {
        newErrors.external_link = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        image_url: "Please upload a valid image file (JPEG, PNG, GIF, or WebP)",
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors({ ...errors, image_url: "Image size must be less than 5MB" });
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    setUploading(true);
    setErrors({ ...errors, image_url: "" });

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const safeTitle = formData.title
        ? formData.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
        : "promotion";
      const fileName = `shop-promotions/${businessDetails?.id}/${safeTitle}-${timestamp}.${fileExt}`;

      // Upload to Supabase storage with public read access
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("promotion-banners")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;
      if (!uploadData?.path) throw new Error("Upload failed: no path returned");

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("promotion-banners")
        .getPublicUrl(uploadData.path);

      if (!publicData?.publicUrl) throw new Error("Failed to get public URL");

      setFormData({ ...formData, image_url: publicData.publicUrl });
    } catch (error: any) {
      console.error("Image upload error:", error);
      setErrors({
        ...errors,
        image_url: error?.message || "Image upload failed. Please try again.",
      });
      setPreviewUrl("");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: "" });
    setPreviewUrl("");
    setErrors({ ...errors, image_url: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      ...formData,
      start_date: convertLocalDateTimeToUTC(formData.start_date || ""),
      end_date:
        hasEndDate && formData.end_date
          ? convertLocalDateTimeToUTC(formData.end_date)
          : null,
      image_url: formData.image_url?.trim() || null,
      external_link: formData.external_link?.trim() || null,
      description: formData.description?.trim() || null,
      // NOTE: The backend currently ignores these extra fields; retained here for future support.
      // promo_type: promoType,
      // discount_value: promoType === "DISCOUNT" ? (typeof discountValue === "number" ? discountValue : null) : null,
      // promo_code: promoType === "CODE" ? promoCode.trim() : null,
      // amount: promoType === "CODE" ? (typeof amount === "number" ? amount : null) : null,
      // applies_to_all: promoType === "DISCOUNT" ? appliesToAll : null,
      // room_ids: promoType === "DISCOUNT" && !appliesToAll ? selectedRooms : [],
    };

    setLoading(true);
    try {
      if (promotionId) {
        await PromotionService.updatePromotion(promotionId, payload);
      } else {
        await PromotionService.createPromotion(payload);
      }
      navigate("/business/promotion");
    } catch (error) {
      console.error("Error submitting promotion:", error);
      setErrors({ submit: "Failed to save promotion. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (!businessDetails?.id) {
    return (
      <PageContainer>
        <Alert
          color="warning"
          variant="soft"
          startDecorator={<FiAlertCircle />}
        >
          Please select a business to manage promotions.
        </Alert>
      </PageContainer>
    );
  }

  if (initialLoading) {
    return (
      <PageContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <Typography>Loading...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Breadcrumbs Navigation */}
        <Breadcrumbs>
          <Link
            color="neutral"
            onClick={() => navigate("/business/manage-promotion")}
            sx={{ cursor: "pointer" }}
          >
            Promotions
          </Link>
          <Typography>
            {promotionId ? "Edit Promotion" : "Create Promotion"}
          </Typography>
        </Breadcrumbs>

        {errors.fetch && (
          <Alert
            color="danger"
            variant="soft"
            startDecorator={<FiAlertCircle />}
          >
            {errors.fetch}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            {/* Promotion Form */}
            <Container elevation={2}>
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "md",
                      bgcolor: "primary.softBg",
                      color: "primary.solidBg",
                    }}
                  >
                    <FiVolume2 size={18} />
                  </Box>
                  <Typography level="h4" fontWeight="600">
                    Promotion Details
                  </Typography>
                </Box>

                {/* Two Column Layout */}
                <Grid container spacing={3}>
                  {/* Left Column: Title and Description */}
                  <Grid xs={12} md={6}>
                    <Stack spacing={2.5}>
                      <FormControl error={!!errors.title}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Promotion Title *
                        </FormLabel>
                        <Input
                          value={formData.title || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="e.g., Grand Opening Sale, Summer Special"
                          sx={{
                            "--Input-focusedThickness": "2px",
                            "&:hover": {
                              borderColor: "primary.outlinedBorder",
                            },
                          }}
                        />
                        {errors.title && (
                          <FormHelperText>{errors.title}</FormHelperText>
                        )}
                      </FormControl>

                      <FormControl>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Description
                        </FormLabel>
                        <Textarea
                          value={formData.description || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe this promotional announcement..."
                          minRows={4}
                          sx={{
                            "--Textarea-focusedThickness": "2px",
                            "&:hover": {
                              borderColor: "primary.outlinedBorder",
                            },
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Right Column: Date and Time */}
                  <Grid xs={12} md={6}>
                    <Stack spacing={2.5}>
                      <FormControl error={!!errors.start_date}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Start Date & Time *
                        </FormLabel>
                        <Input
                          type="datetime-local"
                          value={formData.start_date || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              start_date: e.target.value,
                            })
                          }
                          sx={{
                            "--Input-focusedThickness": "2px",
                            "&:hover": {
                              borderColor: "primary.outlinedBorder",
                            },
                          }}
                        />
                        {errors.start_date && (
                          <FormHelperText>{errors.start_date}</FormHelperText>
                        )}
                      </FormControl>

                      {/* End Date Section */}
                      <Stack spacing={1.5}>
                        <FormLabel sx={{ fontWeight: 600 }}>
                          End Date & Time
                        </FormLabel>

                        {/* Toggle Button Section */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            p: 1.5,
                            bgcolor: "background.level1",
                            borderRadius: "md",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography level="body-sm" fontWeight="600">
                              {hasEndDate
                                ? "Promotion ends on a specific date"
                                : "Promotion runs indefinitely"}
                            </Typography>
                            <Typography
                              level="body-xs"
                              sx={{ color: "text.secondary", mt: 0.25 }}
                            >
                              {hasEndDate
                                ? "Select when this promotion should expire"
                                : "Keep running until you manually deactivate it"}
                            </Typography>
                          </Box>
                          <Switch
                            checked={hasEndDate}
                            onChange={(e) => {
                              if (e.target.checked) {
                                // When enabling: use saved end date if available (for existing promotions),
                                // otherwise set to +1 hour from start date (for new promotions)
                                const endDateValue =
                                  savedEndDate ||
                                  getDateTimeOneHourLater(
                                    formData.start_date || ""
                                  );
                                setFormData({
                                  ...formData,
                                  end_date: endDateValue,
                                });
                              } else {
                                // When disabling: save current end date before clearing
                                if (formData.end_date) {
                                  setSavedEndDate(formData.end_date);
                                }
                                setFormData({ ...formData, end_date: "" });
                              }
                              setHasEndDate(e.target.checked);
                            }}
                            size="md"
                          />
                        </Box>

                        {/* End Date Input - Shows only when toggled */}
                        {hasEndDate && (
                          <FormControl error={!!errors.end_date}>
                            <Input
                              type="datetime-local"
                              value={formData.end_date || ""}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  end_date: e.target.value,
                                })
                              }
                              slotProps={{
                                input: {
                                  "aria-label":
                                    "End date and time for promotion",
                                },
                              }}
                              sx={{
                                "--Input-focusedThickness": "2px",
                                "&:hover": {
                                  borderColor: "primary.outlinedBorder",
                                },
                              }}
                            />
                            {errors.end_date && (
                              <FormHelperText>{errors.end_date}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </Stack>
            </Container>

            {/* Promotion Type & Scope */}
            <Container elevation={2}>
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "md",
                      bgcolor: "warning.softBg",
                      color: "warning.solidBg",
                    }}
                  >
                    <FiTag size={18} />
                  </Box>
                  <Typography level="h4" fontWeight="600">
                    Promotion Type & Scope
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <FormControl>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                        Type
                      </FormLabel>
                      <Select
                        value={promoType}
                        onChange={(_, v) =>
                          setPromoType((v as PromoType) || "DISCOUNT")
                        }
                      >
                        <Option value="DISCOUNT">Discount</Option>
                        <Option value="CODE">Promo Code</Option>
                      </Select>
                    </FormControl>
                  </Grid>

                  {promoType === "DISCOUNT" && (
                    <Grid xs={12} md={6}>
                      <FormControl error={!!errors.discount_value}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Discount %
                        </FormLabel>
                        <Input
                          type="number"
                          value={discountValue}
                          onChange={(e) =>
                            setDiscountValue(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          placeholder="e.g., 20"
                          startDecorator={<FiPercent />}
                        />
                        {errors.discount_value && (
                          <FormHelperText>
                            {errors.discount_value}
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  )}
                </Grid>

                {promoType === "CODE" && (
                  <Grid container spacing={3}>
                    <Grid xs={12} md={6}>
                      <FormControl error={!!errors.promo_code}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Promo Code
                        </FormLabel>
                        <Input
                          value={promoCode}
                          onChange={(e) =>
                            setPromoCode(e.target.value.toUpperCase())
                          }
                          placeholder="e.g., WEEKND50"
                        />
                        {errors.promo_code && (
                          <FormHelperText>{errors.promo_code}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid xs={12} md={6}>
                      <FormControl error={!!errors.amount}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Amount
                        </FormLabel>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) =>
                            setAmount(
                              e.target.value ? Number(e.target.value) : ""
                            )
                          }
                          placeholder="e.g., 500"
                          startDecorator={<span>₱</span>}
                        />
                        {errors.amount && (
                          <FormHelperText>{errors.amount}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {promoType === "DISCOUNT" && (
                  <Stack spacing={1.5}>
                    <FormLabel sx={{ fontWeight: 600 }}>Applies To</FormLabel>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        bgcolor: "background.level1",
                        borderRadius: "md",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography level="body-sm" fontWeight="600">
                          {appliesToAll ? "All Rooms" : "Specific Rooms"}
                        </Typography>
                        <Typography
                          level="body-xs"
                          sx={{ color: "text.secondary", mt: 0.25 }}
                        >
                          {appliesToAll
                            ? "Discount will apply to all rooms"
                            : `${selectedRooms.length || 0} room${
                                selectedRooms.length === 1 ? "" : "s"
                              } selected`}
                        </Typography>
                      </Box>
                      <Switch
                        checked={!appliesToAll}
                        onChange={(e) => setAppliesToAll(!e.target.checked)}
                        size="md"
                      />
                    </Box>

                    {!appliesToAll && (
                      <FormControl error={!!errors.room_ids}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Select Rooms
                        </FormLabel>
                        <Autocomplete
                          multiple
                          placeholder="Search & select rooms"
                          options={staticRooms}
                          getOptionLabel={(r) => r.name}
                          value={staticRooms.filter((r) =>
                            selectedRooms.includes(r.id)
                          )}
                          onChange={(_, val) =>
                            setSelectedRooms(
                              (val as { id: string; name: string }[]).map(
                                (r) => r.id
                              )
                            )
                          }
                        />
                        {errors.room_ids && (
                          <FormHelperText>{errors.room_ids}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  </Stack>
                )}
              </Stack>
            </Container>

            {/* Media Section */}
            <Container elevation={2}>
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pb: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: "md",
                      bgcolor: "success.softBg",
                      color: "success.solidBg",
                    }}
                  >
                    <FiImage size={18} />
                  </Box>
                  <Typography level="h4" fontWeight="600">
                    Media & Links
                  </Typography>
                </Box>

                <Grid container spacing={3}>
                  <Grid xs={12} md={6}>
                    <Stack spacing={2}>
                      <FormControl error={!!errors.image_url}>
                        <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                          Upload Image
                        </FormLabel>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                          onChange={handleImageUpload}
                          disabled={uploading}
                          style={{ display: "none" }}
                          id="image-upload-input"
                        />
                        <label
                          htmlFor="image-upload-input"
                          style={{ width: "100%" }}
                        >
                          <Button
                            component="span"
                            variant="outlined"
                            color="neutral"
                            startDecorator={<FiUpload />}
                            loading={uploading}
                            fullWidth
                            sx={{ justifyContent: "flex-start" }}
                          >
                            {uploading
                              ? "Uploading..."
                              : previewUrl
                              ? "Change Image"
                              : "Choose Image"}
                          </Button>
                        </label>
                        {errors.image_url && (
                          <FormHelperText>{errors.image_url}</FormHelperText>
                        )}
                        <FormHelperText>
                          Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)
                        </FormHelperText>
                      </FormControl>

                      <Typography
                        level="body-sm"
                        fontWeight="600"
                        sx={{ mt: 1 }}
                      >
                        Or paste image URL
                      </Typography>
                      <FormControl>
                        <Input
                          value={formData.image_url || ""}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              image_url: e.target.value,
                            });
                            if (e.target.value) {
                              setPreviewUrl(e.target.value);
                            }
                          }}
                          placeholder="https://example.com/image.jpg"
                          startDecorator={<FiImage />}
                          disabled={uploading}
                          sx={{
                            "--Input-focusedThickness": "2px",
                            "&:hover": {
                              borderColor: "primary.outlinedBorder",
                            },
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Grid>

                  <Grid xs={12} md={6}>
                    <FormControl error={!!errors.external_link}>
                      <FormLabel sx={{ fontWeight: 600, mb: 0.75 }}>
                        External Link
                      </FormLabel>
                      <Input
                        value={formData.external_link || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            external_link: e.target.value,
                          })
                        }
                        placeholder="https://example.com/more-info"
                        startDecorator={<FiExternalLink />}
                        sx={{
                          "--Input-focusedThickness": "2px",
                          "&:hover": { borderColor: "primary.outlinedBorder" },
                        }}
                      />
                      {errors.external_link && (
                        <FormHelperText>{errors.external_link}</FormHelperText>
                      )}
                      <FormHelperText>
                        Optional link for more information about this promotion
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Image Preview */}
                {previewUrl && (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography level="body-sm" fontWeight="600">
                        Image Preview
                      </Typography>
                      <IconButton
                        size="sm"
                        variant="outlined"
                        color="danger"
                        onClick={handleRemoveImage}
                      >
                        <FiX />
                      </IconButton>
                    </Box>
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Promotion preview"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                        setErrors({
                          ...errors,
                          image_url:
                            "Failed to load image. Please check the URL.",
                        });
                      }}
                      sx={{
                        maxWidth: "100%",
                        maxHeight: 300,
                        borderRadius: "md",
                        border: "1px solid",
                        borderColor: "divider",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
              </Stack>
            </Container>

            {/* Error Alert */}
            {errors.submit && (
              <Alert
                color="danger"
                variant="soft"
                startDecorator={<FiAlertCircle />}
              >
                {errors.submit}
              </Alert>
            )}

            {/* Action Buttons */}
            <Container elevation={2}>
              <Box
                sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}
              >
                <Button
                  variant="outlined"
                  color="neutral"
                  onClick={() => navigate("/business/promotion")}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading} size="lg">
                  {promotionId ? "Update Promotion" : "Create Promotion"}
                </Button>
              </Box>
            </Container>
          </Stack>
        </form>
      </Stack>
    </PageContainer>
  );
}
