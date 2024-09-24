import { View, Text, Switch, TextInput, StyleSheet, KeyboardAvoidingView, SafeAreaView, ScrollView, Modal, TouchableOpacity, Alert, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../styles/styles';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const [isIntruding, setIsIntruding] = useState(false);
  const navigation = useNavigation();

  const [settings, setSettings] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isBlockingScreenshots, setIsBlockingScreenshots] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isPasscodeEnabled, setIsPasscodeEnabled] = useState(false);
  const [isCloudBackupEnabled, setIsCloudBackupEnabled] = useState(false);
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState(false);
  const [autoLockTime, setAutoLockTime] = useState('');
  const [isLockTrickeryEnabled, setIsLockTrickeryEnabled] = useState(false);
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
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

  useEffect(() => {
    const fetchIntruding = async () => {
      try {
        const intruding = await AsyncStorage.getItem('Intruding');
        if (intruding === 'true') {
          setIsIntruding(true);
        }
      }
      catch (error) {
        console.error('Error fetching intruding:', error);
      }
    }
    fetchIntruding();
  }, [isIntruding])

  const updateSettings = async (key, value) => {
    try {
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const checkPasscodeAndEnable = async (callback) => {
    try {
      const pin = await AsyncStorage.getItem('pin');
      if (!pin) {
        Alert.alert(
          'Pin not configured',
          'You need to set up a pin before enabling this feature. Do you want to set up a pin now?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Setup Pin', onPress: () => navigation.navigate('Lock', { mode: 'setup' }) }
          ]
        );
      } else {
        callback();
      }
    } catch (error) {
      console.error('Error checking passcode:', error);
    }
  };

  const checkIfUserisAuthenticated = async (callback) => {
    try {
      const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
      if (isAuthenticated !== 'true') {
        Alert.alert(
          'Authentication Required',
          'You are not logged in to a cloud account. Please Sign in to enable this feature.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign In', onPress: () => navigation.navigate('Login', { return: 'settings' }) }
          ]
        );
      }
      else {
        callback();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
    }
  };

  const handleThemeSelection = (themeOption) => {
    setTheme(themeOption);
    setIsThemeModalVisible(false);
    updateSettings('theme', themeOption);
  };

  return (
    (isIntruding) ? (<View style={[styles.container, { backgroundColor: theme.primaryBackgroundColor }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 50, flex: 1 }}>
        <Text style={{ color: theme.primaryTextColor, fontSize: 20, textAlign: 'center', marginTop: 20 }}>
        In a quaint neighborhood, there stood an old house, charming yet enigmatic, with ivy climbing its walls and a creaky front door that seemed to whisper secrets with every opening. This house had seen many years, and within its walls lay countless memories, each room holding stories known only to its owner.

One day, an unexpected visitor arrived, drawn by curiosity and the allure of mystery. As they approached, the house stood silent, its windows reflecting the late afternoon sun like watchful eyes. The door, slightly ajar, welcomed the intruder in, though the house knew better than to truly invite.

Inside, the visitor wandered from room to room, marveling at the faded photographs and antique furniture. Yet, as they explored, something felt off. The décor, though charming, seemed almost too deliberate, as if it were curated for an audience rather than a home. Every corner they turned held something that piqued their interest—a book on the shelf, a painting on the wall—but none of it felt quite personal.

They found a study filled with neatly stacked papers and journals, the ink still fresh on some pages. The visitor flipped through them, but the notes were mundane, filled with lists of groceries and reminders to water plants. It felt like a charade, an invitation to delve deeper, yet every time they sought something more intimate, they were met with the ordinary.

The house watched quietly, sensing the visitor’s frustration. It understood the art of misdirection, knowing that sometimes the most valuable secrets are hidden in plain sight. The intruder’s search for hidden treasures turned into a fruitless quest, as the house had crafted a clever facade—an open book filled with everyday thoughts, easily dismissed as trivial.

With each room explored, the visitor felt more perplexed. What was the story behind this house? Why did it seem to hold back? Eventually, disheartened and unable to uncover anything of real significance, they turned to leave. The house sighed softly, knowing it had protected its true essence, its real memories, from the unwelcome gaze.

As the door clicked shut behind the visitor, the house settled back into its quietude, content that its stories remained safe, waiting for the right person to truly understand their worth.

The visitor walked away, the mystery of the house lingering in their thoughts. They knew they had missed something, a hidden truth that lay just beyond their reach. Perhaps one day, they would return, ready to unravel the enigma of the house with ivy-covered walls and a door that whispered secrets.
        </Text>
      </ScrollView>
    </View>) :
    (<KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.primaryBackgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>
          <View style={styles.homeHeaderSection}>
            <Text style={[styles.homeHeaderText, { color: theme.primaryTextColor, marginTop: 8 }]}>
              Settings
            </Text>
          </View>

          <View style={styles.settingsCategory}>
            <Text style={[styles.settingsCategoryTitle, { color: theme.primaryTextColor }]}>Display Settings</Text>
            <View>
            <View style={styles.settingsCategoryItem}>
              <TouchableOpacity
                style={[styles.settingsCategoryItemOption]}
                onPress={() => setIsThemeModalVisible(true)}
              >
                <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                  App Theme
                </Text>
                <Text style={[styles.settingsCategoryItemOptionDescription, { color: theme.primaryTextColor }]}>
                  {theme.name === 'Light' ? 'LIGHT THEME' : theme.name === 'Dark' ? 'DARK THEME' : 'SYSTEM THEME'}
                </Text>
              </TouchableOpacity>
              <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                    Switch between app themes <Text style={{color: '#03a9f4', fontWeight: 600}}>#NOCOMMENT</Text> 
                    </Text>
                  </View>
            </View>
            
            </View>
          </View>

          <View style={styles.settingsCategory}>
            <Text style={[styles.settingsCategoryTitle, { color: theme.primaryTextColor }]}>Security Settings</Text>
            <View style={styles.settingsCategoryItem}>
              <View>
                <View style={styles.settingsCategoryItemOption}>
                <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                  Block Screenshots
                </Text>
                <Switch
                  value={isBlockingScreenshots}
                  onValueChange={(value) => {
                    setIsBlockingScreenshots(value);
                    updateSettings('isBlockingScreenshots', value);
                  }}
                />
              </View>
              </View>
              <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                      Screenshot and Screenrecording are blocked to protect your notes from prying eyes. <Text style={{color: '#03a9f4', fontWeight: 600}}>#YourPrivacyMatters</Text> 
                    </Text>
                  </View>
            </View>

            <View style={styles.settingsCategoryItem}>
              <View>
              <View style={styles.settingsCategoryItemOption}>
                <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                  Passcode Lock
                </Text>
                <Switch
                  value={isPasscodeEnabled}
                  onValueChange={(value) => {
                    if (!value) {
                      updateSettings('isPasscodeEnabled', value);
                      setIsPasscodeEnabled(value);
                      return;
                    }
                    checkPasscodeAndEnable(() => {
                      setIsPasscodeEnabled(value);
                      updateSettings('isPasscodeEnabled', value);
                    });
                  }}
                />
              </View>
              <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                      Protect your notes with a passcode. <Text style={{color: '#03a9f4', fontWeight: 600}}>#YourPrivacyMatters</Text> 
                    </Text>
                  </View>
              </View>
            </View>

            <View style={styles.settingsCategoryItem}>
              <View>
                <View style={styles.settingsCategoryItemOption}>
                <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                  Auto Lock
                </Text>
                <Switch
                  value={isAutoLockEnabled}
                  onValueChange={(value) => {
                    if (!value) {
                      updateSettings('isAutoLockEnabled', value);
                      setIsAutoLockEnabled(value);
                      return;
                    }
                    checkPasscodeAndEnable(() => {
                      setIsAutoLockEnabled(value);
                      updateSettings('isAutoLockEnabled', value);
                    });
                  }}
                  disabled={!isPasscodeEnabled}
                />
              </View>
              <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                      Automatically lock the app after a specified time of inactivity. <Text style={{color: '#03a9f4', fontWeight: 600}}>#YourPrivacyMatters</Text> 
                    </Text>
              </View>
              </View>
              
            </View>

            <View style={styles.settingsCategoryItem}>
              <View>
              <View style={styles.settingsCategoryItemOption}>
                <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                  Auto Lock Time (minutes)
                </Text>
                <TextInput
                  style={[styles.settingsCategoryItemOptionTextInput, { color: theme.primaryTextColor, fontWeight: 'bold' }]}
                  onChangeText={(value) => {
                    setAutoLockTime(value);
                    updateSettings('autoLockTime', parseInt(value, 10) || 0);
                  }}
                  placeholderTextColor={theme.inputFieldHintColor}
                  value={autoLockTime}
                  keyboardType="numeric"
                  numberOfLines={1}
                  maxLength={2}
                  placeholder="0"
                  editable={isPasscodeEnabled && isAutoLockEnabled}
                />
              </View>
              <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                      Automatically lock the app after a specified time of inactivity. <Text style={{color: '#03a9f4', fontWeight: 600}}>#YourPrivacyMatters</Text> 
                    </Text>
                  </View>
              </View>
              
            </View>

            <View style={styles.settingsCategoryItem}>
              
                <View>
                  <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                    Lock Trickery
                    </Text>
                    <Switch
                      value={isLockTrickeryEnabled}
                      onValueChange={(value) => {
                        if (!value) {
                          updateSettings('isLockTrickeryEnabled', value);
                          setIsLockTrickeryEnabled(value);
                          return;
                        }
                        checkPasscodeAndEnable(() => {
                          setIsLockTrickeryEnabled(value);
                          updateSettings('isLockTrickeryEnabled', value);
                        });
                      }}
                      disabled={!isPasscodeEnabled}
                    />
                  </View>
                  <View style={styles.settingsCategoryItemOption}>
                    <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                      Fake notes are displayed to an intruder when incorrect pin is entered. <Text style={{color: '#03a9f4', fontWeight: 600}}>#YourPrivacyMatters</Text> 
                    </Text>
                  </View>
                
                </View>
            </View>

            <View style={styles.settingsCategoryItem}>
              <View>
              <View style={styles.settingsCategoryItemOption}>
                <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor }]}>
                  Cloud Backup
                </Text>
                <Switch
                  value={isCloudBackupEnabled}
                  onValueChange={(value) => {
                    checkIfUserisAuthenticated(() => {
                      setIsCloudBackupEnabled(value);
                      updateSettings('isCloudBackupEnabled', value);
                    });
                  }}
                />
              </View>
                  {isCloudBackupEnabled && (
                    <TouchableOpacity
                      style={{ padding: 10, alignItems: 'center', justifyContent: 'center', marginTop: 5, borderWidth: 1, borderColor: theme.primaryTextColor, borderRadius: 5 }}
                      onPress={() => navigation.navigate('Cloud')}
                    >
                      <Text style={[styles.settingsCategoryItemOptionText, { color: theme.primaryTextColor, fontSize: 12 }]}>
                        Backup & Restore.
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
            </View>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isThemeModalVisible}
            onRequestClose={() => setIsThemeModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: theme.secondaryBackgroundColor }]}>
                <Text style={[styles.modalTitle, { color: theme.primaryTextColor }]}>Choose App Theme</Text>
                <TouchableOpacity onPress={() => handleThemeSelection('Light')}>
                  <Text style={[styles.modalOption, { color: theme.primaryTextColor }]}>Light</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleThemeSelection('Dark')}>
                  <Text style={[styles.modalOption, { color: theme.primaryTextColor }]}>Dark</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleThemeSelection('System')}>
                  <Text style={[styles.modalOption, { color: theme.primaryTextColor }]}>System Default</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsThemeModalVisible(false)}>
                  <Text style={[styles.modalCancel, { color: 'red' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>)
  );
}
