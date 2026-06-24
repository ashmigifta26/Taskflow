import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import api from '../services/api';
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
// AddReminderScreen
// ═════════════════════════════════════════════════════════════════════════
export default function AddReminderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;

  const [reminderDate, setReminderDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [recurrenceRule, setRecurrenceRule] = useState('None');
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const recurrenceOptions = ['None', 'DAILY', 'WEEKLY', 'MONTHLY'];

  // ── Calendar date pick handler ──
  const handleCalendarSelect = (dateStr) => {
    setReminderDate(dateStr);
    setShowCalendar(false);
  };

  // ── Time auto-format while typing ──
  const handleTimeChange = (text) => {
    setReminderTime(formatTimeInput(text));
  };

  // ── Time finalise on blur ──
  const handleTimeBlur = () => {
    if (reminderTime) setReminderTime(finaliseTime(reminderTime));
  };

  const handleSave = async () => {
    if (!reminderDate || !reminderTime) {
      Alert.alert('Validation Error', 'Both Date and Time are required.');
      return;
    }

    // Basic format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}(:\d{2})?$/; // allow optional seconds

    if (!dateRegex.test(reminderDate)) {
      Alert.alert('Validation Error', 'Date must be in YYYY-MM-DD format.');
      return;
    }

    if (!timeRegex.test(reminderTime)) {
      Alert.alert('Validation Error', 'Time must be in HH:MM or HH:MM:SS format.');
      return;
    }

    // Normalize time to add seconds if missing
    let timeWithSeconds = reminderTime;
    if (reminderTime.length === 5) {
      timeWithSeconds = `${reminderTime}:00`;
    }

    setLoading(true);
    try {
      const reminder_time = `${reminderDate}T${timeWithSeconds}Z`;
      const payload = { task_id: taskId, reminder_time };
      if (recurrenceRule !== 'None') {
        payload.recurrence_rule = recurrenceRule;
      }
      await api.post('/reminders/', payload);
      
      // Schedule local notification for this reminder
      await scheduleTaskReminder({
        id: `rem_${Date.now()}`,
        title: `Reminder for Task #${taskId}`,
        due_date: reminderDate,
        due_time: timeWithSeconds
      });
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Reminder</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.infoText}>Set a custom reminder for this task.</Text>
        
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <CustomInput 
              label="Date" 
              value={reminderDate} 
              onChangeText={setReminderDate} 
              placeholder="YYYY-MM-DD" 
              icon="📅"
              rightIcon={showCalendar ? '▲' : '▼'}
              onRightIconPress={() => setShowCalendar(!showCalendar)}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <CustomInput 
              label="Time" 
              value={reminderTime} 
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
            selectedDate={reminderDate}
            onSelectDate={handleCalendarSelect}
          />
        )}

        <Text style={styles.label}>Repeat Options</Text>
        <View style={styles.pillsContainer}>
          {recurrenceOptions.map(opt => (
            <TouchableOpacity 
              key={opt} 
              style={[
                styles.pill, 
                recurrenceRule === opt ? styles.pillActive : null
              ]}
              onPress={() => setRecurrenceRule(opt)}
            >
              <Text style={[styles.pillText, recurrenceRule === opt ? styles.pillTextActive : null]}>
                {opt === 'None' ? 'Does not repeat' : opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <CustomButton 
          title="Save Reminder" 
          onPress={handleSave} 
          loading={loading} 
          style={styles.saveBtn} 
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
  infoText: {
    fontSize: 15,
    color: '#94A3B8',
    marginBottom: 24,
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
});
