import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PinCodeComponent = ({ mode = 'authenticate', onSuccess, onError }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState(null);
  const [isPinSet, setIsPinSet] = useState(false);

  useEffect(() => {
    (async () => {
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
      } else {
        onError && onError('Incorrect PIN');
      }
    } else if (mode === 'setup') {
      await AsyncStorage.setItem('pin', pin);
      setStoredPin(pin);
      setIsPinSet(true);
      onSuccess && onSuccess();
    } else if (mode === 'remove') {
      await AsyncStorage.removeItem('pin');
      setStoredPin(null);
      setIsPinSet(false);
      onSuccess && onSuccess();
    }
    setPin('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        {mode === 'authenticate'
          ? 'Enter your PIN to Authenticate'
          : mode === 'setup'
          ? 'Set up a new PIN'
          : 'Remove your PIN'}
      </Text>
      <TextInput
        style={styles.input}
        value={pin}
        onChangeText={setPin}
        placeholder="Enter PIN"
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
      />
      <Button
        title={mode === 'authenticate' ? 'Authenticate' : mode === 'setup' ? 'Set PIN' : 'Remove PIN'}
        onPress={handlePinSubmit}
        disabled={pin.length !== 4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 18,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '80%',
    marginBottom: 20,
    borderRadius: 5,
    textAlign: 'center',
  },
});

export default PinCodeComponent;
