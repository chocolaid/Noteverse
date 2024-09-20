import { View, Text, Switch, TextInput, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../styles/styles';
export default function SettingsScreen() {
  const { theme } = useTheme();

  const [settings, setSettings] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBlockingScreenshots, setIsBlockingScreenshots] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState(false);
  const [isCloudBackupEnabled, setIsCloudBackupEnabled] = useState(false);
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState('');
  const [isLockTrickeryEnabled, setIsLockTrickeryEnabled] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
          // Initialize state with stored settings
          setIsDarkMode(parsedSettings.isDarkMode || false);
          setIsBlockingScreenshots(parsedSettings.isBlockingScreenshots || false);
          setIsBiometricEnabled(parsedSettings.isBiometricEnabled || false);
          setIsPasscodeEnabled(parsedSettings.isPasscodeEnabled || false);
          setIsCloudBackupEnabled(parsedSettings.isCloudBackupEnabled || false);
          setIsAutoLockEnabled(parsedSettings.isAutoLockEnabled || false);
          setAutoLockTime(parsedSettings.autoLockTime?.toString() || 0);
          setIsLockTrickeryEnabled(parsedSettings.isLockTrickeryEnabled || false);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primaryBackgroundColor }]}>
      <View style={styles.homeHeaderSection}>
        <Text style={[styles.homeHeaderText, { color: theme.primaryTextColor, marginTop: 8 }]}>
          Settings
        </Text>
      </View>

      <View style={styles.settingsCategory}>
        <Text style={styles.settingsCategoryTitle}>Display Settings</Text>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => {
                setIsDarkMode(value);
                updateSettings('isDarkMode', value);
              }}
            />
          </View>
          <Text style={styles.settingsCategoryItemOptionDescription}>Enable dark mode for the app</Text>
        </View>
      </View>

      <View style={styles.settingsCategory}>
        <Text style={styles.settingsCategoryTitle}>Security Settings</Text>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Block Screenshots</Text>
            <Switch
              value={isBlockingScreenshots}
              onValueChange={(value) => {
                setIsBlockingScreenshots(value);
                updateSettings('isBlockingScreenshots', value);
              }}
            />
          </View>
        </View>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Biometric Authentication</Text>
            <Switch
              value={isBiometricEnabled}
              onValueChange={(value) => {
                setIsBiometricEnabled(value);
                updateSettings('isBiometricEnabled', value);
              }}
            />
          </View>
        </View>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Passcode Lock</Text>
            <Switch
              value={isPasscodeEnabled}
              onValueChange={(value) => {
                setIsPasscodeEnabled(value);
                updateSettings('isPasscodeEnabled', value);
              }}
            />
          </View>
        </View>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Cloud Backup</Text>
            <Switch
              value={isCloudBackupEnabled}
              onValueChange={(value) => {
                setIsCloudBackupEnabled(value);
                updateSettings('isCloudBackupEnabled', value);
              }}
            />
          </View>
        </View>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Auto Lock</Text>
            <Switch
              value={isAutoLockEnabled}
              onValueChange={(value) => {
                setIsAutoLockEnabled(value);
                updateSettings('isAutoLockEnabled', value);
              }}
            />
          </View>
        </View>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Auto Lock Time (minutes)</Text>
            <TextInput
              style={styles.settingsCategoryItemOptionTextInput}
              onChangeText={(value) => {
                setAutoLockTime(value);
                updateSettings('autoLockTime', parseInt(value, 10) || 0);
              }}
              value={autoLockTime}
              keyboardType="numeric"
              numberOfLines={1}
              maxLength={2}
              placeholder='0'
            />
          </View>
        </View>
        <View style={styles.settingsCategoryItem}>
          <View style={styles.settingsCategoryItemOption}>
            <Text style={styles.settingsCategoryItemOptionText}>Lock Trickery</Text>
            <Switch
              value={isLockTrickeryEnabled}
              onValueChange={(value) => {
                setIsLockTrickeryEnabled(value);
                updateSettings('isLockTrickeryEnabled', value);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}


