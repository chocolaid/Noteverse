import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet, TextInput, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { styles, fabStyles } from '../styles/styles';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import HomeScreenNotes from '../components/HomeScreenNotes';
import { getNotes, formatDate } from '../functions/functions';
import { auth } from '../firebaseConfig';

// Component for displaying search results
export const SearchListView = ({ Notes, openNote, theme, formatDate }) => {
  return (
    <View>
      {Notes.length > 0 ? (
        Notes.map((note) => (
          <TouchableOpacity key={note.id} onPress={() => openNote(note.noteKey)}>
            <View style={{ margin: 10 }}>
              <View
                style={{
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: theme.secondaryBackgroundColor,
                }}
              >
                <Text style={{ color: theme.primaryTextColor, fontWeight: 'bold', marginVertical: 5, fontSize: 16 }}>
                  {note.title}
                </Text>
                {note.content.trim().length > 0 ? (
                  <Text
                    style={[styles.noteText, { color: theme.secondaryTextColor, marginVertical: 2 }]}
                    numberOfLines={1}
                    ellipsizeMode='tail'
                  >
                    {note.content.length > 100 ? `${note.content.substring(0, 100)}...` : note.content}
                  </Text>
                ) : (
                  <Text style={[styles.noteText, { color: theme.secondaryTextColor, marginVertical: 2 }]}>No content</Text>
                )}
                <Text style={{ color: theme.secondaryTextColor, fontSize: 12, marginTop: 5 }}>
                  {formatDate(note.date)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.secondaryTextColor, margin: 25, textAlign: 'center', width: '100%' }}>
            No notes found
          </Text>
        </View>
      )}
    </View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const openNote = (note) => {
    navigation.navigate('NoteEditor', { noteKey: note });
  };

  const settingsScaleAnim = useRef(new Animated.Value(1)).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  const [isSearching, setSearching] = useState(false);
  const [Notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const isFocused = useIsFocused();

  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true);
        const notes = await getNotes();
        setNotes(notes);
        setFilteredNotes(notes);
      } catch (err) {
        setError('Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      loadNotes();
    }
  }, [isFocused]);

  const handleSearch = (text) => {
    const trimmedText = text.trim().toLowerCase();
    setSearchTerm(trimmedText);
    setSearching(trimmedText.length > 0);

    const filtered = Notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(trimmedText);
      const contentMatch = note.content.toLowerCase().includes(trimmedText);
      return titleMatch || contentMatch;
    });

    setFilteredNotes(filtered);
  };

  const fabStyles = StyleSheet.create({
    fabButton: {
      position: 'absolute',
      right: 20,
      bottom: 20,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      shadowColor: theme.primaryTextColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      backgroundColor: theme.primaryBackgroundColor,
      borderWidth: theme.primaryTextColor === '#000000' ? 0 : 1,
      borderColor: theme.primaryTextColor === '#000000' ? theme.primaryTextColor : null,
    },
    fabButtonText: {
      color: 'white',
      fontSize: 24,
      fontWeight: 'bold',
    },
  });

  const handlePress = (scaleAnim, rotate = false) => {
    const animations = [
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ];

    if (rotate) {
      animations.push(
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      );
    }

    Animated.sequence(animations).start(() => {
      if (rotate) {
        rotationAnim.setValue(0);
      }
    });
  };

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [70, 60],
    extrapolate: 'clamp',
  });

  const handleClick = (type) => {
    if (type === 'fab') {
      handlePress(fabScaleAnim);
      setTimeout(() => {
        navigation.navigate('NoteEditor', { newNote: true });
      }, 300);
    }

    if (type === 'settings') {
      handlePress(settingsScaleAnim, true);
      setTimeout(() => {
        navigation.navigate('Settings');
      }, 500);
    }
  };

  let parsedFilteredNotes = [];
  if (Array.isArray(filteredNotes)) {
    parsedFilteredNotes = filteredNotes;
  } else {
    try {
      parsedFilteredNotes = JSON.parse(filteredNotes);
      if (!Array.isArray(parsedFilteredNotes)) {
        parsedFilteredNotes = [];
      }
    } catch (e) {
      parsedFilteredNotes = [];
    }
  }

  const favoriteNotes = parsedFilteredNotes.filter((note) => note.favorite);
  const lastFiveNotes = [...parsedFilteredNotes].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);


  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: theme.primaryBackgroundColor, paddingTop: 5 }]}>
      <View style={styles.container}>
        <Animated.View style={[styles.homeHeaderSection, { height: headerHeight }]}>
          <Animated.Text style={[styles.homeHeaderText, { color: theme.primaryTextColor }]}>
            NoteVerse
          </Animated.Text>
          <TouchableOpacity onPress={() => handleClick('settings')}>
            <Animated.View style={{ transform: [{ scale: settingsScaleAnim }, { rotate: rotation }] }}>
              <Image
                source={require('../assets/images/settings.png')}
                style={{ height: 25, width: 25, tintColor: theme.primaryTextColor }}
              />
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.searchSection}>
          <View style={[styles.searchInputContainer, { backgroundColor: theme.secondaryBackgroundColor }]}>
            <Image
              source={require('../assets/images/search.png')}
              style={[styles.searchIcon, { tintColor: theme.secondaryTextColor }]}
            />
            <TextInput
              placeholder="Search"
              style={[styles.searchInput, { color: theme.secondaryTextColor }]}
              placeholderTextColor={theme.secondaryTextColor}
              cursorColor={theme.secondaryTextColor}
              selectionColor={theme.secondaryTextColor}
              onChangeText={handleSearch}
              value={searchTerm}
            />
          </View>
        </View>

        {isSearching ? (
          <SearchListView
            Notes={filteredNotes}
            openNote={openNote}
            theme={theme}
            formatDate={formatDate}
          />
        ) : (
          <HomeScreenNotes
            Notes={lastFiveNotes}
            theme={theme}
            lastFiveNotes={lastFiveNotes}
            favoriteNotes={favoriteNotes}
            formatDate={formatDate}
          />
        )}

        <TouchableOpacity
          style={[fabStyles.fabButton, { backgroundColor: theme.primaryBackgroundColor }]}
          onPress={() => handleClick('fab')}
        >
          <Animated.View style={{ transform: [{ scale: fabScaleAnim }] }}>
            <Image
              source={require('../assets/images/add.png')}
              style={{ height: 25, width: 25, tintColor: theme.primaryTextColor }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;