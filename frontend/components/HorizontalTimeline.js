import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

const { width } = Dimensions.get('window');

export default function HorizontalTimeline({ 
  selectedDate, 
  onSelectDate, 
  tasks = [] 
}) {
  const scrollViewRef = useRef(null);
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -30; i <= 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  const dates = generateDates();

  const formatKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        // Scroll to today (index 30). Width of item is ~70px (60 width + 10 margin)
        scrollViewRef.current.scrollTo({ x: 30 * 70, animated: true });
      }
    }, 100);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((dateObj, index) => {
          const dateStr = formatKey(dateObj);
          const isSelected = selectedDate === dateStr;
          const isToday = formatKey(new Date()) === dateStr;
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();

          const dayTasks = tasks.filter(t => {
            const due = t.due_date ? t.due_date.trim() : null;
            if (isToday && !due) return true; // undated tasks count on today
            return due === dateStr;
          });
          const hasTasks = dayTasks.length > 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isSelected && [styles.dayCellSelected, { backgroundColor: theme.primary, borderColor: theme.primary }],
                isToday && !isSelected && { borderColor: theme.sage, borderWidth: 2 }
              ]}
              onPress={() => onSelectDate(dateStr)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dayName,
                { color: theme.textSecondary },
                isSelected && { color: '#FFFFFF' },
              ]}>
                {dayName}
              </Text>
              
              <Text style={[
                styles.dayNum,
                { color: theme.text },
                isSelected && { color: '#FFFFFF' },
              ]}>
                {dayNum}
              </Text>

              <Text style={[
                styles.monthName,
                { color: theme.textSecondary },
                isSelected && { color: 'rgba(255,255,255,0.9)' },
              ]}>
                {dateObj.toLocaleDateString('en-US', { month: 'short' })}
              </Text>

              {hasTasks && (
                <View style={[styles.taskDot, { backgroundColor: isSelected ? '#FFFFFF' : theme.sage }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 110,
    marginBottom: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dayCell: {
    width: 60,
    height: 94,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dayCellSelected: {
    shadowColor: 'rgba(95,121,149,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 20,
    fontWeight: '800',
  },
  monthName: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  taskDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
});
