import { Box, Stack } from "@mui/joy";
import { Building2, FileText, Upload } from "lucide-react";
import Typography from "@/src/components/Typography";
import Container from "@/src/components/Container";
import Button from "@/src/components/Button";
import NoDataFound from "@/src/components/NoDataFound";
import { colors } from "@/src/utils/Colors";
import type { Permit } from "@/src/types/Permit";
import FileItem from "./FileItem";

interface PermitsProps {
  businesses: Array<{ id: string; business_name: string }>;
  permits: Permit[];
  loadingPermits: boolean;
  loadingBusinesses: boolean;
  onUploadClick: (businessId: string, permitType: string) => void;
  onEditPermit: (permit: Permit, businessId: string) => void;
  onDeletePermit: (permitId: string) => void;
  isPermitExpired: (expirationDate?: string) => boolean;
  getPermitStatusColor: (
    status: string,
    expirationDate?: string
  ) => "danger" | "success" | "warning" | "neutral";
}

const Permits = ({
  businesses,
  permits,
  loadingPermits,
  loadingBusinesses,
  onUploadClick,
  onEditPermit,
  onDeletePermit,
  isPermitExpired,
  getPermitStatusColor,
}: PermitsProps) => {
  return (
    <Container elevation={2}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FileText size={24} color={colors.primary} />
          <Typography.CardTitle size="sm">Permits</Typography.CardTitle>
        </Box>
      </Box>

      {loadingPermits || loadingBusinesses ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography.Body>Loading permits...</Typography.Body>
        </Box>
      ) : businesses.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Building2 size={48} color={colors.secondary} />
          <Typography.Body color="default" sx={{ mt: 2 }}>
            No businesses found
          </Typography.Body>
          <Typography.Body size="sm" color="default">
            Register a business first to upload permits
          </Typography.Body>
        </Box>
      ) : (
        <Stack spacing={3}>
          {businesses.map((business) => {
            const businessPermits = permits.filter(
              (p) => p.business_id === business.id
            );

            return (
              <Box
                key={business.id}
                sx={{
                  border: `1px solid #e0e0e0`,
                  borderRadius: "8px",
                  p: 2,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography.CardTitle
                    startDecorator={<Building2 color={colors.primary} />}
                    size="sm"
                  >
                    {business.business_name}
                  </Typography.CardTitle>
                  <Button
                    size="sm"
                    variant="outlined"
                    colorScheme="primary"
                    startDecorator={<Upload size={16} />}
                    onClick={() =>
                      onUploadClick(business.id, "Business Permit")
                    }
                  >
                    Upload Permit
                  </Button>
                </Box>

                <Stack spacing={2}>
                  {businessPermits.length === 0 ? (
                    <NoDataFound
                      title="No Permit Uploaded"
                      message="Upload Permit First to list your business"
                      icon="database"
                    >
                      <Button
                        size="sm"
                        variant="outlined"
                        colorScheme="primary"
                        startDecorator={<Upload size={16} />}
                        onClick={() =>
                          onUploadClick(business.id, "Business Permit")
                        }
                      >
                        Upload Permit
                      </Button>
                    </NoDataFound>
                  ) : (
                    <Stack spacing={1.5}>
                      {businessPermits.map((permit) => (
                        <FileItem
                          key={permit.id}
                          fileName={permit.file_name || `${permit.permit_type} - ${permit.id.slice(0, 8)}`}
                          status={permit.status}
                          statusLabel={
                            isPermitExpired(permit.expiration_date)
                              ? "Permit Expired"
                              : undefined
                          }
                          statusColor={getPermitStatusColor(
                            permit.status,
                            permit.expiration_date
                          )}
                          dateUploaded={new Date(
                            permit.submitted_at
                          ).toLocaleDateString()}
                          dateApproved={
                            permit.approved_at
                              ? new Date(
                                  permit.approved_at
                                ).toLocaleDateString()
                              : undefined
                          }
                          isExpired={isPermitExpired(permit.expiration_date)}
                          onClick={() => window.open(permit.file_url, "_blank")}
                          onUpdate={() => onEditPermit(permit, business.id)}
                          onDelete={() => onDeletePermit(permit.id)}
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Container>
  );
};

export default Permits;
