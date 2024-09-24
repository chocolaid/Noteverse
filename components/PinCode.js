import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';


const PinCodeComponent = ({ mode = 'authenticate', onSuccess, onError }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [storedPin, setStoredPin] = useState(null);
  const [isLockTrickeryEnabled, setIsLockTrickeryEnabled] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  const { theme } = useTheme();

  useEffect(() => {
    (async () => {
      const fetchSettings = async () => {
        try {
          const storedSettings = await AsyncStorage.getItem('settings');
          if (storedSettings) {
            const parsedSettings = JSON.parse(storedSettings);
            setIsLockTrickeryEnabled(parsedSettings.isLockTrickeryEnabled);
          }
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      }

      fetchSettings();

      const savedPin = await AsyncStorage.getItem('pin');
      
      if (savedPin) {
        setStoredPin(savedPin);
        setIsPinSet(true);
      }
    })();
  }, []);

  const handlePinSubmit = async () => {
    if (mode === 'authenticate') {
      if (storedPin === pin) {
        onSuccess && onSuccess();
        AsyncStorage.setItem('Intruding', 'false');
      } else {
        if (!isLockTrickeryEnabled) {
          onError && onError('Incorrect PIN');
          animateShake();
        }else{
          AsyncStorage.setItem('Intruding', 'true');
          onSuccess();
        }
        
      }
    } else if (mode === 'setup') {
      if (!isConfirming) {
        setIsConfirming(true);
        setConfirmPin(pin);
        setPin('');
      } else {
        if (pin === confirmPin) {
          await AsyncStorage.setItem('pin', pin);
          setStoredPin(pin);
          setIsPinSet(true);
          setIsConfirming(false);
          onSuccess && onSuccess();
        } else {
          animateShake();
          onError && onError('PINs do not match. Please try again.');
          setPin('');
          setIsConfirming(false);
        }
      }
    } else if (mode === 'remove') {
      if (isPinSet) {
        await AsyncStorage.removeItem('pin');
        setStoredPin(null);
        setIsPinSet(false);
        onSuccess && onSuccess();
      } else {
        onError && onError('No PIN set to remove.');
      }
    }
    setPin('');
  };

  const animateShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const renderButton = (value) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        if (value === '←') {
          setPin((prev) => prev.slice(0, -1));
        } else {
          setPin((prev) => (prev.length < 4 ? prev + value : prev));
        }
      }}
    >
      <Text style={styles.buttonText}>{value}</Text>
    </TouchableOpacity>
  );
  const randomColorHex = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    header: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 40,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 50,
    },
    dot: {
      width: 15,
      height: 15,
      borderRadius: 15 / 2,
      marginHorizontal: 10,
      backgroundColor: theme.secondaryBackgroundColor,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
    },
    button: {
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.secondaryBackgroundColor,
      margin: 10,
      borderRadius: 40,
    },
    emptyButton: {
      width: 80,
      height: 80,
      margin: 10,
      borderRadius: 40,
    },
    buttonText: {
      fontSize: 28,
      color: theme.primaryTextColor,
    },
    submitButton: {
      marginTop: 20,
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 30,
    },
    submitButtonText: {
      color: theme.primaryTextColor,
      fontSize: 18,
    },
  });
  return (
    <View style={[styles.container, {backgroundColor: theme.primaryBackgroundColor}]}>
      <Text style={[styles.header, {color: theme.primaryTextColor}]}>
        {mode === 'authenticate'
          ? 'Enter your PIN to Authenticate'
          : mode === 'setup'
          ? isConfirming ? 'Confirm your new PIN' : 'Set up a new PIN'
          : isPinSet ? 'Remove your PIN' : 'No PIN to remove'}
      </Text>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnimation }] }]}>
          {Array.from({ length: 4 }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: pin.length > index ? '#333' : '#ccc',
                },
              ]}
            />
          ))}
        </Animated.View>
      </TouchableWithoutFeedback>
      <View style={styles.buttonRow}>
        {renderButton('1')}
        {renderButton('2')}
        {renderButton('3')}
      </View>
      <View style={styles.buttonRow}>
        {renderButton('4')}
        {renderButton('5')}
        {renderButton('6')}
      </View>
      <View style={styles.buttonRow}>
        {renderButton('7')}
        {renderButton('8')}
        {renderButton('9')}
      </View>
      <View style={styles.buttonRow}>
        <View style={styles.emptyButton} />
        {renderButton('0')}
        {renderButton('←')}
      </View>
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: (pin.length === 4 )?   randomColorHex() : theme.secondaryBackgroundColor }]}
        onPress={handlePinSubmit}
        disabled={pin.length !== 4 || (mode === 'setup' && isPinSet && !isConfirming)}
      >
        <Text style={[styles.submitButtonText, {color: pin.length === 4 ? 'white' : theme.primaryTextColor}]}>
          {mode === 'authenticate' 
            ? 'Authenticate' 
            : mode === 'setup' 
            ? isConfirming ? 'Confirm PIN' : 'Set PIN' 
            : 'Remove PIN'}
            
        </Text>
      </TouchableOpacity>
    </View>
  );

};



export default PinCodeComponent;
