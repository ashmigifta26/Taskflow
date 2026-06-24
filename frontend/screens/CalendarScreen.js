import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from '../components/TaskCard';
import useTaskStore from '../store/useTaskStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

const TOTAL_DAYS = 365; // 30 past + today + 334 future
const PAST_DAYS = 30;

export default function CalendarScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const tasks = useTaskStore(state => state.tasks);
  const fetchTasks = useTaskStore(state => state.fetchTasks);
  const isLoading = useTaskStore(state => state.isLoading);
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  const listRef = useRef(null);

  const getLocalDateString = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getLocalDateString();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isFocused) {
      const loadData = async () => {
        try {
          setError(null);
          await fetchTasks();
        } catch (err) {
          setError("Failed to load tasks.");
        }
      };
      loadData();
    }
  }, [isFocused]);

  // Generate array of dates
  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = -PAST_DAYS; i < TOTAL_DAYS - PAST_DAYS; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push(d);
    }
    return result;
  }, []);

  const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Scroll to today on mount
  useEffect(() => {
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.scrollToIndex({ index: PAST_DAYS, animated: true, viewPosition: 0 });
      }
    }, 500);
  }, []);

  const renderDayRow = ({ item: dateObj }) => {
    const dateStr = formatDateKey(dateObj);
    const isToday = todayStr === dateStr;
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = dateObj.getDate();

    const dayTasks = tasks ? tasks.filter(t => {
      const due = t.due_date ? t.due_date.trim() : null;
      if (isToday && !due) return true; // undated tasks count on today
      return due === dateStr;
    }) : [];

    return (
      <View style={[
        styles.dayRow, 
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
        isToday && { backgroundColor: theme.surfaceAlt }
      ]}>
        <View style={[styles.dateColumn, { borderRightColor: theme.border }]}>
          <Text style={[styles.dayName, { color: theme.textSecondary }, isToday && { color: theme.primary }]}>{dayName}</Text>
          <Text style={[styles.dayNum, { color: theme.text }, isToday && { color: theme.primary }]}>{dayNum}</Text>
          <Text style={[styles.monthName, { color: theme.textSecondary }, isToday && { color: theme.primary }]}>{dateObj.toLocaleDateString('en-US', { month: 'short' })}</Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tasksScrollContainer}
        >
          {dayTasks.map(task => (
            <View key={task.id} style={styles.taskCardWrapper}>
              <TaskCard
                task={task}
                onPress={() => navigation.navigate('TaskDetails', { taskId: task.id })}
                compact={true}
              />
            </View>
          ))}
          
          <TouchableOpacity 
            style={[styles.addTaskInlineBtn, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            onPress={() => navigation.navigate('AddTask', { initialDate: dateStr })}
          >
            <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? 'rgba(143, 168, 155, 0.15)' : 'rgba(95, 121, 149, 0.12)' }]}>
              <Ionicons name="add" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.addTaskText, { color: theme.primary }]}>Add Task</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border, shadowColor: theme.cardShadow }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Timeline</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{currentMonthYear}</Text>
        </View>
        <TouchableOpacity style={[styles.addGlobalBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]} onPress={() => navigation.navigate('AddTask', { initialDate: todayStr })}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading && tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={dates}
          keyExtractor={(item) => formatDateKey(item)}
          renderItem={renderDayRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          getItemLayout={(data, index) => (
            {length: 120, offset: 120 * index, index}
          )}
          initialScrollIndex={PAST_DAYS}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  addGlobalBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
    minHeight: 120,
  },
  dateColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRightWidth: 1,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayNum: {
    fontSize: 22,
    fontWeight: '800',
  },
  monthName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  tasksScrollContainer: {
    paddingLeft: 16,
    paddingRight: 20,
    alignItems: 'center',
  },
  taskCardWrapper: {
    width: 260,
    marginRight: 12,
    paddingVertical: 4,
  },
  addTaskInlineBtn: {
    width: 120,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addTaskText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
