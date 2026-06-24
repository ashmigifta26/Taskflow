import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import useTaskStore from '../store/useTaskStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

export default function TaskCard({ task, onPress, compact = false }) {
  const [loading, setLoading] = useState(false);
  const toggleComplete = useTaskStore(state => state.toggleComplete);
  const deleteTask = useTaskStore(state => state.deleteTask);
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#EF4444'; 
      case 'Medium': return '#38BDF8'; 
      case 'Low': return '#10B981'; 
      default: return '#64748B'; 
    }
  };

  const handleToggleComplete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const isCompleted = task.status === 'Completed';
      await toggleComplete(task.id, !isCompleted);
    } catch (error) {
      console.error('Failed to toggle task completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const isCompleted = task.status === 'Completed';

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity style={styles.deleteAction} onPress={handleDelete}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash" size={24} color="#FFF" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false}>
      <TouchableOpacity 
        style={[styles.cardContainer, compact && styles.compactContainer, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]} 
        onPress={onPress} 
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isCompleted ? (isDarkMode ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9']) : [theme.surface, theme.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, compact && styles.compactCard, { borderColor: theme.border }]}
        >
          <View style={[styles.priorityBorder, { backgroundColor: getPriorityColor(task.priority) }]} />
          
          <View style={[styles.content, compact && styles.compactContent]}>
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, isCompleted && styles.checkboxCompleted, { backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC', borderColor: theme.border }]} 
                  onPress={handleToggleComplete}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={isCompleted ? "#FFFFFF" : "#38BDF8"} />
                  ) : (
                    isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }, isCompleted && styles.completedText]} numberOfLines={compact ? 2 : 1}>
                  {task.title}
                </Text>
              </View>
              {!compact && task.priority !== 'Medium' && (
                <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}15` }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                    {task.priority}
                  </Text>
                </View>
              )}
            </View>
            
            {!compact && task.description ? (
              <Text style={[styles.description, { color: theme.textSecondary }, isCompleted && styles.completedDescription]} numberOfLines={2}>
                {task.description}
              </Text>
            ) : null}
            
            <View style={[styles.footer, compact && styles.compactFooter]}>
              {!compact && (
                <View style={[styles.badge, { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', borderColor: theme.border }]}>
                  <Ionicons name="folder-outline" size={12} color={theme.textSecondary} style={{marginRight: 4}}/>
                  <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{task.category || 'General'}</Text>
                </View>
              )}
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={12} color={theme.textSecondary} style={{marginRight: 4}}/>
                <Text style={[styles.date, { color: theme.textSecondary }]}>
                  {task.due_time ? task.due_time : (compact ? 'No time' : (task.due_date ? task.due_date : 'No date'))}
                </Text>
              </View>
              {compact && task.priority !== 'Medium' && (
                 <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}15`, marginLeft: 'auto' }]}>
                   <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                     {task.priority}
                   </Text>
                 </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  compactContainer: {
    marginBottom: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  compactCard: {
    borderRadius: 16,
  },
  priorityBorder: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 18,
  },
  compactContent: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginTop: -2,
  },
  checkboxCompleted: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
    paddingLeft: 36,
  },
  completedDescription: {
    color: '#94A3B8',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 36,
  },
  compactFooter: {
    paddingLeft: 36,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 16,
    borderRadius: 20,
    paddingHorizontal: 24,
    marginLeft: -20,
    flex: 1,
  },
});
