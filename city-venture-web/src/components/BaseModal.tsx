import React from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Button from "./Button";
import Typography from "./Typography";
import { colors } from "../utils/Colors";

type Action = {
  label: string;
  onClick: () => void;
  variant?: "solid" | "outlined" | "soft";
  colorScheme?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "info";
  disabled?: boolean;
};

type BaseModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  actions?: Action[];
  children?: React.ReactNode;
  maxWidth?: string | number;
  showCloseButton?: boolean;
  headerContent?: React.ReactNode;
  headerRight?: React.ReactNode;
  footerAlign?: "left" | "center" | "right";
  size?: "sm" | "md" | "lg";
};

/**
 * BaseModal
 * A flexible, reusable modal dialog component using Joy UI.
 *
 * Features:
 * - Click outside to close
 * - Escape key closes
 * - Customizable header with title, description, or custom content
 * - Optional close button
 * - Scrollable content area
 * - Customizable footer with action buttons
 * - Responsive design with three size options
 * - Consistent styling and spacing
 *
 * Props:
 * @param {boolean} open - Controls modal visibility
 * @param {() => void} onClose - Callback when modal should close
 * @param {string} title - Modal title (optional)
 * @param {string} description - Modal description subtitle (optional)
 * @param {Action[]} actions - Array of action buttons for footer (optional)
 * @param {React.ReactNode} children - Modal content
 * @param {string | number} maxWidth - Custom max width (optional)
 * @param {boolean} showCloseButton - Show/hide close button (default: true)
 * @param {React.ReactNode} headerContent - Custom header content (replaces title/description)
 * @param {React.ReactNode} headerRight - Content to display in upper right of header (optional)
 * @param {"left" | "center" | "right"} footerAlign - Footer button alignment (default: "right")
 * @param {"sm" | "md" | "lg"} size - Predefined size (default: "md")
 *
 * Usage examples at bottom of file
 */
export default function BaseModal({
  open,
  onClose,
  title,
  description,
  actions = [],
  children,
  maxWidth,
  showCloseButton = true,
  headerContent,
  headerRight,
  footerAlign = "right",
  size = "md",
}: BaseModalProps) {
  // Size configurations
  const sizeConfig = {
    sm: { maxWidth: "500px" },
    md: { maxWidth: "900px" },
    lg: { maxWidth: "1200px" },
  };

  const finalMaxWidth = maxWidth || sizeConfig[size].maxWidth;

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        variant="outlined"
        size="lg"
        sx={{
          width: {
            xs: "calc(100% - 2rem)",
            sm: "calc(100% - 4rem)",
            md: "90%",
          },
          maxWidth:
            typeof finalMaxWidth === "number"
              ? `${finalMaxWidth}px`
              : finalMaxWidth,
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          maxHeight: "90vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          position: "relative",
        }}
      >
        {/* Close Button - Upper Right */}
        {showCloseButton && (
          <IconButton
            variant="plain"
            color="neutral"
            onClick={onClose}
            size="sm"
            sx={{
              position: "absolute",
              top: "clamp(0.75rem, 2vw, 1rem)",
              right: "clamp(0.75rem, 2vw, 1rem)",
              zIndex: 10,
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(4px)",
              "&:hover": {
                backgroundColor: colors.error + "10",
                color: colors.error,
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        )}

        {/* Header */}
        {(title || description || headerContent || headerRight) && (
          <DialogTitle
            sx={{
              padding: "clamp(1rem, 3vw, 1.5rem)",
              paddingRight: "clamp(3rem, 8vw, 4rem)", // Space for close button
              borderBottom: `1px solid #e0e0e0`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {headerContent || (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <Typography.Header size="sm" weight="bold">
                    {title}
                  </Typography.Header>
                )}
                {description && (
                  <Typography.Body
                    size="xs"
                    sx={{ opacity: 0.7, marginTop: "4px" }}
                  >
                    {description}
                  </Typography.Body>
                )}
              </Box>
            )}
            {headerRight && <Box sx={{ flexShrink: 0 }}>{headerRight}</Box>}
          </DialogTitle>
        )}

        {/* Content */}
        <DialogContent
          sx={{
            padding: 0,
            overflow: "auto",
            flex: 1,
          }}
        >
          {children}
        </DialogContent>

        {/* Footer */}
        {actions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent:
                footerAlign === "left"
                  ? "flex-start"
                  : footerAlign === "center"
                  ? "center"
                  : "flex-end",
              padding: "clamp(1rem, 3vw, 1.5rem)",
              borderTop: `1px solid #e0e0e0`,
              backgroundColor: "#fafafa",
              flexWrap: "wrap",
            }}
          >
            {actions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant || "solid"}
                colorScheme={action.colorScheme || "primary"}
                onClick={action.onClick}
                disabled={action.disabled}
                size="md"
                sx={{
                  minWidth: { xs: "100px", sm: "120px" },
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                }}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
}

// Usage examples:
//
// Basic usage with title and description:
// <BaseModal
//   open={open}
//   onClose={() => setOpen(false)}
//   title="Review Submission"
//   description="Carefully review all details before approving"
//   actions={[
//     { label: 'Cancel', onClick: () => setOpen(false), variant: 'soft' },
//     { label: 'Reject', onClick: handleReject, colorScheme: 'error' },
//     { label: 'Approve', onClick: handleApprove, colorScheme: 'success' }
//   ]}
// >
//   <Box sx={{ padding: 3 }}>Your content here</Box>
// </BaseModal>
//
// With custom header content:
// <BaseModal
//   open={open}
//   onClose={() => setOpen(false)}
//   headerContent={<CustomHeader />}
//   actions={[...]}
// >
//   <YourContent />
// </BaseModal>
//
// Large modal for detailed views:
// <BaseModal
//   open={open}
//   onClose={() => setOpen(false)}
//   size="lg"
//   title="Detailed View"
//   actions={[...]}
// >
//   <YourDetailedContent />
// </BaseModal>
