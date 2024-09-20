import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './AppStack';
import { StatusBar, Platform } from 'react-native';

const App = () => {
  return (
    <>
      <NavigationContainer>
        <ThemeProvider>

          <AppStack />
        </ThemeProvider>
      </NavigationContainer>
    </>
  );
};

export default App;
