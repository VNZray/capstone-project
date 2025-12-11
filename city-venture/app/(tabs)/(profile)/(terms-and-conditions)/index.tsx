import { StyleSheet, View, ScrollView } from 'react-native';
import React from 'react';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';

const TermsAndConditions = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const sectionBg = isDark ? '#1F2937' : '#F9FAFB';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  return (
    <PageContainer padding={0} gap={0}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: sectionBg }]}>
          <View style={styles.iconWrapper}>
            <Ionicons
              name="document-text"
              size={32}
              color={Colors.light.primary}
            />
          </View>
          <ThemedText
            type="card-title-medium"
            weight="semi-bold"
            style={{ color: textColor, marginTop: 12 }}
          >
            Terms and Conditions
          </ThemedText>
          <ThemedText
            type="body-small"
            style={{ color: subTextColor, marginTop: 4 }}
          >
            Last updated: December 11, 2025
          </ThemedText>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Section 1 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              1. Acceptance of Terms
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              By accessing and using City Venture mobile application, you accept
              and agree to be bound by the terms and provisions of this
              agreement. If you do not agree to these Terms and Conditions,
              please do not use this application.
            </ThemedText>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              2. User Accounts
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              When you create an account with us, you must provide accurate,
              complete, and current information. Failure to do so constitutes a
              breach of the Terms, which may result in immediate termination of
              your account.
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              You are responsible for safeguarding the password and for all
              activities that occur under your account. You must notify us
              immediately upon becoming aware of any breach of security or
              unauthorized use of your account.
            </ThemedText>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              3. Use of Service
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              City Venture provides a platform for discovering and booking
              tourism-related services. You agree to use the service only for
              lawful purposes and in accordance with these Terms.
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor, marginTop: 12, marginBottom: 8 }}
            >
              You agree not to:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Use the service for any illegal or unauthorized purpose
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Violate any laws in your jurisdiction
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Infringe upon or violate intellectual property rights
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Submit false or misleading information
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Interfere with or disrupt the service or servers
              </ThemedText>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              4. Bookings and Payments
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              All bookings made through City Venture are subject to availability
              and confirmation. Payment must be made through the approved
              payment methods within the application.
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              Prices are subject to change without notice. We reserve the right
              to refuse or cancel any booking at any time for any reason.
            </ThemedText>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              5. Cancellation and Refund Policy
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              Cancellation and refund policies vary by service provider. Please
              review the specific cancellation policy for each booking before
              confirming your reservation.
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              Refunds, if applicable, will be processed within 7-14 business
              days to the original payment method.
            </ThemedText>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              6. Intellectual Property
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              The service and its original content, features, and functionality
              are owned by City Venture and are protected by international
              copyright, trademark, patent, trade secret, and other intellectual
              property laws.
            </ThemedText>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              7. Limitation of Liability
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              City Venture shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your
              use of or inability to use the service.
            </ThemedText>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              8. Changes to Terms
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We reserve the right to modify or replace these Terms at any time.
              If a revision is material, we will provide at least 30 days'
              notice prior to any new terms taking effect.
            </ThemedText>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              9. Contact Information
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              If you have any questions about these Terms and Conditions, please
              contact us through the app's support section.
            </ThemedText>
          </View>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              {
                backgroundColor: sectionBg,
                borderColor: borderColor,
              },
            ]}
          >
            <Ionicons
              name="shield-checkmark"
              size={20}
              color={Colors.light.success}
              style={{ marginRight: 8 }}
            />
            <ThemedText
              type="body-small"
              style={{ color: subTextColor, flex: 1, lineHeight: 20 }}
            >
              By using City Venture, you acknowledge that you have read,
              understood, and agree to be bound by these Terms and Conditions.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

export default TermsAndConditions;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    lineHeight: 24,
    marginBottom: 4,
  },
  footer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});
