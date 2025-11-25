import PageContainer from "@/src/components/PageContainer";
import Container from "@/src/components/Container";
import Typography from "@/src/components/Typography";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/context/AuthContext";
import { Avatar, Input, FormControl, FormLabel, FormHelperText, Divider, Chip, Switch, Modal, ModalDialog, DialogTitle, DialogContent, DialogActions } from "@mui/joy";
import { useState } from "react";
import { Edit, Save, X, Camera, Mail, Phone, MapPin, Calendar, User as UserIcon, Lock, Key, Shield, Trash2, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { updateData } from "@/src/services/Service";
import { supabase } from "@/src/lib/supabase";
import { useNavigate } from "react-router-dom";

const TourismProfile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    middle_name: user?.middle_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
    user_profile: user?.user_profile || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReport: false,
    monthlyReport: true,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, user_profile: "Please upload a valid image (JPEG, PNG, or WebP)" });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors({ ...errors, user_profile: "Image size must be less than 5MB" });
      return;
    }

    setUploadingImage(true);
    setErrors({ ...errors, user_profile: "" });

    try {
      const fileExt = file.name.split(".").pop();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `user-profiles/${user?.id}/profile-${timestamp}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("user-profiles")
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from("user-profiles")
        .getPublicUrl(uploadData.path);

      setFormData({ ...formData, user_profile: publicData.publicUrl });
    } catch (error: any) {
      console.error("Image upload error:", error);
      setErrors({ ...errors, user_profile: "Failed to upload image. Please try again." });
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (formData.phone_number && !/^\+?[0-9]{10,15}$/.test(formData.phone_number.replace(/[\s-]/g, ""))) {
      newErrors.phone_number = "Invalid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await updateData(user?.id || "", formData, "user");
      setIsEditing(false);
      // Optionally refresh user data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ submit: "Failed to update profile. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || "",
      middle_name: user?.middle_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      address: user?.address || "",
      user_profile: user?.user_profile || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const validatePassword = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      await updateData(user?.id || "", { password: passwordData.newPassword }, "user");
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("Password changed successfully!");
    } catch (error) {
      console.error("Error changing password:", error);
      setErrors({ submit: "Failed to change password. Please check your current password." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await updateData(user?.id || "", { is_active: false }, "user");
      alert("Account deactivated. You will be logged out.");
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Failed to deactivate account. Please try again.");
    }
    setShowDeleteModal(false);
  };

  return (
    <PageContainer>
      <Container gap="24px" padding="0">
        {/* Header */}
        <Container elevation={2} direction="row" justify="space-between" align="center">
          <Typography.Header>My Profile</Typography.Header>
          {!isEditing ? (
            <Button
              variant="solid"
              colorScheme="primary"
              startDecorator={<Edit size={18} />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <div style={{ display: "flex", gap: "12px" }}>
              <Button
                variant="outlined"
                colorScheme="secondary"
                startDecorator={<X size={18} />}
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="primary"
                startDecorator={<Save size={18} />}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </Container>

        {/* Profile Picture Section */}
        <Container elevation={2}>
          <Typography.CardTitle>Profile Picture</Typography.CardTitle>
          <Divider sx={{ my: 2 }} />
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            <Avatar
              src={formData.user_profile || undefined}
              alt={`${user?.first_name} ${user?.last_name}`}
              sx={{ width: 120, height: 120 }}
            >
              {!formData.user_profile && `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`}
            </Avatar>
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                  id="profile-upload"
                />
                <label htmlFor="profile-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    colorScheme="primary"
                    startDecorator={<Camera size={18} />}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? "Uploading..." : "Change Photo"}
                  </Button>
                </label>
                {errors.user_profile && (
                  <FormHelperText sx={{ color: "danger.500", mt: 1 }}>
                    {errors.user_profile}
                  </FormHelperText>
                )}
              </div>
            )}
          </div>
        </Container>

        {/* Personal Information */}
        <Container elevation={2}>
          <Typography.CardTitle>Personal Information</Typography.CardTitle>
          <Divider sx={{ my: 2 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <FormControl error={!!errors.first_name}>
              <FormLabel>First Name</FormLabel>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                disabled={!isEditing}
                startDecorator={<UserIcon size={18} />}
              />
              {errors.first_name && <FormHelperText>{errors.first_name}</FormHelperText>}
            </FormControl>

            <FormControl>
              <FormLabel>Middle Name</FormLabel>
              <Input
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                disabled={!isEditing}
                startDecorator={<UserIcon size={18} />}
              />
            </FormControl>

            <FormControl error={!!errors.last_name}>
              <FormLabel>Last Name</FormLabel>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                disabled={!isEditing}
                startDecorator={<UserIcon size={18} />}
              />
              {errors.last_name && <FormHelperText>{errors.last_name}</FormHelperText>}
            </FormControl>
          </div>
        </Container>

        {/* Contact Information */}
        <Container elevation={2}>
          <Typography.CardTitle>Contact Information</Typography.CardTitle>
          <Divider sx={{ my: 2 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <FormControl error={!!errors.email}>
              <FormLabel>Email Address</FormLabel>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                startDecorator={<Mail size={18} />}
              />
              {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
            </FormControl>

            <FormControl error={!!errors.phone_number}>
              <FormLabel>Phone Number</FormLabel>
              <Input
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                disabled={!isEditing}
                startDecorator={<Phone size={18} />}
                placeholder="+63 XXX XXX XXXX"
              />
              {errors.phone_number && <FormHelperText>{errors.phone_number}</FormHelperText>}
            </FormControl>
          </div>

          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Address</FormLabel>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              startDecorator={<MapPin size={18} />}
            />
          </FormControl>
        </Container>

        {/* Account Information */}
        <Container elevation={2}>
          <Typography.CardTitle>Account Information</Typography.CardTitle>
          <Divider sx={{ my: 2 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div>
              <Typography.Label>Role</Typography.Label>
              <div style={{ marginTop: "8px" }}>
                <Chip color="primary" size="lg">
                  {user?.role_name || "N/A"}
                </Chip>
              </div>
            </div>

            <div>
              <Typography.Label>Account Status</Typography.Label>
              <div style={{ marginTop: "8px" }}>
                <Chip color={user?.is_active ? "success" : "danger"} size="lg">
                  {user?.is_active ? "Active" : "Inactive"}
                </Chip>
              </div>
            </div>

            <div>
              <Typography.Label>Verification Status</Typography.Label>
              <div style={{ marginTop: "8px" }}>
                <Chip color={user?.is_verified ? "success" : "warning"} size="lg">
                  {user?.is_verified ? "Verified" : "Unverified"}
                </Chip>
              </div>
            </div>
          </div>

          <Divider sx={{ my: 2 }} />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            <div>
              <Typography.Label>Member Since</Typography.Label>
              <Typography.Body sx={{ mt: 1 }}>
                <Calendar size={16} style={{ display: "inline", marginRight: "8px" }} />
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </Typography.Body>
            </div>

            <div>
              <Typography.Label>Last Login</Typography.Label>
              <Typography.Body sx={{ mt: 1 }}>
                <Calendar size={16} style={{ display: "inline", marginRight: "8px" }} />
                {user?.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}
              </Typography.Body>
            </div>
          </div>
        </Container>

        {errors.submit && (
          <Container elevation={2} style={{ backgroundColor: "var(--joy-palette-danger-softBg)" }}>
            <Typography.Body sx={{ color: "danger.500" }}>{errors.submit}</Typography.Body>
          </Container>
        )}

        {/* Account Security Settings */}
        <Container elevation={2}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Lock size={24} />
            <Typography.CardTitle>Change Password</Typography.CardTitle>
          </div>
          <Divider sx={{ my: 2 }} />
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "500px" }}>
            <FormControl error={!!errors.currentPassword}>
              <FormLabel>Current Password</FormLabel>
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                startDecorator={<Key size={18} />}
                endDecorator={
                  <div
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                }
              />
              {errors.currentPassword && <FormHelperText>{errors.currentPassword}</FormHelperText>}
            </FormControl>

            <FormControl error={!!errors.newPassword}>
              <FormLabel>New Password</FormLabel>
              <Input
                type={showNewPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                startDecorator={<Lock size={18} />}
                endDecorator={
                  <div
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                }
              />
              {errors.newPassword && <FormHelperText>{errors.newPassword}</FormHelperText>}
              <FormHelperText>Password must be at least 8 characters long</FormHelperText>
            </FormControl>

            <FormControl error={!!errors.confirmPassword}>
              <FormLabel>Confirm New Password</FormLabel>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                startDecorator={<Lock size={18} />}
                endDecorator={
                  <div
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ cursor: "pointer" }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                }
              />
              {errors.confirmPassword && <FormHelperText>{errors.confirmPassword}</FormHelperText>}
            </FormControl>

            <Button
              variant="solid"
              colorScheme="primary"
              onClick={handleChangePassword}
              disabled={loading}
              style={{ width: "fit-content" }}
            >
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </Container>

        {/* Notification Preferences */}
        <Container elevation={2}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Shield size={24} />
            <Typography.CardTitle>Notification Preferences</Typography.CardTitle>
          </div>
          <Divider sx={{ my: 2 }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Typography.Label>Email Notifications</Typography.Label>
                <Typography.Body sx={{ fontSize: "sm", color: "neutral.500", mt: 0.5 }}>
                  Receive notifications via email
                </Typography.Body>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })
                }
              />
            </div>

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Typography.Label>Push Notifications</Typography.Label>
                <Typography.Body sx={{ fontSize: "sm", color: "neutral.500", mt: 0.5 }}>
                  Receive push notifications in the app
                </Typography.Body>
              </div>
              <Switch
                checked={notificationSettings.pushNotifications}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })
                }
              />
            </div>

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Typography.Label>Weekly Reports</Typography.Label>
                <Typography.Body sx={{ fontSize: "sm", color: "neutral.500", mt: 0.5 }}>
                  Receive weekly activity reports
                </Typography.Body>
              </div>
              <Switch
                checked={notificationSettings.weeklyReport}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })
                }
              />
            </div>

            <Divider />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Typography.Label>Monthly Reports</Typography.Label>
                <Typography.Body sx={{ fontSize: "sm", color: "neutral.500", mt: 0.5 }}>
                  Receive monthly summary reports
                </Typography.Body>
              </div>
              <Switch
                checked={notificationSettings.monthlyReport}
                onChange={(e) =>
                  setNotificationSettings({ ...notificationSettings, monthlyReport: e.target.checked })
                }
              />
            </div>
          </div>
        </Container>

        {/* Danger Zone */}
        <Container elevation={2} style={{ borderColor: "var(--joy-palette-danger-500)", borderWidth: "1px", borderStyle: "solid" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={24} color="var(--joy-palette-danger-500)" />
            <Typography.CardTitle sx={{ color: "danger.500" }}>Danger Zone</Typography.CardTitle>
          </div>
          <Divider sx={{ my: 2 }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <Typography.Label sx={{ color: "danger.500" }}>Deactivate Account</Typography.Label>
              <Typography.Body sx={{ fontSize: "sm", color: "neutral.500", mt: 0.5 }}>
                Once you deactivate your account, you will be logged out and unable to access the system until reactivated by an administrator.
              </Typography.Body>
            </div>
            <Button
              variant="solid"
              colorScheme="error"
              startDecorator={<Trash2 size={18} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Deactivate Account
            </Button>
          </div>
        </Container>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <AlertTriangle size={24} color="var(--joy-palette-danger-500)" />
            Confirm Account Deactivation
          </DialogTitle>
          <Divider />
          <DialogContent>
            <Typography.Body>
              Are you sure you want to deactivate your account? This action will:
            </Typography.Body>
            <ul style={{ marginTop: "12px", paddingLeft: "20px" }}>
              <li>Log you out immediately</li>
              <li>Disable your access to the system</li>
              <li>Require administrator approval to reactivate</li>
            </ul>
            <Typography.Body sx={{ mt: 2, color: "danger.500", fontWeight: "bold" }}>
              This action cannot be undone without administrator intervention.
            </Typography.Body>
          </DialogContent>
          <DialogActions>
            <Button variant="solid" colorScheme="error" onClick={handleDeleteAccount}>
              Yes, Deactivate My Account
            </Button>
            <Button variant="outlined" colorScheme="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </PageContainer>
  );
};

export default TourismProfile;
