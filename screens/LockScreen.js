import React, { useState, useEffect } from 'react';
import PinCodeComponent from '../components/PinCode';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LockScreen = ({ route, navigation }) => {
  const [lockMode, setLockMode] = useState(route?.params?.mode || undefined);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('settings');
        if (storedSettings) {
          const parsedSettings = JSON.parse(storedSettings);
          console.log('parsedSettings:', parsedSettings);
          if (parsedSettings.isPasscodeEnabled && !lockMode) {
            console.log('Passcode is enabled, setting lock mode to authenticate');
            setLockMode('authenticate');
          } else if (!parsedSettings.isPasscodeEnabled && !lockMode) {
            // No passcode and no lockMode, navigate to Home
            navigation.navigate('Home');
          }
        } else {
          navigation.navigate('Home');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        navigation.navigate('Home');
      }
    };

    if (!lockMode) {
      fetchSettings();
    }
  }, [lockMode, navigation]); 
  if (!lockMode) {
    console.log('Lock mode not set, returning null');
    return null;
  }

  return (
    <PinCodeComponent mode={lockMode} onSuccess={() => navigation.navigate('Home')} />
  );
};

export default LockScreen;
