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
      secondaryBackgroundColor: '#f2f2f2',
      primaryTextColor: '#000000',
      secondaryTextColor: '#888888',
      statusBarColor: '#FFFFFF',
      imageTintColor: '#666666',
      inputFieldHintColor: '#AAAAAA',
      name: 'Light',
    },
    dark: {
      primaryBackgroundColor: '#000000',
      secondaryBackgroundColor: '#1a1a1a',
      primaryTextColor: '#ffffff',
      secondaryTextColor: '#E8E8E8',
      statusBarColor: '#000000',
      imageTintColor: '#cccccc',
      inputFieldHintColor: '#777777',
      name: 'Dark',
    },
    system: {
      primaryBackgroundColor: Appearance.getColorScheme() === 'dark' ? '#000000' : '#FFFFFF',
      secondaryBackgroundColor: Appearance.getColorScheme() === 'dark' ? '#1a1a1a' : '#E8E8E8',
      primaryTextColor: Appearance.getColorScheme() === 'dark' ? '#ffffff' : '#000000',
      secondaryTextColor: Appearance.getColorScheme() === 'dark' ? '#E8E8E8' : '#888888',
      statusBarColor: Appearance.getColorScheme() === 'dark' ? '#000000' : '#FFFFFF',
      imageTintColor: Appearance.getColorScheme() === 'dark' ? '#cccccc' : '#666666',
      inputFieldHintColor: Appearance.getColorScheme() === 'dark' ? '#777777' : '#AAAAAA',
      name: 'System',
    },
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
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      setStatusBarColor(themes[theme].statusBarColor);
      setStatusBarStyle(theme === 'dark' ? 'light' : 'dark');
    } else {
      const systemTheme = getSystemTheme();
      setStatusBarColor(systemTheme.statusBarColor);
      setStatusBarStyle(Appearance.getColorScheme() === 'dark' ? 'light' : 'dark');
    }
  }, [theme]);

  const changeTheme = async (newTheme) => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setTheme(newTheme);
      if (newTheme !== 'system') {
        setStatusBarColor(themes[newTheme].statusBarColor);
        setStatusBarStyle(newTheme === 'dark' ? 'light' : 'dark');
      } else {
        const systemTheme = getSystemTheme();
        setStatusBarColor(systemTheme.statusBarColor);
        setStatusBarStyle(Appearance.getColorScheme() === 'dark' ? 'light' : 'dark');
      }
    } catch (error) {
      console.error('Failed to save theme to storage', error);
    }
  };

  const themeValue = theme === 'system' ? getSystemTheme() : themes[theme];

  return (
    <ThemeContext.Provider value={{ theme: themeValue, setTheme: changeTheme }}>
      <StatusBar style={statusBarStyle} backgroundColor={statusBarColor} />
      {console.log('Theme:', themeValue)}
      {children}
    </ThemeContext.Provider>
  );
};