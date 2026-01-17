import Button from "@/components/Button";
import Container from "@/components/Container";
import FormLogo from "@/components/FormLogo";
import PageContainer from "@/components/PageContainer";
import FormTextInput from "@/components/TextInput";
import { ThemedText } from "@/components/themed-text";
import { colors } from "@/constants/color";
import { validateEmail } from "@/utils/validation";
import { formatErrorMessage } from "@/utils/networkHandler";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import axios from "axios";
import api from "@/services/api/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleResetPassword = async () => {
    if (isLoading) return;

    // Clear previous errors
    setError("");
    setEmailError("");
    setSuccess(false);

    // Validate email
    const validation = validateEmail(email.trim());
    if (!validation.isValid) {
      setEmailError(validation.error || "Invalid email");
      return;
    }

    setIsLoading(true);

    try {
      // Call backend password reset endpoint
      await axios.post(`${api}/users/forgot-password`, {
        email: email.trim(),
      });

      setSuccess(true);

      // Optionally navigate back after a delay
      setTimeout(() => {
        router.back();
      }, 3000);
    } catch (err: any) {
      const errorMessage = formatErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <PageContainer padding={0}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* Logo */}
            <FormLogo />

            {/* Headline */}
            <View>
              <ThemedText type="title-medium" weight="bold">
                Forgot Password
              </ThemedText>
              <ThemedText type="sub-title-small" weight="medium">
                Enter your email to receive password reset instructions
              </ThemedText>
            </View>

            {/* Success Message */}
            {success ? (
              <Container
                padding={16}
                variant="soft"
                backgroundColor={colors.success || colors.primary}
              >
                <ThemedText
                  startIcon={
                    <FontAwesome name="check-circle" size={18} color="#fff" />
                  }
                  lightColor="#fff"
                  type="body-medium"
                >
                  Password reset email sent! Check your inbox.
                </ThemedText>
              </Container>
            ) : null}

            {/* Error Message */}
            {error ? (
              <Container
                padding={16}
                variant="soft"
                backgroundColor={colors.error}
              >
                <ThemedText
                  startIcon={<Entypo name="warning" size={18} color="#fff" />}
                  lightColor="#fff"
                  type="body-medium"
                >
                  {error}
                </ThemedText>
              </Container>
            ) : null}

            {/* Email Input */}
            <View style={styles.fieldGroup}>
              <FormTextInput
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError("");
                }}
                variant="outlined"
                required
                errorText={emailError}
              />
            </View>

            {/* Submit Button */}
            <Button
              fullWidth
              size="large"
              label={isLoading ? "Sending..." : "Send Reset Link"}
              color="primary"
              variant="solid"
              onPress={handleResetPassword}
              disabled={isLoading || success}
            />

            {/* Back to Login */}
            <View style={styles.footer}>
              <ThemedText type="body-medium">
                Remember your password?
              </ThemedText>
              <ThemedText type="link-medium" onPress={() => router.back()}>
                Sign In
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Loading Modal */}
        <Modal visible={isLoading} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <ThemedText type="body-medium" style={styles.loadingText}>
                Sending reset email...
              </ThemedText>
            </View>
          </View>
        </Modal>
      </PageContainer>
    </SafeAreaProvider>
  );
};

export default ForgotPassword;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 20,
    flexGrow: 1,
    justifyContent: "flex-start",
  },
  fieldGroup: {
    flexDirection: "column",
    gap: 16,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    gap: 15,
    minWidth: 150,
  },
  loadingText: {
    marginTop: 8,
    textAlign: "center",
  },
});
