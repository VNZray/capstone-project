import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/AuthContext';
import TransactionCard from './components/TransactionCard';
import TransactionService, {
  type Transaction,
} from '@/services/TransactionService';
import { Ionicons } from '@expo/vector-icons';

const Transactions = () => {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = isDark ? '#ECEDEE' : '#0D1B2A';
  const subTextColor = isDark ? '#9BA1A6' : '#6B7280';

  const fetchTransactions = useCallback(async () => {
    // Use user_id (User table ID) instead of id (Tourist/Owner table ID)
    const userId = user?.user_id || user?.id;

    if (!userId) {
      console.log('[Transactions] No user ID available');
      setLoading(false);
      return;
    }

    console.log('[Transactions] Fetching transactions for user ID:', userId);
    console.log('[Transactions] User object:', {
      id: user.id,
      user_id: user.user_id,
    });

    try {
      setError(null);
      const transactions = await TransactionService.getTransactionsByPayerId(
        userId
      );
      console.log(
        '[Transactions] Successfully fetched transactions:',
        transactions.length
      );
      setTransactions(transactions);
    } catch (err: any) {
      console.error('[Transactions] Failed to fetch transactions:', err);
      console.error('[Transactions] Error response:', err.response?.data);
      console.error('[Transactions] Error status:', err.response?.status);

      // Provide more specific error messages
      if (err.response?.status === 403) {
        setError('You do not have permission to view these transactions.');
      } else if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError('Failed to load transactions. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, user?.user_id]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionPress = (transaction: Transaction) => {
    console.log('Transaction pressed:', transaction.id);
  };

  if (loading) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText
            type="body-medium"
            style={{ color: subTextColor, marginTop: 12 }}
          >
            Loading transactions...
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color={Colors.light.error} />
          <ThemedText
            type="body-medium"
            style={{ color: subTextColor, marginTop: 12, textAlign: 'center' }}
          >
            {error}
          </ThemedText>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer padding={0} gap={0}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          transactions.length === 0 && styles.emptyScrollContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.light.primary}
          />
        }
      >
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrapper,
                {
                  backgroundColor: isDark
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'rgba(99, 102, 241, 0.05)',
                },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={48}
                color={Colors.light.primary}
              />
            </View>
            <ThemedText
              type="card-title-medium"
              weight="semi-bold"
              style={{ color: textColor, marginTop: 16, marginBottom: 8 }}
            >
              No Transactions Yet
            </ThemedText>
            <ThemedText
              type="body-medium"
              style={{
                color: subTextColor,
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              Your transaction history will appear here once you make a booking
              or purchase.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            <ThemedText
              type="body-medium"
              weight="semi-bold"
              style={{ color: textColor, marginBottom: 16 }}
            >
              {transactions.length} Transaction
              {transactions.length !== 1 ? 's' : ''}
            </ThemedText>
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onPress={() => handleTransactionPress(transaction)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
};

export default Transactions;

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 240,
  },
  emptyScrollContent: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionsList: {
    paddingHorizontal: 16,
  },
});
