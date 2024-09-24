import { View, Text, Animated, StyleSheet, Dimensions, TouchableOpacity, TouchableHighlight, Image, TextInput } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { formatDate, getNotes } from '../functions/functions';
import { SwipeListView } from 'react-native-swipe-list-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { styles } from '../styles/styles';
import { SearchListView } from './HomeScreen';

const rowTranslateAnimatedValues = {};
Array(20)
    .fill('')
    .forEach((_, i) => {
        rowTranslateAnimatedValues[`${i}`] = new Animated.Value(1);
    });

export default function NotesScreen({ navigation, route }) {
  const { favorites } = route.params;
  const [notes, setNotes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  
  const { theme } = useTheme();

  useEffect(() => {
    const fetchNotes = async () => {
      const notes = await getNotes();
      if (favorites) {
        setNotes(notes.filter((note) => note.favorite));
        return;
      }
      setNotes(notes);
    };
    fetchNotes();
  }, [favorites]);

  const updateNotes = async (notes) => {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
        rowMap[rowKey].closeRow();
    }
  };

  const handleSearch = (text) => {
    const trimmedText = text.trim().toLowerCase();
    setSearchTerm(trimmedText);
    setIsSearching(trimmedText.length > 0);

    const filtered = notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(trimmedText);
      const contentMatch = note.content.toLowerCase().includes(trimmedText);
      return titleMatch || contentMatch;
    });

    setFilteredNotes(filtered);
  };

  const deleteRow = (rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
  
    const newData = notes.filter(note => note.noteKey !== rowKey);
    setNotes(newData);
    updateNotes(newData);
  };

  const animationIsRunning = useRef(false);

  const onSwipeValueChange = swipeData => {
    const { key, value } = swipeData;
    if (value < -Dimensions.get('window').width && !animationIsRunning.current) {
      animationIsRunning.current = true;
  
      Animated.timing(rowTranslateAnimatedValues[key], {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        const newData = notes.filter(note => note.noteKey !== key); // Filter using unique key
        setNotes(newData);
        updateNotes(newData);
        animationIsRunning.current = false;
      });
    }
  };

  const renderItem = (data) => (
    <TouchableHighlight
      onPress={() => navigation.navigate('NoteEditor', { noteKey: data.item.noteKey })}
      style={[styles.noteCard, { backgroundColor: theme.secondaryBackgroundColor }]}
      underlayColor={theme.secondaryBackgroundColor}
    >
      <View>
        <Text style={[styles.noteTitle, { color: theme.primaryTextColor, marginVertical: 4 }]}>{data.item.title}</Text>
        <Text
          style={[styles.noteText, { color: theme.secondaryTextColor, marginVertical: 4 }]}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {data.item.content.length > 0
            ? (data.item.content.length > 100 ? `${data.item.content.substring(0, 100)}...` : data.item.content)
            : <Text style={[styles.noteText, { color: theme.secondaryTextColor, marginVertical: 2 }]}>No content</Text>}
        </Text>
        <Text style={[styles.noteDate, { color: theme.secondaryTextColor, marginVertical: 2 }]}>{formatDate(data.item.date)}</Text>
      </View>
    </TouchableHighlight>
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={[styles.rowBack, { marginRight: 10 }]}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => closeRow(rowMap, data.item.noteKey)}
      >
        <Text style={styles.backTextWhite}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight, {
          borderBottomRightRadius: 10,
          borderTopRightRadius: 10,
        }]}
        onPress={() => deleteRow(rowMap, data.item.noteKey)}
      >
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.primaryBackgroundColor }]}>
      <View style={styles.homeHeaderSection}>
        <Text style={[styles.homeHeaderText, { color: theme.primaryTextColor, marginTop: 8 }]}>{favorites ? "Favorite Notes" : "Your Notes"}</Text>
      </View>
      <View style={[styles.searchSection, { paddingHorizontal: 5 }]}>
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

      {!isSearching ? (
        <SwipeListView
          style={{ marginTop: 2, padding: 10 }}
          data={notes}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
          onSwipeValueChange={onSwipeValueChange}
        />
      ) : (
        <SearchListView
          Notes={filteredNotes}
          openNote={(note) => navigation.navigate('NoteEditor', { noteKey: note })}
          theme={theme}
          formatDate={formatDate}
        />
      )}
    </View>
  );
}