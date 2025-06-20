import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

type headerProps = {
  headerTitle: string;
  headerUserName: string;
  headerUserEmail: string;
};

const AdminHeader: React.FC<headerProps> = ({
  headerTitle,
  headerUserName,
  headerUserEmail,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerLeft}>
        <ThemedText type="headerTitle" darkColor="#000">
          {headerTitle}
        </ThemedText>
      </View>
      <View style={styles.headerMiddle}></View>
      <View style={styles.headerRight}>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <Pressable
            style={styles.notificationContainer}
            onPress={() => console.log('Notification pressed')}
          >
            <FontAwesome name="bell" size={20} color="#000" />
          </Pressable>
          <View style={styles.userDetails}>
            <ThemedText
              type="default2"
              style={{ textAlign: 'right' }}
              darkColor="#000"
            >
              {headerUserName}
            </ThemedText>
            <ThemedText
              type="default2"
              style={{ textAlign: 'right' }}
              darkColor="#000"
            >
              {headerUserEmail}
            </ThemedText>
          </View>
          <View style={styles.userIcon}>
            {/* Replace with actual Image if available */}
            <FontAwesome name="user" size={20} color="#fff" />
          </View>
        </View>
      </View>
    </View>
  );
};

export default AdminHeader;

const styles = StyleSheet.create({
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 70,
    padding: 16,
  },
  userDetails: {},
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  notificationContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  headerLeft: {},
  headerMiddle: {},
  headerRight: {},
});
