'use strict';

/**
 * App Legal Policies Seeder
 *
 * Seeds initial Privacy Policy and Terms and Conditions content matching old backend.
 */
module.exports = {
  async up(queryInterface) {
    // Delete existing records to start fresh
    await queryInterface.bulkDelete('app_legal_policies', null, {});

    const privacyPolicy = `# Privacy Policy

**Last Updated: December 27, 2025**

City Venture ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.

## 1. Information We Collect

### Personal Information
We collect information that you provide directly to us when you:
- Create an account (name, email, phone number)
- Make a booking or purchase
- Complete your profile information
- Contact our support team
- Submit reviews or ratings

### Automatically Collected Information
- Device information (model, operating system, unique identifiers)
- Usage data (pages viewed, features used, time spent)
- Location data (with your permission)
- App performance and crash data

## 2. How We Use Your Information

We use the information we collect to:
- Provide, maintain, and improve our services
- Process your bookings and payments
- Send you confirmations, updates, and notifications
- Respond to your comments and questions
- Personalize your experience
- Prevent fraud and enhance security
- Analyze usage and improve app performance

## 3. Information Sharing and Disclosure

We may share your information with:
- Service providers who assist in operating our app
- Business partners for bookings you make
- Law enforcement when required by law

We do not sell your personal information to third parties.

## 4. Data Security

We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.

## 5. Your Rights and Choices

You have the right to:
- Access and update your personal information
- Delete your account and associated data
- Opt-out of marketing communications
- Disable location services
- Request a copy of your data

## 6. Data Retention

We retain your information for as long as necessary to provide our services and comply with legal obligations. You may request deletion of your account at any time.

## 7. Children's Privacy

Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

## 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy in the app and updating the "Last updated" date.

## 9. Contact Us

If you have any questions about this Privacy Policy, please contact us through the app's support section.

---

*Your privacy is important to us. We are committed to protecting your personal information and being transparent about our data practices.*`;

    const termsAndConditions = `# Terms and Conditions

**Last Updated: December 27, 2025**

Welcome to City Venture! These Terms and Conditions govern your use of our mobile application and services.

## 1. Acceptance of Terms

By accessing and using City Venture mobile application, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms and Conditions, please do not use this application.

## 2. User Accounts

When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.

You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.

## 3. Use of Service

City Venture provides a platform for discovering and booking tourism-related services. You agree to use the service only for lawful purposes and in accordance with these Terms.

### You agree not to:
- Use the service for any illegal or unauthorized purpose
- Violate any laws in your jurisdiction
- Infringe upon or violate intellectual property rights
- Submit false or misleading information
- Interfere with or disrupt the service or servers

## 4. Bookings and Payments

All bookings made through City Venture are subject to availability and confirmation. Payment must be made through the approved payment methods within the application.

Prices are subject to change without notice. We reserve the right to refuse or cancel any booking at any time for any reason.

## 5. Cancellation and Refund Policy

Cancellation and refund policies vary by service provider. Please review the specific cancellation policy for each booking before confirming your reservation.

Refunds, if applicable, will be processed within 7-14 business days to the original payment method.

## 6. Intellectual Property

The service and its original content, features, and functionality are owned by City Venture and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

## 7. Limitation of Liability

City Venture shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.

## 8. Indemnification

You agree to indemnify and hold harmless City Venture and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of the service or violation of these Terms.

## 9. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to its conflict of law provisions.

## 10. Changes to Terms

We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.

## 11. Contact Information

If you have any questions about these Terms and Conditions, please contact us through the app's support section.

---

*By using City Venture, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.*`;

    // Insert the legal policies using the new backend schema (separate rows per policy type)
    const { v4: uuidv4 } = require('uuid');

    const policies = [
      {
        id: uuidv4(),
        policy_type: 'terms_of_service',
        title: 'Terms and Conditions',
        content: termsAndConditions,
        version: '1.0',
        effective_date: new Date(),
        is_active: true
      },
      {
        id: uuidv4(),
        policy_type: 'privacy_policy',
        title: 'Privacy Policy',
        content: privacyPolicy,
        version: '1.0',
        effective_date: new Date(),
        is_active: true
      }
    ];

    await queryInterface.bulkInsert('app_legal_policies', policies);

    console.log('[Seed] App legal policies seeded.');
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('app_legal_policies', null, {});
  }
};
