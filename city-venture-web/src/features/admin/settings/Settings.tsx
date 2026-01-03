/**
 * Tourism Admin Settings Page
 * Platform-wide settings management with tabbed interface
 * Includes tabs for Appearance, Legal Policies, and Configuration
 */

import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import {
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Divider,
  AspectRatio,
  Card,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from "@mui/joy";
import { useState, useEffect } from "react";
import {
  Image,
  Palette,
  Layout,
  Camera,
  Save,
  RotateCcw,
  FileText,
  Settings as SettingsIcon,
} from "lucide-react";
import { supabase } from "@/src/lib/supabase";
import { getData, updateData } from "@/src/services/Service";
import LegalPoliciesTab from "./LegalPoliciesTab";

type SettingsTab = "appearance" | "legal-policies" | "configuration";

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("appearance");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingLanding, setUploadingLanding] = useState(false);
  const [uploadingLogin, setUploadingLogin] = useState(false);

  const [settings, setSettings] = useState({
    landingPageImage:
      "https://www2.naga.gov.ph/wp-content/uploads/2021/10/Aerial-View-Naga-City-ScubaFlyer-PH.jpg",
    loginPageImage:
      "https://www2.naga.gov.ph/wp-content/uploads/2021/10/Aerial-View-Naga-City-ScubaFlyer-PH.jpg",
    primaryColor: "#0A1B47",
    secondaryColor: "#FF6B6B",
    accentColor: "#28C76F",
    appName: "City Venture",
    appDescription: "Navigate with Ease - Your Ultimate City Directory",
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: true,
  });

  useEffect(() => {
    // Load existing settings from database
    const loadSettings = async () => {
      try {
        const settingsData = await getData("app_settings");
        if (settingsData && settingsData.length > 0) {
          setSettings({ ...settings, ...settingsData[0] });
        }
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    };
    loadSettings();
  }, []);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "landing" | "login"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({
        ...errors,
        [type]: "Please upload a valid image (JPEG, PNG, or WebP)",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setErrors({ ...errors, [type]: "Image size must be less than 10MB" });
      return;
    }

    const setUploading =
      type === "landing" ? setUploadingLanding : setUploadingLogin;
    setUploading(true);
    setErrors({ ...errors, [type]: "" });

    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `app-settings/${type}-page-${timestamp}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("app-images")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("app-images")
        .getPublicUrl(uploadData.path);

      setSettings({
        ...settings,
        [type === "landing" ? "landingPageImage" : "loginPageImage"]:
          publicData.publicUrl,
      });
    } catch (error: any) {
      console.error("Image upload error:", error);
      setErrors({
        ...errors,
        [type]: "Failed to upload image. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save to database (assuming app_settings table exists)
      await updateData("1", settings, "app_settings");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrors({ submit: "Failed to save settings. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetDefaults = () => {
    if (!confirm("Are you sure you want to reset to default settings?")) return;
    setSettings({
      landingPageImage:
        "https://www2.naga.gov.ph/wp-content/uploads/2021/10/Aerial-View-Naga-City-ScubaFlyer-PH.jpg",
      loginPageImage:
        "https://www2.naga.gov.ph/wp-content/uploads/2021/10/Aerial-View-Naga-City-ScubaFlyer-PH.jpg",
      primaryColor: "#0A1B47",
      secondaryColor: "#FF6B6B",
      accentColor: "#28C76F",
      appName: "City Venture",
      appDescription: "Navigate with Ease - Your Ultimate City Directory",
      maintenanceMode: false,
      allowRegistrations: true,
      requireEmailVerification: true,
    });
  };

  return (
    <PageContainer>
      <Box sx={{ mb: 2 }}>
        <Typography.Title size="sm">Application Settings</Typography.Title>
        <Typography.Body size="sm" color="secondary">
          Configure platform appearance, legal policies, and application
          behavior
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
          <Tab value="appearance" sx={{ borderRadius: "md" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Palette size={16} />
              Appearance
            </Box>
          </Tab>
          <Tab value="legal-policies" sx={{ borderRadius: "md" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FileText size={16} />
              Legal Policies
            </Box>
          </Tab>
          <Tab value="configuration" sx={{ borderRadius: "md" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SettingsIcon size={16} />
              Configuration
            </Box>
          </Tab>
        </TabList>

        {/* Appearance Tab */}
        <TabPanel sx={{ p: 0, pt: 2 }} value="appearance">
          <Container gap="24px" padding="0">
            {/* Landing Page Settings */}
            <Container elevation={2}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Layout size={24} />
                <Typography.CardTitle>
                  Landing Page Settings
                </Typography.CardTitle>
              </div>
              <Divider sx={{ my: 2 }} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <FormControl>
                  <FormLabel>Landing Page Hero Image</FormLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <Card variant="outlined" sx={{ width: 300 }}>
                      <AspectRatio ratio="16/9">
                        <img
                          src={settings.landingPageImage}
                          alt="Landing page preview"
                          style={{ objectFit: "cover" }}
                        />
                      </AspectRatio>
                    </Card>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, "landing")}
                        style={{ display: "none" }}
                        id="landing-upload"
                      />
                      <label htmlFor="landing-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          colorScheme="primary"
                          startDecorator={<Camera size={18} />}
                          disabled={uploadingLanding}
                        >
                          {uploadingLanding ? "Uploading..." : "Change Image"}
                        </Button>
                      </label>
                      {errors.landing && (
                        <FormHelperText sx={{ color: "danger.500", mt: 1 }}>
                          {errors.landing}
                        </FormHelperText>
                      )}
                      <FormHelperText>
                        Recommended size: 1920x1080px. Max 10MB
                      </FormHelperText>
                    </div>
                  </div>
                </FormControl>
              </div>
            </Container>

            {/* Login Page Settings */}
            <Container elevation={2}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Image size={24} />
                <Typography.CardTitle>Login Page Settings</Typography.CardTitle>
              </div>
              <Divider sx={{ my: 2 }} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <FormControl>
                  <FormLabel>Login Page Background Image</FormLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                    }}
                  >
                    <Card variant="outlined" sx={{ width: 300 }}>
                      <AspectRatio ratio="16/9">
                        <img
                          src={settings.loginPageImage}
                          alt="Login page preview"
                          style={{ objectFit: "cover" }}
                        />
                      </AspectRatio>
                    </Card>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => handleImageUpload(e, "login")}
                        style={{ display: "none" }}
                        id="login-upload"
                      />
                      <label htmlFor="login-upload">
                        <Button
                          component="span"
                          variant="outlined"
                          colorScheme="primary"
                          startDecorator={<Camera size={18} />}
                          disabled={uploadingLogin}
                        >
                          {uploadingLogin ? "Uploading..." : "Change Image"}
                        </Button>
                      </label>
                      {errors.login && (
                        <FormHelperText sx={{ color: "danger.500", mt: 1 }}>
                          {errors.login}
                        </FormHelperText>
                      )}
                      <FormHelperText>
                        Recommended size: 1920x1080px. Max 10MB
                      </FormHelperText>
                    </div>
                  </div>
                </FormControl>
              </div>
            </Container>

            {/* Theme Color Settings */}
            <Container elevation={2}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <Palette size={24} />
                <Typography.CardTitle>
                  Theme Color Settings
                </Typography.CardTitle>
              </div>
              <Divider sx={{ my: 2 }} />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                <FormControl>
                  <FormLabel>Primary Color</FormLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <Input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      sx={{ width: 80, height: 50, cursor: "pointer" }}
                    />
                    <Input
                      value={settings.primaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          primaryColor: e.target.value,
                        })
                      }
                      placeholder="#0A1B47"
                      sx={{ flex: 1 }}
                    />
                  </div>
                  <FormHelperText>
                    Main brand color used throughout the app
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Secondary Color</FormLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <Input
                      type="color"
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          secondaryColor: e.target.value,
                        })
                      }
                      sx={{ width: 80, height: 50, cursor: "pointer" }}
                    />
                    <Input
                      value={settings.secondaryColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          secondaryColor: e.target.value,
                        })
                      }
                      placeholder="#FF6B6B"
                      sx={{ flex: 1 }}
                    />
                  </div>
                  <FormHelperText>Secondary accent color</FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Accent Color</FormLabel>
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <Input
                      type="color"
                      value={settings.accentColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          accentColor: e.target.value,
                        })
                      }
                      sx={{ width: 80, height: 50, cursor: "pointer" }}
                    />
                    <Input
                      value={settings.accentColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          accentColor: e.target.value,
                        })
                      }
                      placeholder="#28C76F"
                      sx={{ flex: 1 }}
                    />
                  </div>
                  <FormHelperText>Success and highlight color</FormHelperText>
                </FormControl>
              </div>
            </Container>

            {/* Save Button for Appearance */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                colorScheme="secondary"
                startDecorator={<RotateCcw size={18} />}
                onClick={handleResetDefaults}
              >
                Reset Defaults
              </Button>
              <Button
                variant="solid"
                colorScheme="primary"
                startDecorator={<Save size={18} />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Appearance"}
              </Button>
            </Box>

            {errors.submit && (
              <Container
                elevation={2}
                style={{ backgroundColor: "var(--joy-palette-danger-softBg)" }}
              >
                <Typography.Body sx={{ color: "danger.500" }}>
                  {errors.submit}
                </Typography.Body>
              </Container>
            )}
          </Container>
        </TabPanel>

        {/* Legal Policies Tab */}
        <TabPanel sx={{ p: 0, pt: 2 }} value="legal-policies">
          <LegalPoliciesTab />
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel sx={{ p: 0, pt: 2 }} value="configuration">
          <Container gap="24px" padding="0">
            {/* App Configuration */}
            <Container elevation={2}>
              <Typography.CardTitle>
                Application Configuration
              </Typography.CardTitle>
              <Divider sx={{ my: 2 }} />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <FormControl>
                  <FormLabel>Application Name</FormLabel>
                  <Input
                    value={settings.appName}
                    onChange={(e) =>
                      setSettings({ ...settings, appName: e.target.value })
                    }
                    placeholder="City Venture"
                  />
                  <FormHelperText>
                    Display name for the application
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Application Description</FormLabel>
                  <Input
                    value={settings.appDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        appDescription: e.target.value,
                      })
                    }
                    placeholder="Navigate with Ease - Your Ultimate City Directory"
                  />
                  <FormHelperText>
                    Tagline or subtitle for the application
                  </FormHelperText>
                </FormControl>
              </div>
            </Container>

            {/* Save Button for Configuration */}
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="solid"
                colorScheme="primary"
                startDecorator={<Save size={18} />}
                onClick={handleSaveSettings}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Configuration"}
              </Button>
            </Box>
          </Container>
        </TabPanel>
      </Tabs>
    </PageContainer>
  );
};

export default Settings;
