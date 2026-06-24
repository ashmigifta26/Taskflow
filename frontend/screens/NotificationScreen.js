import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import CustomInput from '../components/CustomInput';
import EmptyState from '../components/EmptyState';
import api from '../services/api';

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState({ upcoming: [], missed: [], history: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('upcoming');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data || { upcoming: [], missed: [], history: [] });
    } catch (error) {
      // Silently ignore transient errors — keep showing existing data
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => fetchNotifications());
    return unsubscribe;
  }, [navigation]);

  const applyFilters = (list) => {
    if (!list) return [];
    let filtered = list;
    if (search) {
      filtered = filtered.filter(item => 
        item.task_title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }
    return filtered;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigation.navigate('TaskDetails', { taskId: item.task_id })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.task_title}</Text>
        <Text style={styles.priority}>{item.task_priority} Priority</Text>
      </View>
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={14} color="#94A3B8" />
        <Text style={styles.time}>{new Date(item.reminder_time).toLocaleString()}</Text>
      </View>
      <View style={[styles.statusBadge, item.status === 'Missed' ? styles.missed : item.status === 'Sent' ? styles.sent : styles.pending]}>
        <Text style={[styles.statusText, item.status === 'Missed' ? styles.missedText : item.status === 'Sent' ? styles.sentText : styles.pendingText]}>
          {item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const displayedList = applyFilters(notifications[tab]);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
       <EmptyState 
         icon="🔔"
         title="All caught up!"
         subtitle="You have no notifications in this category."
       />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <View style={styles.tabs}>
        {['upcoming', 'missed', 'history'].map((t) => (
           <TouchableOpacity 
             key={t}
             style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
             onPress={() => setTab(t)}
           >
             <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
               {t.charAt(0).toUpperCase() + t.slice(1)}
             </Text>
           </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterSection}>
        <CustomInput 
          placeholder="Search notifications..." 
          value={search} 
          onChangeText={setSearch} 
          icon="🔍"
        />
        <View style={styles.pillsContainer}>
          {['All', 'Pending', 'Sent', 'Missed'].map(status => (
            <TouchableOpacity 
              key={status} 
              style={[styles.pill, statusFilter === status && styles.pillActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.pillText, statusFilter === status && styles.pillTextActive]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563EB" />}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050816' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#050816', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E3A8A' 
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  tabs: { 
    flexDirection: 'row', 
    padding: 16, 
    backgroundColor: '#050816', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1E3A8A' 
  },
  tabBtn: { 
    flex: 1, 
    alignItems: 'center',
    paddingVertical: 10, 
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E3A8A'
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8'
  },
  tabTextActive: {
    color: '#FFFFFF'
  },
  filterSection: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, backgroundColor: '#050816' },
  pillsContainer: { flexDirection: 'row', marginTop: -8 },
  pill: { 
    marginRight: 8, 
    paddingVertical: 6, 
    paddingHorizontal: 16, 
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E3A8A'
  },
  pillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  pillText: { fontSize: 13, fontWeight: '600', color: '#94A3B8' },
  pillTextActive: { color: '#050816', fontWeight: '700' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { 
    backgroundColor: '#0F172A', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    shadowColor: '#2563EB', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 4, 
    borderWidth: 1, 
    borderColor: '#1E3A8A' 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', flex: 1, paddingRight: 8 },
  priority: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  time: { fontSize: 14, color: '#94A3B8', marginLeft: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  statusText: { fontSize: 12, fontWeight: '700' },
  pending: { backgroundColor: 'rgba(37, 99, 235, 0.1)', borderColor: '#2563EB' }, 
  pendingText: { color: '#38BDF8' },
  sent: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981' }, 
  sentText: { color: '#10B981' },
  missed: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }, 
  missedText: { color: '#EF4444' },
  emptyContainer: { marginTop: 40 },
});
