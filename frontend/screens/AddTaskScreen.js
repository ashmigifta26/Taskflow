import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import useTaskStore from '../store/useTaskStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';
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

// ── Inline Calendar Component ───────────────────────────────────────────
function InlineCalendar({ selectedDate, onSelectDate }) {
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  
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
    <View style={[calStyles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Month / Year header */}
      <View style={calStyles.header}>
        <TouchableOpacity onPress={goPrev} style={[calStyles.navBtn, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="chevron-back" size={20} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[calStyles.monthLabel, { color: theme.text }]}>{monthNames[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={goNext} style={[calStyles.navBtn, { backgroundColor: theme.surfaceAlt }]}>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Day-of-week labels */}
      <View style={calStyles.weekRow}>
        {dayNames.map(d => (
          <Text key={d} style={[calStyles.weekLabel, { color: theme.textSecondary }]}>{d}</Text>
        ))}
      </View>

      {/* Day grid */}
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
                  isToday && !isSelected && { backgroundColor: isDarkMode ? 'rgba(143, 168, 155, 0.15)' : 'rgba(95, 121, 149, 0.15)' },
                  isSelected && { backgroundColor: theme.primary },
                ]}
                onPress={() => onSelectDate(dateStr)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    calStyles.dayText,
                    { color: theme.text },
                    isToday && !isSelected && { color: theme.primary, fontWeight: '800' },
                    isSelected && { color: '#FFFFFF', fontWeight: '800' },
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
    borderRadius: 16,
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: { fontSize: 16, fontWeight: '700' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  weekLabel: { width: 36, textAlign: 'center', fontSize: 12, fontWeight: '700', paddingVertical: 4 },
  dayCell: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginVertical: 2 },
  dayText: { fontSize: 14, fontWeight: '600' },
});

// ═════════════════════════════════════════════════════════════════════════
// AddTaskScreen
// ═════════════════════════════════════════════════════════════════════════
export default function AddTaskScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const addTask = useTaskStore(state => state.addTask);
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  
  const prefilledDate = route.params?.initialDate || route.params?.prefilledDate || '';
  const prefilledTime = route.params?.prefilledTime || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(prefilledDate);
  const [dueTime, setDueTime] = useState(prefilledTime);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('General');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const priorities = ['Low', 'Medium', 'High'];
  const categories = ['General', 'Work', 'Personal', 'Study', 'Health', 'Shopping'];

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

  const handleCalendarSelect = (dateStr) => {
    setDueDate(dateStr);
    setShowCalendar(false);
  };

  const handleTimeChange = (text) => {
    setDueTime(formatTimeInput(text));
  };

  const handleTimeBlur = () => {
    if (dueTime) setDueTime(finaliseTime(dueTime));
  };

  const handleSave = async () => {
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
      
      const newTask = await addTask(taskData);
      
      if (newTask && newTask.due_date) {
        await scheduleTaskReminder(newTask);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Save task error', error);
      Alert.alert('Error', 'Failed to save task. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'High': return theme.terracotta;
      case 'Medium': return theme.primary;
      case 'Low': return theme.sage;
      default: return theme.primary;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surfaceAlt }]} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>New Task</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="none"
      >
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

        <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
        <View style={styles.pillsContainer}>
          {priorities.map(p => (
            <TouchableOpacity 
              key={p} 
              style={[
                styles.pill, 
                { backgroundColor: theme.surface, borderColor: theme.border },
                priority === p ? { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) } : null
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.pillText, { color: theme.textSecondary }, priority === p ? styles.pillTextActive : null]}>
                {getPriorityIcon(p)} {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
        <View style={styles.pillsContainer}>
          {categories.map(c => (
            <TouchableOpacity 
              key={c} 
              style={[
                styles.pill, 
                { backgroundColor: theme.surface, borderColor: theme.border },
                category === c ? [styles.pillActive, { backgroundColor: theme.primary, borderColor: theme.primary }] : null
              ]}
              onPress={() => setCategory(c)}
            >
              <Text style={[styles.pillText, { color: theme.textSecondary }, category === c ? styles.pillTextActive : null]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton 
          title="Create Task" 
          onPress={handleSave} 
          loading={loading} 
          style={styles.saveBtn}
          icon="✨"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
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
    borderWidth: 1,
  },
  pillActive: {},
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    marginTop: 12,
  },
});
