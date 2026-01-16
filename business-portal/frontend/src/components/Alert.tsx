import React from "react";
import { Modal, Sheet, Box, Divider } from "@mui/joy";
import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import Typography from "./Typography";
import Button from "./Button";
import { colors } from "../utils/Colors";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertProps {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type?: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  open,
  onClose,
  onConfirm,
  type = "info",
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  loading = false,
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={64} />;
      case "error":
        return <XCircle size={64} />;
      case "warning":
        return <AlertTriangle size={64} />;
      case "info":
      default:
        return <Info size={64} />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return colors.success; // success green
      case "error":
        return colors.error; // error red
      case "warning":
        return colors.warning; // warning orange
      case "info":
      default:
        return colors.info; // info blue
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "success";
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
      default:
        return "primary";
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
        }}
      >
        <Box sx={{ p: 4 }}>
          <Box
            sx={{
              textAlign: "center",
              color: getIconColor(),
              animation: "fadeIn 0.3s ease-in-out",
              pb: 2,
            }}
          >
            {getIcon()}
          </Box>

          {/* Message */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography.CardTitle textAlign={"center"} align="center" size="sm">
              {title}
            </Typography.CardTitle>
          </Box>

          {/* Message */}
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography.Body textAlign={"center"} align="center" size="sm">
              {message}
            </Typography.Body>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: showCancel ? "space-between" : "center",
            }}
          >
            {showCancel && (
              <Button
                variant="outlined"
                colorScheme="secondary"
                onClick={onClose}
                disabled={loading}
                sx={{
                  flex: 1,
                  py: 1.5,
                }}
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant="solid"
              colorScheme={getButtonColor()}
              onClick={handleConfirm}
              loading={loading}
              sx={{
                flex: 1,
                py: 1.5,
              }}
            >
              {confirmText}
            </Button>
          </Box>
        </Box>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </Sheet>
    </Modal>
  );
};

export default Alert;
