import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import Button from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { getReportsByReporter } from '@/services/ReportService';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/color';
import PageContainer from '@/components/PageContainer';
import SearchBar from '@/components/SearchBar';
import Chip from '@/components/Chip';

interface ReportItem {
  id: string;
  title: string;
  status: string;
  target_type: string;
  created_at: string;
  description: string;
}

export default function MyReports() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();
  const [data, setData] = useState<ReportItem[]>([]);
  const [filteredData, setFilteredData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const items = await getReportsByReporter(
        (user.user_id as string) || (user.id as string)
      );
      const mapped = items.map((r: any) => ({
        id: r.id,
        title: r.title || r.report_title || 'Untitled',
        status: r.status || 'submitted',
        target_type: r.target_type || r.targetType || 'unknown',
        created_at: r.created_at || r.createdAt || new Date().toISOString(),
        description: r.description || '',
      }));
      setData(mapped);
      setFilteredData(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.user_id, user?.id]);

  // Filter logic
  useEffect(() => {
    let filtered = [...data];

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.status === filterStatus);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.target_type.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [data, filterStatus, searchQuery]);

  const statusFilters = [
    { id: 'all', label: 'All', count: data.length },
    {
      id: 'submitted',
      label: 'Submitted',
      count: data.filter((r) => r.status === 'submitted').length,
    },
    {
      id: 'in_progress',
      label: 'In Progress',
      count: data.filter((r) => r.status === 'in_progress').length,
    },
    {
      id: 'resolved',
      label: 'Resolved',
      count: data.filter((r) => r.status === 'resolved').length,
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: data.filter((r) => r.status === 'rejected').length,
    },
  ];

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'accommodation':
        return 'bed';
      case 'business':
        return 'store';
      case 'event':
        return 'calendar-star';
      case 'tourist_spot':
        return 'map-marker';
      default:
        return 'flag';
    }
  };

  const getTargetLabel = (type: string) => {
    return type
      .replace('_', ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };
  return (
    <PageContainer>
      {/* Header */}
      <View style={styles.headerSection}>
        <View>
          <ThemedText type="title-medium" weight="bold">
            My Reports
          </ThemedText>
          <ThemedText type="body-small" style={{ marginTop: 4, opacity: 0.7 }}>
            {data.length} {data.length === 1 ? 'report' : 'reports'} total
          </ThemedText>
        </View>
        <Button
          label="New"
          size="small"
          variant="solid"
          color="primary"
          startIcon="plus"
          onPress={() =>
            router.push('/(tabs)/(profile)/(reports)/submit' as any)
          }
        />
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search reports..."
        variant="plain"
        size="md"
        color="neutral"
        shape="rounded"
        showClear={true}
      />

      <View>
        {/* Status Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusFilters.map((item) => {
            const active = filterStatus === item.id;
            return (
              <Chip
                key={item.id}
                label={`${item.label}${
                  item.count > 0 ? ` (${item.count})` : ''
                }`}
                variant={active ? 'solid' : 'outlined'}
                color={active ? 'primary' : 'neutral'}
                size="medium"
                onPress={() => setFilterStatus(item.id)}
                style={{ marginRight: 6 }}
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredData}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} />
        }
        renderItem={({ item }) => {
          const statusColor = getStatusColor(item.status);
          return (
            <Pressable
              onPress={() =>
                router.push(
                  `/(tabs)/(profile)/(reports)/detail/${item.id}` as any
                )
              }
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#161A2E' : '#fff',
                  borderColor: isDark ? '#28304a' : '#E2E8F0',
                },
              ]}
              android_ripple={{ color: 'rgba(59, 130, 246, 0.1)' }}
            >
              {/* Card Header */}
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: statusColor.bg },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={getTargetIcon(item.target_type) as any}
                    size={20}
                    color={statusColor.color}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText
                    type="body-medium"
                    weight="semi-bold"
                    numberOfLines={2}
                  >
                    {item.title}
                  </ThemedText>
                  <View style={styles.metaRow}>
                    <ThemedText type="label-small" style={{ opacity: 0.7 }}>
                      {getTargetLabel(item.target_type)}
                    </ThemedText>
                    <View style={styles.dot} />
                    <ThemedText type="label-small" style={{ opacity: 0.7 }}>
                      {formatDate(item.created_at)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Card Body */}
              {item.description && (
                <ThemedText
                  type="body-small"
                  numberOfLines={2}
                  style={{ marginTop: 12, opacity: 0.8 }}
                >
                  {item.description}
                </ThemedText>
              )}

              {/* Status Badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 12,
                }}
              >
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={statusColor.icon as any}
                    size={14}
                    color="#fff"
                  />
                  <ThemedText
                    type="label-small"
                    style={{ color: '#fff', marginLeft: 4 }}
                  >
                    {item.status.replace('_', ' ')}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="folder-open-outline"
                size={64}
                color={isDark ? '#64748B' : '#CBD5E1'}
              />
              <ThemedText
                type="body-medium"
                weight="semi-bold"
                style={{ marginTop: 16 }}
              >
                {searchQuery || filterStatus !== 'all'
                  ? 'No reports found'
                  : 'No reports yet'}
              </ThemedText>
              <ThemedText
                type="body-small"
                style={{ marginTop: 4, opacity: 0.7, textAlign: 'center' }}
              >
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Submit your first report to get started'}
              </ThemedText>
              {!searchQuery && filterStatus === 'all' && (
                <Button
                  label="Submit Report"
                  variant="outlined"
                  size="medium"
                  startIcon="plus"
                  onPress={() =>
                    router.push('/(tabs)/(profile)/(reports)/submit' as any)
                  }
                  style={{ marginTop: 24 }}
                />
              )}
            </View>
          ) : null
        }
      />
    </PageContainer>
  );
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'resolved':
      return {
        color: Colors.light.success,
        bg: Colors.light.successLight,
        icon: 'check-circle',
      };
    case 'rejected':
      return {
        color: Colors.light.error,
        bg: Colors.light.errorLight,
        icon: 'close-circle',
      };
    case 'in_progress':
      return {
        color: Colors.light.warning,
        bg: Colors.light.warningLight,
        icon: 'clock-outline',
      };
    default:
      return {
        color: Colors.light.info,
        bg: Colors.light.infoLight,
        icon: 'information',
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
});
