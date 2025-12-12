import { StyleSheet, View, ScrollView } from 'react-native';
import React from 'react';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';

const PrivacyPolicy = () => {
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
              name="lock-closed"
              size={32}
              color={Colors.light.primary}
            />
          </View>
          <ThemedText
            type="card-title-medium"
            weight="semi-bold"
            style={{ color: textColor, marginTop: 12 }}
          >
            Privacy Policy
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
          {/* Introduction */}
          <View style={styles.section}>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              City Venture ("we", "our", or "us") is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our mobile
              application.
            </ThemedText>
          </View>

          {/* Section 1 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              1. Information We Collect
            </ThemedText>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor, marginTop: 12, marginBottom: 8 }}
            >
              Personal Information
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We collect information that you provide directly to us when you:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Create an account (name, email, phone number)
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Make a booking or purchase
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Complete your profile information
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Contact our support team
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Submit reviews or ratings
              </ThemedText>
            </View>

            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor, marginTop: 16, marginBottom: 8 }}
            >
              Automatically Collected Information
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Device information (model, operating system, unique
                identifiers)
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Usage data (pages viewed, features used, time spent)
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Location data (with your permission)
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • App performance and crash data
              </ThemedText>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              2. How We Use Your Information
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We use the information we collect to:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Provide, maintain, and improve our services
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Process your bookings and payments
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Send you confirmations, updates, and notifications
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Respond to your comments and questions
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Personalize your experience
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Prevent fraud and enhance security
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Analyze usage and improve app performance
              </ThemedText>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              3. Information Sharing and Disclosure
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We may share your information with:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Service providers who assist in operating our app
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Business partners for bookings you make
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Law enforcement when required by law
              </ThemedText>
            </View>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We do not sell your personal information to third parties.
            </ThemedText>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              4. Data Security
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We implement appropriate technical and organizational measures to
              protect your personal information. However, no method of
              transmission over the internet is 100% secure, and we cannot
              guarantee absolute security.
            </ThemedText>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              5. Your Rights and Choices
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              You have the right to:
            </ThemedText>
            <View style={styles.bulletList}>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Access and update your personal information
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Delete your account and associated data
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Opt-out of marketing communications
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Disable location services
              </ThemedText>
              <ThemedText
                type="body-medium"
                style={[styles.bulletItem, { color: subTextColor }]}
              >
                • Request a copy of your data
              </ThemedText>
            </View>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              6. Data Retention
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We retain your information for as long as necessary to provide our
              services and comply with legal obligations. You may request
              deletion of your account at any time.
            </ThemedText>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              7. Children's Privacy
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13.
            </ThemedText>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              8. Changes to This Privacy Policy
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              We may update this Privacy Policy from time to time. We will
              notify you of any changes by posting the new Privacy Policy in the
              app and updating the "Last updated" date.
            </ThemedText>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <ThemedText
              type="body-large"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 8 }}
            >
              9. Contact Us
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={[styles.paragraph, { color: subTextColor }]}
            >
              If you have any questions about this Privacy Policy, please
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
              Your privacy is important to us. We are committed to protecting
              your personal information and being transparent about our data
              practices.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
};

export default PrivacyPolicy;

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
