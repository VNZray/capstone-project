import Typography from "@/src/components/Typography";
import type { Business } from "@/src/types/Business";
import type { Address } from "@/src/types/Address";
import type { Owner } from "@/src/types/Owner";
import type { User } from "@/src/types/User";
import type { Permit } from "@/src/types/Permit";
import { Box, Card, CardContent, Checkbox } from "@mui/joy";
import { useAddress } from "@/src/hooks/useAddress";
import { useEffect, useState } from "react";
import { fetchCategoryTree } from "@/src/services/BusinessService";
import type { CategoryTree } from "@/src/types/Category";
import { colors } from "@/src/utils/Colors";
import { CheckCircle } from "lucide-react";

type Props = {
  data: Business;
  setData: React.Dispatch<React.SetStateAction<Business>>;
  addressData: Address;
  ownerData: Owner;
  userData: User;
  permitData: Permit[];
};

const Step5: React.FC<Props> = ({ data, ownerData, userData, permitData }) => {
  const { address } = useAddress(data?.barangay_id);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>(
    []
  );
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tree = await fetchCategoryTree();

        const flatCategories: CategoryTree[] = [];
        const flatten = (cats: CategoryTree[]) => {
          for (const cat of cats) {
            flatCategories.push(cat);
            if (cat.children) flatten(cat.children);
          }
        };
        flatten(tree);

        if (data?.category_ids && data.category_ids.length > 0) {
          const names = data.category_ids
            .map((id) => flatCategories.find((c) => c.id === id)?.title)
            .filter((name): name is string => !!name);
          setSelectedCategoryNames(names);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, [data?.category_ids]);

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | null;
  }) => (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 1,
        borderBottom: `1px solid ${colors.tertiary}`,
      }}
    >
      <Typography.Label size="sm">{label}</Typography.Label>
      <Typography.Body
        size="sm"
        sx={{ textAlign: "right", color: colors.text }}
      >
        {value || "N/A"}
      </Typography.Body>
    </Box>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography.Header sx={{ mb: 1, color: colors.primary }}>
        Review & Submit
      </Typography.Header>
      <Typography.Body sx={{ mb: 4, color: colors.gray, fontSize: "0.95rem" }}>
        Confirm your information
      </Typography.Body>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Business Information */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "12px",
            border: `1px solid ${colors.tertiary}`,
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Typography.CardTitle size="sm" sx={{ mb: 2 }}>
              Business Information
            </Typography.CardTitle>
            <InfoRow label="Business Name" value={data.business_name} />
            <InfoRow
              label="Industry"
              value={selectedCategoryNames.join(", ")}
            />
            <InfoRow label="Category" value={selectedCategoryNames[0]} />
            <InfoRow label="Tax ID" value="N/A" />
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "12px",
            border: `1px solid ${colors.tertiary}`,
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Typography.CardTitle size="sm" sx={{ mb: 2 }}>
              Owner Information
            </Typography.CardTitle>
            <InfoRow
              label="Name"
              value={`${ownerData.first_name} ${ownerData.last_name}`}
            />
            <InfoRow label="Email" value={userData.email} />
            <InfoRow label="Phone" value={userData.phone_number} />
            <InfoRow label="Date of Birth" value={ownerData.birthdate} />
          </CardContent>
        </Card>

        {/* Business Location */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "12px",
            border: `1px solid ${colors.tertiary}`,
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Typography.CardTitle size="sm" sx={{ mb: 2 }}>
              Business Location
            </Typography.CardTitle>
            <InfoRow label="Address" value={data.address} />
            <InfoRow
              label="City, State"
              value={
                address
                  ? `${address.municipality_name}, ${address.province_name}`
                  : ""
              }
            />
            <InfoRow label="ZIP Code" value={data.barangay_id} />
            <InfoRow label="Country" value="Philippines" />
          </CardContent>
        </Card>

        {/* Permits & Licenses */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "12px",
            border: `1px solid ${colors.tertiary}`,
            boxShadow: "none",
          }}
        >
          <CardContent>
            <Typography.CardTitle size="sm" sx={{ mb: 2 }}>
              Permits & Licenses
            </Typography.CardTitle>
            {permitData.map((permit, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  borderBottom:
                    index < permitData.length - 1
                      ? `1px solid ${colors.tertiary}`
                      : "none",
                }}
              >
                <CheckCircle size={20} color={colors.success} />
                <Box sx={{ flex: 1 }}>
                  <Typography.Body size="sm" weight="semibold">
                    {permit.permit_type}
                  </Typography.Body>
                  <Typography.Body size="sm" sx={{ color: colors.gray }}>
                    Expires: {permit.expiration_date || "N/A"}
                  </Typography.Body>
                </Box>
              </Box>
            ))}
          </CardContent>
        </Card>

        {/* Agreement Checkbox */}
        <Box
          sx={{
            p: 3,
            borderRadius: "8px",
            backgroundColor: colors.lightBackground,
            border: `1px solid ${colors.tertiary}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              sx={{ mt: 0.5 }}
            />
            <Typography.Body size="sm">
              I certify that all information provided is accurate and complete.
              I understand that providing false information may result in denial
              of my application or revocation of my business license.
            </Typography.Body>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Step5;
