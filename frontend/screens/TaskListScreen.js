import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import CustomInput from '../components/CustomInput';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import { Ionicons } from '@expo/vector-icons';
import useTaskStore from '../store/useTaskStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

export default function TaskListScreen() {
  const navigation = useNavigation();
  const { tasks, fetchTasks } = useTaskStore();
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const applyFilters = (allTasks, searchText, status) => {
    let filtered = allTasks;
    if (searchText) {
      filtered = filtered.filter(t => t.title.toLowerCase().includes(searchText.toLowerCase()));
    }
    if (status !== 'All') {
      filtered = filtered.filter(t => t.status === status);
    }
    setFilteredTasks(filtered);
  };

  useEffect(() => {
    applyFilters(tasks, search, statusFilter);
  }, [search, statusFilter, tasks]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderEmptyState = () => (
    <EmptyState 
      icon="🔍"
      title="No tasks found"
      subtitle="Try adjusting your filters or search query."
      buttonText="Add Task"
      onButtonPress={() => navigation.navigate('AddTask')}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>All Tasks</Text>
      </View>

      {/* Filter Section */}
      <View style={[styles.filterSection, { backgroundColor: theme.background }]}>
        <CustomInput 
          placeholder="Search tasks..." 
          value={search} 
          onChangeText={setSearch} 
          icon="🔍"
        />
        <View style={styles.pillsContainer}>
          {['All', 'Pending', 'Completed'].map(status => (
            <TouchableOpacity 
              key={status} 
              style={[
                styles.pill, 
                { backgroundColor: theme.surface, borderColor: theme.border }, 
                statusFilter === status && [styles.pillActive, { backgroundColor: theme.primary, borderColor: theme.primary }]
              ]}
              onPress={() => setStatusFilter(status)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.pillText, 
                { color: theme.textSecondary }, 
                statusFilter === status && styles.pillTextActive
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })} 
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={[styles.fabContainer, { shadowColor: theme.primary }]} 
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  filterSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    marginTop: -8, 
  },
  pill: {
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  pillActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // space for FAB
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
