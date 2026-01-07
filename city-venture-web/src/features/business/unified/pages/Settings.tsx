/**
 * Unified Settings Page
 * Business settings management - shared across all business types
 * Includes tabs for House Rules, Policies, and General Settings
 */

import { useState } from "react";
import { Box, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import { Home, FileText, Settings as SettingsIcon } from "lucide-react";
import PageContainer from "@/src/components/PageContainer";
import Typography from "@/src/components/Typography";
import { useBusiness } from "@/src/context/BusinessContext";
import HouseRulesTab from "./settings/HouseRulesTab";
import PolicyTextsTab from "./settings/PolicyTextsTab";

type SettingsTab = "house-rules" | "policies" | "general";

const Settings = () => {
  const { businessDetails } = useBusiness();
  const [activeTab, setActiveTab] = useState<SettingsTab>("house-rules");

  const businessId = businessDetails?.id;

  if (!businessId) {
    return (
      <PageContainer>
        <Typography.Title>Settings</Typography.Title>
        <Typography.Body color="error">
          No business selected. Please select a business first.
        </Typography.Body>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Box sx={{ mb: 2 }}>
        <Typography.Title size="sm">Settings</Typography.Title>
        <Typography.Body size="sm" color="secondary">
          Manage your business house rules, policies, and general settings
        </Typography.Body>
      </Box>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value as SettingsTab)}
        sx={{ borderRadius: "lg", overflow: "hidden" }}
      >
        <TabList
          sx={{
            pt: 1,
            justifyContent: "flex-start",
            gap: 1,
          }}
        >
          <Tab value="house-rules" sx={{ borderRadius: "md" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Home size={16} />
              House Rules
            </Box>
          </Tab>
          <Tab value="policies" sx={{ borderRadius: "md" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FileText size={16} />
              Policies
            </Box>
          </Tab>
          <Tab value="general" sx={{ borderRadius: "md" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SettingsIcon size={16} />
              General
            </Box>
          </Tab>
        </TabList>

        <TabPanel sx={{ p: 0, pt: 2 }} value="house-rules">
          <HouseRulesTab businessId={businessId} />
        </TabPanel>

        <TabPanel sx={{ p: 0, pt: 2 }} value="policies">
          <PolicyTextsTab businessId={businessId} />
        </TabPanel>

        <TabPanel sx={{ p: 0, pt: 2 }} value="general">
          <Box sx={{ textAlign: "center", py: 4 }}>
            <SettingsIcon size={48} strokeWidth={1} />
            <Typography.Header size="sm">General Settings</Typography.Header>
            <Typography.Body size="sm" color="secondary">
              General business settings will be available here soon.
            </Typography.Body>
          </Box>
        </TabPanel>
      </Tabs>
    </PageContainer>
  );
};

export default Settings;
