import React from "react";
import { Box, Chip, Grid } from "@mui/joy";
import AddressContact from "./AddressContact";
import ActionButtons from "./ActionButtons";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import NoDataFound from "@/src/components/NoDataFound";
import { colors } from "@/src/utils/Colors";

// Safe extractor for string-like fields coming from loosely-typed API items
const getStr = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

import type { ApprovalTableItem } from "@/src/types/approval";

interface ApprovalTableProps {
  items: unknown[];
  contentType: string;
  onView: (item: ApprovalTableItem) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  processingId?: string | null;
}

const ApprovalTable: React.FC<ApprovalTableProps> = ({
  items,
  contentType,
  onView,
  onApprove,
  onReject,
  processingId,
}) => {
  if (items.length === 0) {
    return (
      <NoDataFound
        title="No pending items"
        message={`No pending ${contentType.toLowerCase()} found. New submissions will appear here.`}
        icon="inbox"
        size="medium"
      />
    );
  }

  return (
    <Box>
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {items.map((itemRaw, idx) => {
          const item = itemRaw as ApprovalTableItem;
          const key = String(item.id ?? idx);

          const submitted = (() => {
            const dateRaw =
              (item.created_at as string) ||
              (item.submitted_at as string) ||
              "";
            if (!dateRaw) return "-";
            const d = new Date(dateRaw);
            return isNaN(d.getTime()) ? "-" : d.toLocaleDateString();
          })();

          const description =
            typeof item.description === "string" ? item.description : undefined;

          const isProcessing =
            processingId != null && processingId === String(item.id);
          const i = item as Record<string, unknown>;
          const barangay =
            getStr(i["barangay"]) ?? getStr(i["barangay_name"]) ?? getStr(i["brgy"]);
          const municipality =
            getStr(i["municipality"]) ??
            getStr(i["municipality_name"]) ??
            getStr(i["city"]) ??
            getStr(i["city_name"]);
          const province = getStr(i["province"]) ?? getStr(i["province_name"]);
          const addressParts = [barangay, municipality, province].filter(
            (p): p is string => Boolean(p)
          );
          const address = addressParts.length ? addressParts.join(", ") : undefined;
          const contactNo =
            getStr(i["contact_phone"]) ??
            getStr(i["phone"]) ??
            getStr(i["contact"]) ??
            getStr(i["mobile"]);

          return (
            <Grid key={key} xs={12} sm={6} md={4} lg={3} xl={3}>
              <Container
                hover
                hoverEffect="lift"
                padding="1.5rem"
                radius="12px"
                background={colors.background}
                gap="1rem"
                style={{
                  height: "100%",
                  border: `1px solid #e0e0e0`,
                  cursor: "pointer",
                }}
              >
                {/* Header with name and status chip */}
                <Container
                  direction="row"
                  justify="space-between"
                  align="flex-start"
                  padding="0"
                  gap="0.75rem"
                >
                  <Container padding="0" gap="0.25rem" flex={1}>
                    <Typography.CardTitle size="sm">
                      {String(
                        (item.name as string) ||
                          (item.business_name as string) ||
                          "-"
                      )}
                    </Typography.CardTitle>
                    <Typography.Body size="xs" color="default">
                      Submitted: {submitted}
                    </Typography.Body>
                    {/* Business Type & Category chips (if available) */}
                    <Container
                      direction="row"
                      gap="0.25rem"
                      padding="0"
                      style={{ flexWrap: "wrap" }}
                    >
                      {(() => {
                        const businessTypeName =
                          (item as any).business_type_name ||
                          (item as any).type ||
                          (item as any).type_name;
                        const businessCategoryName =
                          (item as any).business_category_name ||
                          (item as any).category ||
                          (item as any).category_name;
                        return (
                          <>
                            {businessTypeName && (
                              <Chip size="sm" color="neutral" variant="soft">
                                {String(businessTypeName)}
                              </Chip>
                            )}
                            {businessCategoryName && (
                              <Chip size="sm" color="warning" variant="soft">
                                {String(businessCategoryName)}
                              </Chip>
                            )}
                          </>
                        );
                      })()}
                    </Container>
                  </Container>
                  <Chip
                    size="sm"
                    color={
                      String(item.action_type) === "new"
                        ? "success"
                        : "primary"
                    }
                    variant="solid"
                  >
                    {String(item.action_type) === "new" ? "New" : "Edit"}
                  </Chip>
                </Container>

                {/* Description */}
                {description && (
                  <Typography.Body size="xs" color="default">
                    {description.slice(0, 180)}
                    {description.length > 180 ? "…" : ""}
                  </Typography.Body>
                )}

                <AddressContact address={address} contact={contactNo} />

                {/* Action Buttons */}
                <Box sx={{ mt: "auto", pt: 1 }}>
                  <ActionButtons
                    item={item}
                    onView={onView}
                    onApprove={onApprove}
                    onReject={onReject}
                    isProcessing={isProcessing}
                  />
                </Box>
              </Container>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ApprovalTable;
