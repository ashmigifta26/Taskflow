import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TaskCard from '../components/TaskCard';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import HorizontalTimeline from '../components/HorizontalTimeline';
import useTaskStore from '../store/useTaskStore';
import useAuthStore from '../store/useAuthStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

const POSITIVE_QUOTES = [
  "Believe you can and you're halfway there.",
  "Your focus determines your reality.",
  "Action is the foundational key to all success.",
  "The only way to do great work is to love what you do.",
  "You don't have to be perfect to be amazing.",
  "Small daily improvements over time lead to stunning results.",
  "Every champion was once a contender that refused to give up.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Start where you are. Use what you have. Do what you can.",
  "The secret of getting ahead is getting started.",
  "Don't count the days, make the days count.",
  "You are capable of doing amazing things.",
  "Opportunities don't happen, you create them.",
  "It always seems impossible until it's done.",
  "Keep your face always toward the sunshine - and shadows will fall behind you."
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { tasks, fetchTasks } = useTaskStore();
  const { user } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  const getLocalDateString = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => getLocalDateString());

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTasks();
    } catch (e) {}
    setRefreshing(false);
  };

  useEffect(() => {
    if (isFocused) {
      const load = async () => {
        try {
          await fetchTasks();
        } catch (e) {}
      };
      load();
    }
  }, [isFocused]);

  const todayStr = getLocalDateString();
  const isSelectedToday = selectedDate === todayStr;

  // Tasks matching the selected date, or tasks with NO due_date shown on today
  const selectedDateTasks = tasks.filter(t => {
    const due = t.due_date ? t.due_date.trim() : null;
    if (isSelectedToday && !due) return true; // undated tasks show on today
    return due === selectedDate;
  });
  const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const todayTasks = tasks.filter(t => {
    const due = t.due_date ? t.due_date.trim() : null;
    return due === todayStr || (!due); // count undated tasks under today
  }).length;

  const stats = {
    total: tasks.length,
    today: todayTasks,
    completed: completedCount,
    pending: pendingCount
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const currentHour = today.getHours();
  let greetingText = 'Good Morning';
  let greetingIcon = '☀️';
  if (currentHour >= 12 && currentHour < 17) {
    greetingText = 'Good Afternoon';
    greetingIcon = '🌤️';
  } else if (currentHour >= 17) {
    greetingText = 'Good Evening';
    greetingIcon = '🌙';
  }

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const userName = user?.name || 'Ashmi';
  const dailyQuote = POSITIVE_QUOTES[new Date().getDate() % POSITIVE_QUOTES.length];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.surface} />
      
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greetingIcon}>{greetingIcon}</Text>
            <View>
              <Text style={[styles.greeting, { color: theme.text }]}>{greetingText}, {userName}</Text>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>{dateString}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.iconBtn, { marginRight: 8 }]} onPress={() => toggleTheme(!isDarkMode)}>
              <View style={[styles.iconBtnInner, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Ionicons name={isDarkMode ? "sunny" : "moon"} size={22} color={theme.primary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.iconBtnInner, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={22} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressSummary}>
          <View style={[styles.progressBarTrack, { backgroundColor: theme.progressTrack }]}>
            <View
              style={[styles.progressBarFill, { width: `${completionPct}%`, backgroundColor: theme.progressFill }]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.textSecondary }]}>
            {completionPct}% completed  •  {stats.pending} remaining
          </Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Daily Positive Quote */}
        <View style={[styles.quoteCard, { backgroundColor: theme.quoteBackground, borderColor: theme.quoteBorder }]}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.primary} style={styles.quoteIcon} />
          <Text style={[styles.quoteText, { color: theme.text }]}>{dailyQuote}</Text>
        </View>

        {/* Horizontal Stats List */}
        <View style={styles.statsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContent}
          >
            <StatCard label="Total Tasks" value={stats.total} icon="📋" variant="slate" style={styles.horizontalStatCard} />
            <StatCard label="Completed" value={stats.completed} icon="✅" variant="sage" style={styles.horizontalStatCard} />
            <StatCard label="Pending" value={stats.pending} icon="⏳" variant="terracotta" style={styles.horizontalStatCard} />
            <StatCard label="Today" value={stats.today} icon="📅" variant="sand" style={styles.horizontalStatCard} />
          </ScrollView>
        </View>

        {/* Horizontal Timeline */}
        <HorizontalTimeline 
          selectedDate={selectedDate} 
          onSelectDate={setSelectedDate} 
          tasks={tasks}
        />

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionIndicator, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {isSelectedToday ? "Today's Tasks" : `Tasks for ${new Date(selectedDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}`}
            </Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            <Text style={[styles.countBadgeText, { color: theme.primary }]}>{selectedDateTasks.length}</Text>
          </View>
        </View>
        
        <View style={styles.scheduleContainer}>
          {selectedDateTasks.length === 0 ? (
            <EmptyState 
              icon="✨" 
              title={isSelectedToday ? "You're all caught up!" : "No tasks scheduled"} 
              subtitle="Enjoy your day or add a new task to stay productive." 
              buttonText="Create Task" 
              onButtonPress={() => navigation.navigate('AddTask', { initialDate: selectedDate })}
            />
          ) : (
            selectedDateTasks.map(item => (
              <TaskCard 
                key={item.id} 
                task={item} 
                onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })} 
              />
            ))
          )}
        </View>

        {/* Upcoming Tasks Section */}
        {isSelectedToday && (() => {
          const upcomingTasks = tasks
            .filter(t => t.due_date && t.due_date.trim() > todayStr && t.status !== 'Completed')
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            .slice(0, 3); // Show next 3 upcoming
            
          if (upcomingTasks.length === 0) return null;

          return (
            <>
              <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.sectionIndicator, { backgroundColor: theme.accent }]} />
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming</Text>
                </View>
              </View>
              <View style={styles.scheduleContainer}>
                {upcomingTasks.map(item => (
                  <TaskCard 
                    key={item.id} 
                    task={item} 
                    onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })} 
                  />
                ))}
              </View>
            </>
          );
        })()}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.fabContainer, { shadowColor: theme.primary }]} 
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fab}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  greetingSection: { flexDirection: 'row', alignItems: 'center' },
  greetingIcon: { fontSize: 28, marginRight: 12 },
  greeting: { fontSize: 22, fontWeight: '800', marginBottom: 2 },
  dateText: { fontSize: 13, fontWeight: '600' },
  iconBtn: { position: 'relative' },
  iconBtnInner: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  progressSummary: { marginTop: 4 },
  progressBarTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  progressText: { fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingBottom: 120, paddingTop: 20 },
  statsContainer: { marginBottom: 24 },
  statsScrollContent: { paddingHorizontal: 19, paddingVertical: 4 },
  horizontalStatCard: {
    width: 140,
    marginRight: 10,
    marginHorizontal: 0, // override custom marginHorizontal from component
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  quoteIcon: {
    marginRight: 12,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionIndicator: { width: 4, height: 18, borderRadius: 2, marginRight: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  countBadgeText: { fontSize: 13, fontWeight: '700' },
  scheduleContainer: { paddingHorizontal: 24, marginBottom: 28 },
  fabContainer: { position: 'absolute', bottom: 24, right: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  fab: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
