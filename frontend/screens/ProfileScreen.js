import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';
import useAuthStore from '../store/useAuthStore';
import useTaskStore from '../store/useTaskStore';
import CustomButton from '../components/CustomButton';

export default function ProfileScreen() {
  const { user, updateUser } = useAuthStore();
  const { tasks } = useTaskStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status !== 'Completed').length;

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const notifPref = await AsyncStorage.getItem('@pref_notif');
        if (notifPref !== null) setNotificationsEnabled(notifPref === 'true');
      } catch (e) {
        console.warn('Failed to load preferences');
      }
    };
    loadPreferences();
  }, []);

  const handleToggleNotifications = async (value) => {
    setNotificationsEnabled(value);
    try {
      await AsyncStorage.setItem('@pref_notif', value.toString());
    } catch (e) {
      console.warn('Failed to save notification preference');
    }
  };

  const showAboutAlert = () => {
    Alert.alert(
      'About TaskFlow',
      'TaskFlow is a premium task & reminder management app upgraded with a powerful calendar scheduler. Version 2.0.0.',
      [{ text: 'OK' }]
    );
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser({ name: editName, email: editEmail });
      setIsEditing(false);
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'User'}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{user?.email || 'No email'}</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]} onPress={() => {
            setEditName(user?.name || '');
            setEditEmail(user?.email || '');
            setIsEditing(true);
          }}>
            <Ionicons name="pencil" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Statistics section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Task Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
              <Text style={[styles.statNumber, { color: theme.sage }]}>{completed}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed Tasks</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
              <Text style={[styles.statNumber, { color: theme.terracotta }]}>{pending}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending Tasks</Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
            <View style={styles.settingItem}>
              <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? 'rgba(194, 140, 138, 0.15)' : 'rgba(194, 140, 138, 0.12)' }]}>
                <Ionicons name="notifications" size={20} color={theme.accent} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor={notificationsEnabled ? '#FFFFFF' : '#94A3B8'}
              />
            </View>
            <View style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? 'rgba(143, 168, 155, 0.15)' : 'rgba(143, 168, 155, 0.12)' }]}>
                <Ionicons name="moon" size={20} color={theme.sage} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.sage }}
                thumbColor={'#FFFFFF'}
              />
            </View>
          </View>
        </View>

        {/* About App Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
            <TouchableOpacity style={styles.settingItem} onPress={showAboutAlert}>
              <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? 'rgba(194, 140, 138, 0.15)' : 'rgba(194, 140, 138, 0.12)' }]}>
                <Ionicons name="information-circle" size={20} color={theme.accent} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>About App</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            <View style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={[styles.settingIconContainer, { backgroundColor: isDarkMode ? 'rgba(95, 121, 149, 0.15)' : 'rgba(95, 121, 149, 0.12)' }]}>
                <Ionicons name="git-branch" size={20} color={theme.primary} />
              </View>
              <Text style={[styles.settingText, { color: theme.text }]}>App Version</Text>
              <Text style={[styles.versionText, { color: theme.textSecondary }]}>2.0.0 (Premium)</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <CustomButton 
            title="Log Out" 
            type="outline" 
            onPress={() => {
              Alert.alert('Log Out', 'Are you sure you want to log out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: async () => {
                  const { logout } = useAuthStore.getState();
                  await logout();
                }}
              ]);
            }} 
            style={{ borderColor: theme.terracotta }} 
            textStyle={{ color: theme.terracotta }}
            icon="log-out-outline"
          />
        </View>
      </ScrollView>

      <Modal visible={isEditing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Profile</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.surfaceAlt, color: theme.text, borderColor: theme.border }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActions}>
              <CustomButton 
                title="Cancel" 
                type="outline" 
                onPress={() => setIsEditing(false)} 
                style={{ flex: 1, marginRight: 8 }} 
              />
              <CustomButton 
                title="Save" 
                type="primary" 
                onPress={handleSaveProfile} 
                style={{ flex: 1, marginLeft: 8 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 16, 
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
    borderWidth: 1,
  },
  avatar: { 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 16 
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  profileInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  email: { fontSize: 14, fontWeight: '500' },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.5, paddingLeft: 8 },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  statNumber: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  card: { 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 3,
    borderWidth: 1,
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 16 
  },
  settingIconContainer: {
    width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  settingText: { flex: 1, fontSize: 16, fontWeight: '600' },
  versionText: { fontSize: 14, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600'
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  }
});
