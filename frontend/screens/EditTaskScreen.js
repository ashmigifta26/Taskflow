import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import useTaskStore from '../store/useTaskStore';
import { scheduleTaskReminder } from '../services/notifications';

// ── Helper: auto-format time input ──────────────────────────────────────
const formatTimeInput = (raw) => {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length <= 2) return digits;
  const capped = digits.slice(0, 4);
  return `${capped.slice(0, 2)}:${capped.slice(2)}`;
};

// ── Helper: finalise time on blur (e.g. "1800" → "18:00") ──────────────
const finaliseTime = (raw) => {
  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits.padStart(2, '0') + ':00';
  if (digits.length === 3) return `0${digits[0]}:${digits.slice(1)}`;
  const hh = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  return `${hh}:${mm}`;
};

// ── Inline Calendar Component (dark theme) ──────────────────────────────
function InlineCalendar({ selectedDate, onSelectDate }) {
  const parsedSelected = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const initialMonth = parsedSelected || today;
  const [viewYear, setViewYear] = useState(initialMonth.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialMonth.getMonth());

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const rows = [];
    let week = new Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) { rows.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      rows.push(week);
    }
    return rows;
  }, [viewYear, viewMonth]);

  const goPrev = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const goNext = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const makeDateStr = (day) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return (
    <View style={calStyles.container}>
      <View style={calStyles.header}>
        <TouchableOpacity onPress={goPrev} style={calStyles.navBtn}>
          <Ionicons name="chevron-back" size={20} color="#38BDF8" />
        </TouchableOpacity>
        <Text style={calStyles.monthLabel}>{monthNames[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={goNext} style={calStyles.navBtn}>
          <Ionicons name="chevron-forward" size={20} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      <View style={calStyles.weekRow}>
        {dayNames.map(d => (
          <Text key={d} style={calStyles.weekLabel}>{d}</Text>
        ))}
      </View>

      {calendarDays.map((week, wi) => (
        <View key={wi} style={calStyles.weekRow}>
          {week.map((day, di) => {
            if (day === null) return <View key={di} style={calStyles.dayCell} />;
            const dateStr = makeDateStr(day);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayStr;
            return (
              <TouchableOpacity
                key={di}
                style={[
                  calStyles.dayCell,
                  isToday && !isSelected && calStyles.todayCell,
                  isSelected && calStyles.selectedCell,
                ]}
                onPress={() => onSelectDate(dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    calStyles.dayText,
                    isToday && !isSelected && calStyles.todayText,
                    isSelected && calStyles.selectedText,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    padding: 12,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  weekLabel: { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#64748B', paddingVertical: 4 },
  dayCell: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  dayText: { fontSize: 14, fontWeight: '600', color: '#CBD5E1' },
  todayCell: { backgroundColor: '#1E3A8A' },
  todayText: { color: '#38BDF8', fontWeight: '800' },
  selectedCell: { backgroundColor: '#38BDF8' },
  selectedText: { color: '#050816', fontWeight: '800' },
});

// ═════════════════════════════════════════════════════════════════════════
// EditTaskScreen
// ═════════════════════════════════════════════════════════════════════════
export default function EditTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;
  
  const tasks = useTaskStore(state => state.tasks);
  const updateTask = useTaskStore(state => state.updateTask);
  const fetchTasks = useTaskStore(state => state.fetchTasks);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];
  const categories = ['General', 'Work', 'Personal', 'Study', 'Health', 'Shopping'];

  useEffect(() => {
    // Try to get from store first, then fallback to API
    const existingTask = tasks.find(t => t.id === taskId);
    if (existingTask) {
      setTitle(existingTask.title || '');
      setDescription(existingTask.description || '');
      setDueDate(existingTask.due_date || '');
      setDueTime(existingTask.due_time || '');
      setPriority(existingTask.priority || 'Medium');
      setCategory(existingTask.category || 'General');
      setFetching(false);
    } else {
      // Fallback: fetch from API
      const loadTask = async () => {
        try {
          await fetchTasks();
          // After fetch, the store will update, triggering a re-render
          // We'll load from there on next render
        } catch (e) {
          Alert.alert('Error', 'Failed to load task for editing');
          navigation.goBack();
        } finally {
          setFetching(false);
        }
      };
      loadTask();
    }
  }, [taskId]);

  // Re-populate if tasks change (after fetchTasks completes)
  useEffect(() => {
    if (!fetching) return;
    const t = tasks.find(t => t.id === taskId);
    if (t) {
      setTitle(t.title || '');
      setDescription(t.description || '');
      setDueDate(t.due_date || '');
      setDueTime(t.due_time || '');
      setPriority(t.priority || 'Medium');
      setCategory(t.category || 'General');
      setFetching(false);
    }
  }, [tasks, taskId, fetching]);

  const validateDate = (dateStr) => {
    if (!dateStr) return true;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const validateTime = (timeStr) => {
    if (!timeStr) return true;
    const regex = /^\d{2}:\d{2}$/;
    return regex.test(timeStr);
  };

  // ── Calendar date pick handler ──
  const handleCalendarSelect = (dateStr) => {
    setDueDate(dateStr);
    setShowCalendar(false);
  };

  // ── Time auto-format while typing ──
  const handleTimeChange = (text) => {
    setDueTime(formatTimeInput(text));
  };

  // ── Time finalise on blur ──
  const handleTimeBlur = () => {
    if (dueTime) setDueTime(finaliseTime(dueTime));
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }

    if (dueDate && !validateDate(dueDate)) {
      Alert.alert('Invalid Date', 'Please use YYYY-MM-DD format (e.g., 2026-06-15).');
      return;
    }

    if (dueTime && !validateTime(dueTime)) {
      Alert.alert('Invalid Time', 'Please use HH:MM format (e.g., 14:30).');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate || null,
        due_time: dueTime || null,
        priority,
        category
      };
      
      // Use Zustand store — updates global state AND calls the API
      const updatedTask = await updateTask(taskId, taskData);
      
      // Re-schedule local notification if due date changed
      if (updatedTask && updatedTask.due_date) {
        await scheduleTaskReminder(updatedTask);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Update task error', error);
      Alert.alert('Error', 'Failed to update task. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    if (priority !== p) return '#1E3A8A';
    switch (p) {
      case 'High': return '#EF4444';
      case 'Medium': return '#2563EB';
      case 'Low': return '#10B981';
      default: return '#2563EB';
    }
  };

  const getPriorityIcon = (p) => {
    switch (p) {
      case 'High': return '🔴';
      case 'Medium': return '🔵';
      case 'Low': return '🟢';
      default: return '';
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading task...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Task</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <CustomInput 
          label="Task Title *" 
          value={title} 
          onChangeText={setTitle} 
          placeholder="What needs to be done?" 
        />
        <CustomInput 
          label="Description" 
          value={description} 
          onChangeText={setDescription} 
          placeholder="Add details (optional)" 
          multiline 
        />
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CustomInput 
              label="Due Date" 
              value={dueDate} 
              onChangeText={setDueDate} 
              placeholder="YYYY-MM-DD" 
              icon="📅"
              keyboardType="default"
              rightIcon={showCalendar ? '▲' : '▼'}
              onRightIconPress={() => setShowCalendar(!showCalendar)}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CustomInput 
              label="Time" 
              value={dueTime} 
              onChangeText={handleTimeChange} 
              onBlur={handleTimeBlur}
              placeholder="HH:MM" 
              icon="⏰"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Inline calendar picker */}
        {showCalendar && (
          <InlineCalendar
            selectedDate={dueDate}
            onSelectDate={handleCalendarSelect}
          />
        )}

        <Text style={styles.label}>Priority</Text>
        <View style={styles.pillsContainer}>
          {priorities.map(p => (
            <TouchableOpacity 
              key={p} 
              style={[
                styles.pill, 
                priority === p ? { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) } : null
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.pillText, priority === p ? styles.pillTextActive : null]}>
                {getPriorityIcon(p)} {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.pillsContainer}>
          {categories.map(c => (
            <TouchableOpacity 
              key={c} 
              style={[
                styles.pill, 
                category === c ? styles.pillActive : null
              ]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.pillText, category === c ? styles.pillTextActive : null]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton 
          title="Save Changes" 
          onPress={handleUpdate} 
          loading={loading} 
          style={styles.saveBtn}
          icon="💾"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E3A8A',
    backgroundColor: '#050816',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 12,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  pill: {
    marginRight: 10,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  pillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginTop: 12,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  }
});


