import React, { useEffect } from 'react';
import { View, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';

export default function SplashScreen({ navigation }) {
  const { user } = useStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  logo: { width: 120, height: 120, marginBottom: 20 },
});
