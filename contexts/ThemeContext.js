import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { StatusBar } from 'expo-status-bar'; // Expo status bar

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [statusBarColor, setStatusBarColor] = useState('#ffffff');
  const [statusBarStyle, setStatusBarStyle] = useState('dark');

  const themes = {
    light: {
      primaryBackgroundColor: '#FFFFFF',
      secondaryBackgroundColor: '#F2F2F2',
      primaryTextColor: '#000000',
      secondaryTextColor: '#888888',
      statusBarColor: '#FFFFFF',
      imageTintColor: '#666666',
      inputFieldHintColor: '#AAAAAA',
    },
    dark: {
      primaryBackgroundColor: '#000000',
      secondaryBackgroundColor: '#1a1a1a',
      primaryTextColor: '#ffffff',
      secondaryTextColor: '#f2f2f2',
      statusBarColor: '#000000',
      imageTintColor: '#cccccc',
      inputFieldHintColor: '#777777',
    },
    // Other themes...
  };

  const getSystemTheme = () => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark' ? themes.dark : themes.light;
  };

  useEffect(() => {
    const loadThemeFromStorage = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        setTheme(savedTheme || 'system');
      } catch (error) {
        console.error('Failed to load theme from storage', error);
        setTheme('system');
      }
    };

    loadThemeFromStorage();

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        const currentTheme = colorScheme === 'dark' ? themes.dark : themes.light;
        setStatusBarColor(currentTheme.statusBarColor);
        setStatusBarStyle(colorScheme === 'dark' ? 'light' : 'dark');
      }
    });

    return () => subscription.remove();
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') {
      setStatusBarColor(themes[theme].statusBarColor);
      setStatusBarStyle(theme === 'dark' ? 'light' : 'dark');
    }
  }, [theme]);

  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
      setStatusBarColor(themes[newTheme].statusBarColor);
      setStatusBarStyle(newTheme === 'dark' ? 'light' : 'dark');
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  };

  const themeValue = theme === 'system' ? getSystemTheme() : themes[theme];

  return (
    <ThemeContext.Provider value={{ theme: themeValue, setTheme: changeTheme }}>
      <StatusBar style={statusBarStyle} backgroundColor={statusBarColor} />
      {children}
    </ThemeContext.Provider>
  );
};
