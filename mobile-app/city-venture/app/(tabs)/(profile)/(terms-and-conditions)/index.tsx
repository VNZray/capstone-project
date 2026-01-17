import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import {
  fetchAppLegalPolicies,
  type AppLegalPolicies,
} from '@/services/AppLegalPoliciesService';

/**
 * Simple markdown parser that converts markdown to styled sections
 */
const parseMarkdown = (markdown: string) => {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const sections: Array<{
    type:
      | 'h1'
      | 'h2'
      | 'h3'
      | 'paragraph'
      | 'bullet'
      | 'divider'
      | 'bold'
      | 'empty';
    content: string;
  }> = [];

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      sections.push({ type: 'empty', content: '' });
    } else if (trimmed.startsWith('# ')) {
      sections.push({ type: 'h1', content: trimmed.substring(2) });
    } else if (trimmed.startsWith('## ')) {
      sections.push({ type: 'h2', content: trimmed.substring(3) });
    } else if (trimmed.startsWith('### ')) {
      sections.push({ type: 'h3', content: trimmed.substring(4) });
    } else if (trimmed.startsWith('- ')) {
      sections.push({ type: 'bullet', content: trimmed.substring(2) });
    } else if (trimmed.startsWith('---')) {
      sections.push({ type: 'divider', content: '' });
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      sections.push({ type: 'bold', content: trimmed.slice(2, -2) });
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*')) {
      sections.push({ type: 'paragraph', content: trimmed.slice(1, -1) });
    } else {
      sections.push({ type: 'paragraph', content: trimmed });
    }
  });

  return sections;
};

const TermsAndConditions = () => {
  const scheme = useColorScheme();
  const [policies, setPolicies] = useState<AppLegalPolicies | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDark = scheme === 'dark';

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';
  const sectionBg = isDark ? '#1F2937' : '#F9FAFB';
  const borderColor = isDark ? '#374151' : '#E5E7EB';

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchAppLegalPolicies();
        setPolicies(data);
      } catch (err) {
        console.error('[TermsAndConditions] Failed to fetch policies:', err);
        setError(
          'Failed to load terms and conditions. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, []);

  const parsedContent = policies?.terms_and_conditions
    ? parseMarkdown(policies.terms_and_conditions)
    : [];

  const lastUpdated = policies?.updated_at
    ? new Date(policies.updated_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'December 27, 2025';

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText
            type="body-medium"
            style={{ color: subTextColor, marginTop: 16 }}
          >
            Loading terms and conditions...
          </ThemedText>
        </View>
      );
    }

    if (error || !policies?.terms_and_conditions) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={subTextColor}
          />
          <ThemedText
            type="body-medium"
            style={{ color: subTextColor, marginTop: 16, textAlign: 'center' }}
          >
            {error ||
              'Terms and conditions not available. Please check back later.'}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.content}>
        {parsedContent.map((section, index) => {
          switch (section.type) {
            case 'h1':
              return null; // Skip h1 as we have a header
            case 'h2':
              return (
                <View key={index} style={styles.section}>
                  <ThemedText
                    type="body-large"
                    weight="semi-bold"
                    style={{ color: textColor, marginBottom: 8, marginTop: 16 }}
                  >
                    {section.content}
                  </ThemedText>
                </View>
              );
            case 'h3':
              return (
                <ThemedText
                  key={index}
                  type="body-medium"
                  weight="semi-bold"
                  style={{ color: textColor, marginTop: 12, marginBottom: 8 }}
                >
                  {section.content}
                </ThemedText>
              );
            case 'bullet':
              return (
                <ThemedText
                  key={index}
                  type="body-medium"
                  style={[styles.bulletItem, { color: subTextColor }]}
                >
                  • {section.content}
                </ThemedText>
              );
            case 'bold':
              return (
                <ThemedText
                  key={index}
                  type="body-medium"
                  weight="semi-bold"
                  style={{ color: textColor, marginTop: 8, marginBottom: 4 }}
                >
                  {section.content}
                </ThemedText>
              );
            case 'paragraph':
              return (
                <ThemedText
                  key={index}
                  type="body-medium"
                  style={[styles.paragraph, { color: subTextColor }]}
                >
                  {section.content}
                </ThemedText>
              );
            case 'divider':
              return (
                <View
                  key={index}
                  style={[styles.divider, { backgroundColor: borderColor }]}
                />
              );
            case 'empty':
              return <View key={index} style={{ height: 8 }} />;
            default:
              return null;
          }
        })}

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
    );
  };

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
            Last updated: {lastUpdated}
          </ThemedText>
        </View>

        {renderContent()}
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
    marginBottom: 8,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletItem: {
    lineHeight: 24,
    marginBottom: 4,
    marginLeft: 8,
  },
  footer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
});
