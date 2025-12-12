import React, { useState } from "react";
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Stack,
  Select,
  Option,
  Chip,
} from "@mui/joy";
import type { Product, UpdateStockPayload } from "@/src/types/Product";

interface StockManagementModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: UpdateStockPayload) => Promise<void>;
  product: Product | null;
}

export default function StockManagementModal({
  open,
  onClose,
  onSubmit,
  product,
}: StockManagementModalProps): React.ReactElement {
  const [formData, setFormData] = useState<UpdateStockPayload>({
    quantity_change: 0,
    change_type: "restock",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.quantity_change === 0) {
      newErrors.quantity_change = "Quantity change cannot be 0";
    }

    if (
      (formData.change_type === "sale" ||
        formData.change_type === "adjustment" ||
        formData.change_type === "expired") &&
      formData.quantity_change > 0
    ) {
      newErrors.quantity_change =
        "For sales, adjustments, or expired items, quantity should be negative";
    }

    if (formData.change_type === "restock" && formData.quantity_change < 0) {
      newErrors.quantity_change = "For restock, quantity should be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
      // Reset form
      setFormData({
        quantity_change: 0,
        change_type: "restock",
        notes: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error updating stock:", error);
      setErrors({ submit: "Failed to update stock. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (stock: number, minStock: number): "success" | "warning" | "danger" => {
    if (stock === 0) return "danger";
    if (stock <= minStock) return "warning";
    return "success";
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="md" sx={{ maxWidth: 500, width: "90%" }}>
        <ModalClose />
        <Typography level="h4" fontWeight={700} mb={2}>
          Manage Stock
        </Typography>

        {product && (
          <Stack spacing={1} mb={2} p={2} bgcolor="background.level1" borderRadius="sm">
            <Typography level="title-lg">{product.name}</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography level="body-sm" color="neutral">
                Current Stock:
              </Typography>
              <Chip
                color={getStockColor(
                  product.current_stock || 0,
                  product.minimum_stock || 0
                )}
                size="sm"
              >
                {product.current_stock || 0} {product.stock_unit || "units"}
              </Chip>
              {product.minimum_stock && (
                <Typography level="body-xs" color="neutral">
                  (Min: {product.minimum_stock})
                </Typography>
              )}
            </Stack>
          </Stack>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Change Type */}
            <FormControl>
              <FormLabel>Action *</FormLabel>
              <Select
                value={formData.change_type}
                onChange={(_, value) =>
                  setFormData({
                    ...formData,
                    change_type: (value as UpdateStockPayload["change_type"]) || "restock",
                  })
                }
                disabled={loading}
              >
                <Option value="restock">Restock (Add Stock)</Option>
                <Option value="adjustment">Adjustment</Option>
                <Option value="expired">Mark as Expired</Option>
                <Option value="sale">Manual Sale</Option>
              </Select>
            </FormControl>

            {/* Quantity Change */}
            <FormControl error={!!errors.quantity_change}>
              <FormLabel>Quantity Change *</FormLabel>
              <Input
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity_change || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity_change: parseInt(e.target.value) || 0,
                  })
                }
                slotProps={{
                  input: {
                    step: 1,
                  },
                }}
                disabled={loading}
              />
              <Typography level="body-xs" color="neutral">
                {formData.change_type === "restock"
                  ? "Enter positive number to add stock"
                  : "Enter negative number to reduce stock"}
              </Typography>
              {errors.quantity_change && (
                <Typography level="body-sm" color="danger">
                  {errors.quantity_change}
                </Typography>
              )}
            </FormControl>

            {/* Notes */}
            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                placeholder="Optional notes about this stock change..."
                minRows={2}
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={loading}
              />
            </FormControl>

            {/* Error Message */}
            {errors.submit && (
              <Typography level="body-sm" color="danger">
                {errors.submit}
              </Typography>
            )}

            {/* Preview */}
            {product && formData.quantity_change !== 0 && (
              <Stack
                spacing={1}
                p={2}
                bgcolor="primary.softBg"
                borderRadius="sm"
                border="1px solid"
                borderColor="primary.outlinedBorder"
              >
                <Typography level="body-sm" fontWeight={600}>
                  Preview:
                </Typography>
                <Typography level="body-sm">
                  Current: {product.current_stock || 0} {product.stock_unit || "units"} →
                  New: {(product.current_stock || 0) + formData.quantity_change}{" "}
                  {product.stock_unit || "units"}
                </Typography>
              </Stack>
            )}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" color="neutral" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Update Stock
              </Button>
            </Stack>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
