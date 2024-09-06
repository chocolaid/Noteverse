import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance, Platform, StatusBar } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [statusBarColor, setStatusBarColor] = useState('#ffffff');

  const themes = {
    light: { 
      backgroundColor: '#ffffff', 
      color: '#000000',
      statusBarColor: '#ffffff',
    },
    dark: { 
      backgroundColor: '#000000', 
      color: '#ffffff',
      statusBarColor: '#000000',
    },
    dimmed: { 
      backgroundColor: '#2c2c2c', 
      color: '#d3d3d3',
      statusBarColor: '#000000',
    },
    purple: { 
      backgroundColor: '#394DAC', 
      color: '#394dac',
      statusBarColor: '#ffffff',
      textColor: "#394dac"
    },
    orange: { 
      backgroundColor: '#ffa500', 
      color: '#000000',
      statusBarColor: '#ffffff',
    },
    pink: { 
      backgroundColor: '#FF5E2A', 
      color: '#000000',
      statusBarColor: '#ffffff',
    },
  };

  const getSystemTheme = () => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark' ? themes.dark : themes.light;
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
        } else {
          // Default to system theme if no theme is saved
          setTheme('system');
        }
      } catch (error) {
        console.error('Failed to load theme from storage', error);
        setTheme('system');
      }
    };

    loadTheme();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        const currentTheme = colorScheme === 'dark' ? themes.dark : themes.light;
        setStatusBarColor(currentTheme.statusBarColor);
      }
    });

    return () => subscription.remove();
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      setStatusBarColor(themes[theme].statusBarColor);
    }
  }, [theme]);

  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
      // Update status bar color immediately when theme changes
      setStatusBarColor(themes[newTheme].statusBarColor);
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  };

  const value = {
    theme: theme === 'system' ? getSystemTheme() : themes[theme],
    setTheme: changeTheme,
  };

  return (
    <>
      
      <ThemeContext.Provider value={value}>
        <StatusBar 
        backgroundColor={statusBarColor} // Set the status bar color
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} // Adjust text color
      />
        {children}
      </ThemeContext.Provider>
    </>
  );
};
