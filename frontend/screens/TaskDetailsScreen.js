import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import useTaskStore from '../store/useTaskStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';
import api from '../services/api';

export default function TaskDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;
  
  const tasks = useTaskStore(state => state.tasks);
  const toggleComplete = useTaskStore(state => state.toggleComplete);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const fetchTasks = useTaskStore(state => state.fetchTasks);
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const task = tasks.find(t => t.id === taskId) || null;

  const fetchReminders = useCallback(async () => {
    try {
      // Use the per-task endpoint for efficiency
      const remRes = await api.get(`/tasks/${taskId}/reminders`);
      setReminders(remRes.data || []);
    } catch (error) {
      // Silently ignore — reminders are optional, don't break the screen
      setReminders([]);
    }
  }, [taskId]);

  useEffect(() => {
    const init = async () => {
      if (!task) {
        try { await fetchTasks(); } catch (e) {}
      }
      await fetchReminders();
      setLoading(false);
    };

    const unsubscribe = navigation.addListener('focus', () => {
      fetchReminders();
      try { fetchTasks(); } catch(e) {}
    });

    init();
    return unsubscribe;
  }, [navigation, taskId]);

  const handleDelete = async () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTask(taskId);
            navigation.goBack();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete task');
          }
        }
      }
    ]);
  };

  const handleToggleStatus = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      const isCompleted = task.status === 'Completed';
      await toggleComplete(taskId, !isCompleted);
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteReminder = async (id) => {
    try {
      await api.delete(`/reminders/${id}`);
      fetchReminders();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete reminder');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return theme.terracotta;
      case 'Medium': return theme.primary;
      case 'Low': return theme.sage;
      default: return theme.primary;
    }
  };

  if (loading || !task) return (
    <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loading, { color: theme.textSecondary }]}>Loading task details...</Text>
    </View>
  );

  const isCompleted = task.status === 'Completed';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Details</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]} onPress={() => navigation.navigate('EditTask', { taskId })}>
          <Ionicons name="pencil" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
          <View style={styles.titleRow}>
            <View style={[styles.statusDot, { backgroundColor: isCompleted ? theme.sage : theme.terracotta }]} />
            <Text style={[styles.title, { color: theme.text }, isCompleted && styles.titleCompleted]}>{task.title}</Text>
          </View>
          
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
               <View style={[styles.badgeDot, { backgroundColor: getPriorityColor(task.priority) }]} />
               <Text style={[styles.badgeText, { color: theme.text }]}>{task.priority} Priority</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
               <Text style={[styles.badgeText, { color: theme.text }]}>{task.category}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }, isCompleted && { backgroundColor: isDarkMode ? 'rgba(143,168,155,0.15)' : 'rgba(143,168,155,0.1)' }]}>
               <Text style={[styles.badgeText, { color: theme.text }, isCompleted && { color: theme.sage }]}>
                 {isCompleted ? '✅ Completed' : '⏳ Pending'}
               </Text>
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Description</Text>
          <Text style={[styles.description, { color: theme.text }]}>{task.description || 'No description provided.'}</Text>

          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Due Date & Time</Text>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
            <Text style={[styles.date, { color: theme.text }]}>
              {task.due_date 
                ? `${task.due_date} at ${task.due_time || 'No time set'}` 
                : 'Not set'}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <CustomButton 
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'} 
            type={isCompleted ? 'secondary' : 'success'}
            onPress={handleToggleStatus}
            loading={toggling}
            icon={isCompleted ? '⏳' : '✅'}
          />
          <CustomButton 
            title="Delete Task" 
            type="danger" 
            onPress={handleDelete} 
            icon="🗑️"
          />
        </View>

        <View style={[styles.remindersSection, { borderTopColor: theme.border }]}>
          <View style={styles.remindersHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Reminders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddReminder', { taskId })} style={[styles.addBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={[styles.addBtnText, { color: theme.primary }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {reminders.length === 0 && (
            <View style={styles.emptyReminders}>
              <Ionicons name="notifications-off-outline" size={32} color={theme.textSecondary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No reminders set.</Text>
            </View>
          )}

          {reminders.map(rem => (
            <View key={rem.id} style={[styles.reminderItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reminderTime, { color: theme.text }]}>
                  {new Date(rem.reminder_time).toLocaleString()}
                </Text>
                <View style={styles.reminderStatusRow}>
                  <View style={[
                    styles.reminderStatusDot, 
                    { backgroundColor: rem.status === 'Pending' ? theme.terracotta : theme.sage }
                  ]} />
                  <Text style={[styles.reminderStatus, { color: theme.textSecondary }]}>{rem.status}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => handleDeleteReminder(rem.id)} style={[styles.delBtn, { backgroundColor: isDarkMode ? 'rgba(194,140,138,0.15)' : 'rgba(194,140,138,0.1)' }]}>
                <Ionicons name="trash" size={20} color={theme.terracotta} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderBottomWidth: 1, 
  },
  iconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  card: { 
    padding: 24, 
    borderRadius: 24, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 3, 
    marginBottom: 24, 
    borderWidth: 1, 
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  title: { fontSize: 24, fontWeight: '800', flex: 1 },
  titleCompleted: { textDecorationLine: 'line-through' },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  badge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    marginRight: 10, 
    marginBottom: 10,
    borderWidth: 1,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  badgeText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  description: { fontSize: 16, lineHeight: 24, marginBottom: 24 },
  dateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 16, fontWeight: '500' },
  loading: { textAlign: 'center', marginTop: 16, fontSize: 16 },
  actions: { gap: 12, marginBottom: 32 },
  remindersSection: { borderTopWidth: 1, paddingTop: 24 },
  remindersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  addBtnText: { fontWeight: '600', marginLeft: 6 },
  emptyReminders: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontStyle: 'italic', paddingVertical: 8, fontSize: 14 },
  reminderItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 10, 
    borderWidth: 1, 
  },
  reminderTime: { fontSize: 15, fontWeight: '600' },
  reminderStatusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  reminderStatusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  reminderStatus: { fontSize: 13 },
  delBtn: { padding: 8, borderRadius: 12 }
});
