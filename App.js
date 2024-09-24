import React, { useEffect, useRef } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationContainer, useNavigationState } from '@react-navigation/native';
import AppStack from './AppStack';
import { StatusBar, Platform, KeyboardAvoidingView, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef, navigate } from './rootNavigation';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

import { enableSecureView, disableSecureView, forbidAndroidShare, allowAndroidShare } from 'react-native-prevent-screenshot-ios-android';

const App = () => {
  const timer = useRef(null);
  const autoLockTime = useRef(1); // Default to 1 minute
  const appState = useRef(AppState.currentState);
  const isPasscodeEnabled = useRef(false);


  // To track the active route
  const getActiveRouteName = (state) => {
    if (!state || !state.routes) return null;
    const route = state.routes[state.index];
    return route?.name;
  };

  // Check whether we're on LockScreen or EditorScreen
  const isScreenToPauseTimer = (routeName) => {
    return routeName === 'Lock' || routeName === 'NoteEditor';
  };
  

  const fetchSettings = async () => {
    const settings = await AsyncStorage.getItem('settings');
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      // Handle screenshot blocking
      if (parsedSettings.isBlockingScreenshots) {
        if (Platform.OS === 'ios') {
          disableSecureView();
        } else {
          forbidAndroidShare();
        }
      } else {
        if (Platform.OS === 'ios') {
          enableSecureView();
        } else {
          allowAndroidShare();
        }
      }
      // Handle auto-lock settings
      isPasscodeEnabled.current = parsedSettings.isPasscodeEnabled || false;
      if (parsedSettings.isAutoLockEnabled) {
        const storedAutoLockTime = parseInt(parsedSettings.autoLockTime, 10);
        autoLockTime.current = !isNaN(storedAutoLockTime) && storedAutoLockTime > 0 
          ? storedAutoLockTime 
          : 1; // Fallback to 1 minute
        startAutoLockTimer(autoLockTime.current);
      }
    }
  };

  const startAutoLockTimer = (minutes) => {
    const timeout = minutes * 60 * 1000; // Convert to milliseconds
    clearTimeout(timer.current); // Clear any existing timer
    timer.current = setTimeout(() => {
      const currentRoute = getActiveRouteName(navigationRef.current?.getRootState());
      if (!isScreenToPauseTimer(currentRoute)) {
        // Only navigate to Lock screen if we're not already on Lock or Editor
        console.log('Auto-lock triggered');
        navigationRef.current?.navigate('Lock', { mode: 'authenticate' });
      }
    }, timeout);
  };
  

  useEffect(() => {
    fetchSettings();

    const handleAppStateChange = (nextAppState) => {
      const currentRoute = getActiveRouteName(navigationRef.current?.getRootState());
      if (isScreenToPauseTimer(currentRoute)) {
        // Stop the timer on LockScreen or EditorScreen
        clearTimeout(timer.current);
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to foreground
        if (isPasscodeEnabled.current) {
          console.log('App moved to foreground: trigger lock if needed');
          if (isPasscodeEnabled.current){
            navigationRef.current?.navigate('Lock', { mode: 'authenticate' });
          }
          
        } else {
          // Restart timer if passcode is disabled
          fetchSettings();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App moves to background, stop timer
        clearTimeout(timer.current);
      }
      appState.current = nextAppState; // Update app state
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      clearTimeout(timer.current);
      subscription.remove(); // Cleanup listener on unmount
    };
  }, []);

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <ThemeProvider>
          <KeyboardAvoidingView style={{ flex: 1 }}>
            <AppStack />
          </KeyboardAvoidingView>
        </ThemeProvider>
      </NavigationContainer>
    </>
  );
};

export default App;
