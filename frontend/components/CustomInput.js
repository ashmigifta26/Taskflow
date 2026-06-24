import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import useThemeStore, { getThemeColors } from '../store/useThemeStore';

export default function CustomInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  multiline = false,
  numberOfLines,
  icon,
  rightIcon,
  onRightIconPress,
  error,
  keyboardType,
  editable = true,
  autoCapitalize = 'sentences',
  returnKeyType,
  onSubmitEditing,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureVisible, setIsSecureVisible] = useState(false);
  const { isDarkMode } = useThemeStore();
  const theme = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: theme.surface, borderColor: theme.border },
          isFocused && { borderColor: theme.primary },
          error && styles.inputWrapperError,
          multiline && styles.inputWrapperMultiline,
          !editable && styles.inputWrapperDisabled,
        ]}
      >
        {icon && <Text style={[styles.icon, { color: theme.textSecondary }]}>{icon}</Text>}
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            multiline && styles.multilineInput,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          secureTextEntry={secureTextEntry && !isSecureVisible}
          multiline={multiline}
          numberOfLines={multiline ? (numberOfLines || 4) : 1}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType || 'default'}
          editable={editable}
          autoCapitalize={autoCapitalize}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsSecureVisible(!isSecureVisible)} style={styles.eyeBtn}>
            <Text style={[styles.eyeIconText, { color: theme.primary }]}>{isSecureVisible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.eyeBtn}>
            <Text style={styles.eyeIcon}>{rightIcon}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>⚠ {error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderColor: '#5F7995', // fallback, will override below with theme
  },
  inputWrapperError: {
    borderColor: '#C28C8A',
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputWrapperDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 8,
  },
  eyeIconText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: '#C28C8A',
    marginTop: 6,
    fontWeight: '500',
  },
});
