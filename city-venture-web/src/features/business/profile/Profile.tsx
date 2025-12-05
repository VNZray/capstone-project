import PageContainer from "@/src/components/PageContainer";
import Alert from "@/src/components/Alert";
import Container from "@/src/components/Container";
import { useAuth } from "@/src/context/AuthContext";
import Header from "../../landing-page/components/Header";
import { useState, useEffect } from "react";
import apiClient from "@/src/services/apiClient";
import { Box, Grid, Stack } from "@mui/joy";
import type { Permit } from "@/src/types/Permit";
import {
  getPermitsByBusiness,
  updatePermit,
  insertPermit,
  deletePermit,
} from "@/src/services/approval/PermitService";

// Import components
import HeaderSection from "./components/HeaderSection";
import QuickStats from "./components/QuickStats";
import PersonalInformation from "./components/PersonalInformation";
import Permits from "./components/Permits";
import AccountSecurity from "./components/AccountSecurity";
import Activity from "./components/Activity";
import PasswordModal from "./components/PasswordModal";
import PermitModal from "./components/PermitModal";

type Business = {
  id: string;
  business_name: string;
  owner_id: string;
};

const OwnerProfile = () => {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPermitModal, setShowPermitModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  }>({
    type: "info",
    title: "",
    message: "",
  });

  // Business and Permit management state
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loadingPermits, setLoadingPermits] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [currentBusinessId, setCurrentBusinessId] = useState<string>("");
  const [permitForm, setPermitForm] = useState({
    permit_type: "",
    file_url: "",
    file_format: "",
    file_size: 0,
    file_name: "",
    expiration_date: "",
  });

  const permitTypes = ["Business Permit", "Mayor's Permit"];

  // Form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    middle_name: user?.middle_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    gender: user?.gender || "",
    birthdate: user?.birthdate || "",
    nationality: user?.nationality || "",
    ethnicity: user?.ethnicity || "",
    address: user?.address || "",
    user_profile: user?.user_profile || "",
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Handlers
  const handleProfileUpdate = () => {
    console.log("Updating profile:", profileData);
    setEditMode(false);
    setAlertConfig({
      type: "success",
      title: "Profile Updated",
      message: "Your profile has been successfully updated.",
    });
    setShowAlert(true);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlertConfig({
        type: "error",
        title: "Password Mismatch",
        message: "New password and confirm password do not match.",
      });
      setShowAlert(true);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setAlertConfig({
        type: "error",
        title: "Weak Password",
        message: "Password must be at least 8 characters long.",
      });
      setShowAlert(true);
      return;
    }

    console.log("Changing password");
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setAlertConfig({
      type: "success",
      title: "Password Changed",
      message: "Your password has been successfully changed.",
    });
    setShowAlert(true);
  };

  const handleProfileImageUpload = (publicUrl: string) => {
    setProfileData({ ...profileData, user_profile: publicUrl });
    setAlertConfig({
      type: "success",
      title: "Profile Image Updated",
      message: "Your profile image has been successfully updated.",
    });
    setShowAlert(true);
  };

  const handleProfileDataChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  // Fetch businesses owned by user
  useEffect(() => {
    if (user?.id) {
      fetchBusinesses();
    }
  }, [user?.id]);

  const fetchBusinesses = async () => {
    if (!user?.id) return;

    try {
      setLoadingBusinesses(true);
      const { data } = await apiClient.get(`/business/owner/${user.id}`);
      const businessList = Array.isArray(data) ? data : [data];
      setBusinesses(businessList);
      if (businessList.length > 0) {
        await fetchPermitsForBusinesses(businessList);
      }
    } catch (error) {
      console.error("Error fetching businesses:", error);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const fetchPermitsForBusinesses = async (businessList: Business[]) => {
    if (businessList.length === 0) return;

    try {
      setLoadingPermits(true);
      const allPermits: Permit[] = [];

      for (const business of businessList) {
        try {
          const permits = await getPermitsByBusiness(business.id);
          const businessPermits = permits.map((permit: Permit) => ({
            ...permit,
            business_name: business.business_name,
          }));
          allPermits.push(...businessPermits);
        } catch (error) {
          console.error(
            `Error fetching permits for business ${business.id}:`,
            error
          );
        }
      }

      setPermits(allPermits);
    } catch (error) {
      console.error("Error fetching permits:", error);
      setAlertConfig({
        type: "error",
        title: "Error",
        message: "Failed to load permits.",
      });
      setShowAlert(true);
    } finally {
      setLoadingPermits(false);
    }
  };

  const fetchPermitsWrapper = async () => {
    await fetchPermitsForBusinesses(businesses);
  };

  const handlePermitUpload = async () => {
    if (
      !currentBusinessId ||
      !permitForm.permit_type ||
      !permitForm.file_url ||
      !permitForm.expiration_date
    ) {
      setAlertConfig({
        type: "error",
        title: "Validation Error",
        message:
          "Please select permit type, upload a file, and set expiration date.",
      });
      setShowAlert(true);
      return;
    }

    try {
      const fileExtension =
        permitForm.file_url.split(".").pop()?.toLowerCase() || "";
      const payload = {
        business_id: currentBusinessId,
        permit_type: permitForm.permit_type,
        file_url: permitForm.file_url,
        file_format: fileExtension,
        file_size: permitForm.file_size || 0,
        file_name: permitForm.file_name,
        expiration_date: permitForm.expiration_date,
        status: "pending",
      };

      if (selectedPermit) {
        await updatePermit(selectedPermit.id as string, payload);
        setAlertConfig({
          type: "success",
          title: "Permit Updated",
          message: `${permitForm.permit_type} has been updated successfully.`,
        });
      } else {
        await insertPermit(payload);
        setAlertConfig({
          type: "success",
          title: "Permit Uploaded",
          message: `${permitForm.permit_type} has been uploaded successfully.`,
        });
      }

      setShowAlert(true);
      fetchPermitsWrapper();
      resetPermitForm();
    } catch (error) {
      console.error("Error uploading permit:", error);
      setAlertConfig({
        type: "error",
        title: "Upload Failed",
        message: "Failed to upload permit. Please try again.",
      });
      setShowAlert(true);
    }
  };

  const handleDeletePermit = async (permitId: string) => {
    if (!window.confirm("Are you sure you want to delete this permit?")) {
      return;
    }

    try {
      await deletePermit(permitId);
      setAlertConfig({
        type: "success",
        title: "Permit Deleted",
        message: "Permit has been deleted successfully.",
      });
      setShowAlert(true);
      fetchPermitsWrapper();
    } catch (error) {
      console.error("Error deleting permit:", error);
      setAlertConfig({
        type: "error",
        title: "Delete Failed",
        message: "Failed to delete permit. Please try again.",
      });
      setShowAlert(true);
    }
  };

  const openEditPermit = (permit: Permit, businessId: string) => {
    setSelectedPermit(permit);
    setCurrentBusinessId(businessId);
    setPermitForm({
      permit_type: permit.permit_type,
      file_url: permit.file_url,
      file_format: permit.file_format,
      file_size: permit.file_size,
      file_name: permit.file_name || "",
      expiration_date: permit.expiration_date || "",
    });
    setShowPermitModal(true);
  };

  const handleUploadClick = (businessId: string, permitType: string) => {
    setCurrentBusinessId(businessId);
    setPermitForm({
      permit_type: permitType,
      file_url: "",
      file_format: "",
      file_size: 0,
      file_name: "",
      expiration_date: "",
    });
    setShowPermitModal(true);
  };

  const resetPermitForm = () => {
    setSelectedPermit(null);
    setCurrentBusinessId("");
    setPermitForm({
      permit_type: "",
      file_url: "",
      file_format: "",
      file_size: 0,
      file_name: "",
      expiration_date: "",
    });
    setShowPermitModal(false);
  };

  const isPermitExpired = (expirationDate?: string) => {
    if (!expirationDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    expDate.setHours(0, 0, 0, 0);
    return expDate <= today;
  };

  const getPermitStatusColor = (
    status: string,
    expirationDate?: string
  ): "danger" | "success" | "warning" | "neutral" => {
    if (isPermitExpired(expirationDate)) return "danger";
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "neutral";
    }
  };

  return (
    <>
      <Header />

      <Box
        gap={0}
        sx={{
          paddingTop: 10,
          paddingLeft: { xs: 2, sm: 2, md: 30, lg: 40 },
          paddingRight: { xs: 2, sm: 2, md: 30, lg: 40 },
          paddingBottom: 10,
        }}
      >
        {/* Header Section */}
        <HeaderSection
          profileData={profileData}
          user={user}
          editMode={editMode}
          onEditToggle={() => setEditMode(true)}
          onSave={handleProfileUpdate}
          onCancel={() => setEditMode(false)}
          onPasswordChange={() => setShowPasswordModal(true)}
          onProfileImageUpload={handleProfileImageUpload}
        />

        {/* Quick Stats */}
        <QuickStats user={user} permits={permits} />

        {/* Main Content Grid */}
        <Grid container spacing={2}>
          {/* Personal Information & Permits */}
          <Grid xs={12} md={8}>
            <Container padding="0">
              <Stack spacing={2}>
                <PersonalInformation
                  profileData={profileData}
                  editMode={editMode}
                  onChange={handleProfileDataChange}
                />

                {(user?.role_name === "Owner" ||
                  user?.role_name === "Business Owner") && (
                  <Permits
                    businesses={businesses}
                    permits={permits}
                    loadingPermits={loadingPermits}
                    loadingBusinesses={loadingBusinesses}
                    onUploadClick={handleUploadClick}
                    onEditPermit={openEditPermit}
                    onDeletePermit={handleDeletePermit}
                    isPermitExpired={isPermitExpired}
                    getPermitStatusColor={getPermitStatusColor}
                  />
                )}
              </Stack>
            </Container>
          </Grid>

          {/* Right Sidebar */}
          <Grid xs={12} md={4}>
            <Stack spacing={2}>
              <AccountSecurity
                email={profileData.email}
                onPasswordChange={() => setShowPasswordModal(true)}
              />
              {user && <Activity user={user} />}
            </Stack>
          </Grid>
        </Grid>

        {/* Password Change Modal */}
        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          passwordData={passwordData}
          showPasswords={showPasswords}
          onPasswordChange={(field, value) =>
            setPasswordData({ ...passwordData, [field]: value })
          }
          onTogglePassword={(field) =>
            setShowPasswords({
              ...showPasswords,
              [field]: !showPasswords[field],
            })
          }
          onSubmit={handlePasswordChange}
        />

        {/* Permit Upload Modal */}

        <PermitModal
          open={showPermitModal}
          onClose={() => {
            setShowPermitModal(false);
            resetPermitForm();
          }}
          permitForm={permitForm}
          selectedPermit={selectedPermit}
          currentBusinessId={currentBusinessId}
          businessName={
            businesses.find((b) => b.id === currentBusinessId)?.business_name ||
            ""
          }
          permitTypes={permitTypes}
          onPermitFormChange={(field, value) =>
            setPermitForm({ ...permitForm, [field]: value })
          }
          onFileUpload={(url, fileName) =>
            setPermitForm({
              ...permitForm,
              file_url: url,
              file_name: fileName,
            })
          }
          onSubmit={handlePermitUpload}
        />

        {/* Alert Component */}
        <Alert
          open={showAlert}
          onClose={() => setShowAlert(false)}
          type={alertConfig.type}
          title={alertConfig.title}
          message={alertConfig.message}
          showCancel={false}
          confirmText="OK"
        />
      </Box>
    </>
  );
};

export default OwnerProfile;
