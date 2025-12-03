import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Button from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { router } from 'expo-router';
import { Routes } from '@/routes/mainRoutes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';

export default function ReportsHome() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const bg = isDark ? '#0F1222' : '#F5F7FB';

  return (
    <PageContainer padding={0} style={{ paddingBottom: 100 }}>
      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: Colors.light.primary + '15' },
            ]}
          >
            <MaterialCommunityIcons
              name="flag-variant"
              size={40}
              color={Colors.light.primary}
            />
          </View>
          <ThemedText
            type="title-large"
            weight="bold"
            style={{ marginTop: 20, textAlign: 'center' }}
          >
            Report Center
          </ThemedText>
          <ThemedText
            type="body-medium"
            style={{
              marginTop: 12,
              textAlign: 'center',
              opacity: 0.8,
              paddingHorizontal: 32,
            }}
          >
            Help us maintain quality standards by reporting issues with
            accommodations, shops, events, or tourist spots
          </ThemedText>
        </View>

        {/* Action Cards */}
        <View style={styles.actionsContainer}>
          {/* Submit Report Card */}
          <View
            style={[
              styles.actionCard,
              styles.primaryCard,
              { backgroundColor: Colors.light.primary },
            ]}
          >
            <MaterialCommunityIcons
              name="file-document-edit"
              size={32}
              color="#fff"
            />
            <ThemedText
              type="body-large"
              weight="bold"
              style={{ color: '#fff', marginTop: 12 }}
            >
              Submit a Report
            </ThemedText>
            <ThemedText
              type="body-small"
              style={{
                color: '#fff',
                opacity: 0.9,
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              Found an issue? Let us know so we can investigate and take action
            </ThemedText>
            <Button
              label="Create Report"
              size="medium"
              variant="solid"
              style={{ marginTop: 20, backgroundColor: '#fff' }}
              textStyle={{ color: Colors.light.primary }}
              startIcon="plus"
              onPress={() =>
                router.push(Routes.profile.reports.submit)
              }
            />
          </View>

          {/* View Reports Card */}
          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? '#161A2E' : '#fff',
                borderColor: isDark ? '#28304a' : '#E2E8F0',
                borderWidth: 1,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="clipboard-text"
              size={32}
              color={Colors.light.info}
            />
            <ThemedText
              type="body-large"
              weight="bold"
              style={{ marginTop: 12 }}
            >
              My Reports
            </ThemedText>
            <ThemedText
              type="body-small"
              style={{ opacity: 0.8, marginTop: 8, lineHeight: 20 }}
            >
              Track the status of your submitted reports and view responses
            </ThemedText>
            <Button
              label="View Reports"
              size="medium"
              variant="outlined"
              color="info"
              style={{ marginTop: 20 }}
              startIcon="eye"
              onPress={() =>
                router.push(Routes.profile.reports.myReports)
              }
            />
          </View>
        </View>

        {/* Info Section */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: isDark ? '#161A2E' : Colors.light.infoLight,
              borderColor: isDark ? '#28304a' : Colors.light.info,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={Colors.light.info}
          />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText
              type="body-small"
              weight="semi-bold"
              style={{ marginBottom: 4 }}
            >
              What can you report?
            </ThemedText>
            <ThemedText
              type="label-small"
              style={{ opacity: 0.8, lineHeight: 18 }}
            >
              • Inaccurate information{'\n'}• Safety concerns{'\n'}•
              Inappropriate content{'\n'}• Service quality issues{' \n'}• Scams
              or fraud
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  hero: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    gap: 16,
    marginTop: 8,
  },
  actionCard: {
    padding: 24,
    borderRadius: 20,
  },
  primaryCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginTop: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
});
