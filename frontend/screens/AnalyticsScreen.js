import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import CustomButton from '../components/CustomButton';
import api from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [productivity, setProductivity] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const prodRes = await api.get('/analytics/productivity');
        const trendsRes = await api.get('/analytics/trends');
        setProductivity(prodRes.data);
        setTrends(trendsRes.data);
        setError(false);
      } catch (err) {
        console.warn('[Analytics] Could not load analytics data');
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ color: '#94A3B8', marginTop: 16 }}>Analyzing data...</Text>
      </View>
    );
  }

  if (error || !productivity || !trends) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>📊</Text>
        <Text style={{ color: '#94A3B8', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
          Could not load analytics
        </Text>
        <Text style={{ color: '#64748B', fontSize: 13, textAlign: 'center', paddingHorizontal: 40 }}>
          Check your connection and make sure the backend is running.
        </Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: () => '#64748B',
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#FFFFFF"
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreTitle}>Productivity Score</Text>
          <Text style={styles.scoreValue}>{productivity.productivity_score}</Text>
          <Text style={styles.scoreSubtitle}>{productivity.completion_percentage}% Completion Rate</Text>
        </View>

        <Text style={styles.sectionTitle}>Completion Trends (Past 6 months)</Text>
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [{ data: trends.completion_trends }]
            }}
            width={screenWidth - 48}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>

        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{productivity.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>{productivity.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#2563EB' }]}>{productivity.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#EF4444' }]}>{productivity.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>💡 Most productive day: <Text style={{fontWeight: '700', color: '#0369A1'}}>{productivity.most_productive_day}</Text></Text>
        </View>
        <View style={styles.insightCard}>
          <Text style={styles.insightText}>📈 Most active category: <Text style={{fontWeight: '700', color: '#0369A1'}}>{trends.most_active_category}</Text></Text>
        </View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0' 
  },
  backBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#F1F5F9', 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  scoreCard: { 
    backgroundColor: '#2563EB', 
    padding: 24, 
    borderRadius: 24, 
    alignItems: 'center', 
    marginBottom: 32, 
    shadowColor: '#2563EB', 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 16, 
    elevation: 8 
  },
  scoreTitle: { color: '#EFF6FF', fontSize: 15, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreValue: { color: '#ffffff', fontSize: 48, fontWeight: '800', marginBottom: 4 },
  scoreSubtitle: { color: '#bfdbfe', fontSize: 14, fontWeight: '500' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  chartContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 24, 
    padding: 12, 
    marginBottom: 32, 
    alignItems: 'center', 
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { 
    width: '48%', 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 20, 
    marginBottom: 16, 
    shadowColor: '#64748B', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 12, 
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  insightCard: { 
    backgroundColor: '#F0F9FF', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#BAE6FD' 
  },
  insightText: { fontSize: 15, color: '#0284C7', lineHeight: 22 }
});
