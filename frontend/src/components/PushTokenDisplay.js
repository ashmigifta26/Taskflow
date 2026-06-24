import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { useStore } from '../store/useStore';
import { Ionicons } from '@expo/vector-icons';

export default function PushTokenDisplay() {
  const { expoPushToken, sendTestNotification } = useStore();

  const copyToClipboard = () => {
    if (expoPushToken) {
      Clipboard.setString(expoPushToken);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo Push Token</Text>
      <Text style={styles.token}>{expoPushToken || 'Not registered'}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={sendTestNotification}>
          <Ionicons name="send" size={20} color="#fff" />
          <Text style={styles.buttonText}>Send Test Notification</Text>
        </TouchableOpacity>
        {expoPushToken && (
          <TouchableOpacity style={styles.button} onPress={copyToClipboard}>
            <Ionicons name="copy" size={20} color="#fff" />
            <Text style={styles.buttonText}>Copy Token</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  token: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
});
