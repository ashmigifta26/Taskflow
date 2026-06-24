#!/usr/bin/env bash
# Initialize Expo project in the existing taskflow directory
cd "c:/Users/ASHMIGIHTA/OneDrive/Documents/simple remainder app"
expo init taskflow --template blank --npm
# Move into the newly created folder (if not already there)
cd taskflow
# Install required dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context
npm install axios zustand
npm install react-native-paper @expo/vector-icons
npm install expo-status-bar expo-notifications
npm install @react-native-community/datetimepicker
expo install expo-dev-client
npm i -g eas-cli
