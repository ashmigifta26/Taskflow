import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import useAuthStore from '../store/useAuthStore';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

export default function LoginScreen({ navigation }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isLoading } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (error) {
      console.error(error);
      const detail = error.response?.data?.detail;
      const message = Array.isArray(detail) ? detail[0]?.msg : detail;
      Alert.alert('Authentication Failed', message || 'An error occurred. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isLogin ? 'Sign in to access your tasks and schedule.' : 'Sign up to start managing your tasks efficiently.'}
            </Text>
          </View>

          <View style={[styles.form, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.cardShadow }]}>
            {!isLogin && (
              <CustomInput
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
              />
            )}
            
            <CustomInput
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <CustomInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {!isLogin && (
              <Text style={[styles.helperText, { color: theme.textSecondary }]}>* Password must be at least 8 characters</Text>
            )}

            <CustomButton
              title={isLogin ? 'Sign In' : 'Sign Up'}
              onPress={handleAuth}
              loading={isLoading}
              style={styles.submitBtn}
            />

            <View style={styles.toggleContainer}>
              <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={[styles.toggleLink, { color: theme.primary }]}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    padding: 24,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
  },
  submitBtn: {
    marginTop: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: '700',
  },
});
