import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { SwipeListView } from 'react-native-swipe-list-view';
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreenNotes = ({ Notes, favoriteNotes, theme, lastFiveNotes, formatDate }) => {
  const navigation = useNavigation();
  const [data, setData] = useState(lastFiveNotes);

  const openNote = (noteKey) => {
    navigation.navigate('NoteEditor', { noteKey });
  };

  const closeRow = (rowMap, rowKey) => {
    if (rowMap[rowKey]) {
      rowMap[rowKey].closeRow();
    }
  };

  const updateNotes = async (notes) => {
    await AsyncStorage.setItem('notes', JSON.stringify(notes));
  };

  const deleteRow = (rowMap, rowKey) => {
    closeRow(rowMap, rowKey);
    const newData = [...data];
    
    // Find the index using the correct property (noteKey or id)
    const noteIndex = newData.findIndex((item) => item.key.toString() === rowKey.toString());
    
    if (noteIndex >= 0) {
      newData.splice(noteIndex, 1);
      setData(newData);
      updateNotes(newData);
    }
  
    console.log('Data:', newData);
    console.log('Deleted index:', noteIndex);
  };
  
  

  const onSwipeValueChange = swipeData => {
    const { key, value } = swipeData;
    if (value < -Dimensions.get('window').width) {
      deleteRow(null, key);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity activeOpacity={1}
      style={[{ backgroundColor: theme.secondaryBackgroundColor }, styles.noteCard]}
      key={item.id}
      onPress={() => openNote(item.noteKey)}
    >
      <View>
        <Text style={[styles.noteTitle, { color: theme.primaryTextColor, marginVertical: 5 }]}>{item.title}</Text>
        {item.content.trim().length > 0 ? (
          <Text
            style={[styles.noteText, { color: theme.secondaryTextColor, marginVertical: 2 }]}
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
          </Text>
        ) : (
          <Text style={[styles.noteText, { color: theme.secondaryTextColor, marginVertical: 2 }]}>No content</Text>
        )}
        <Text style={[styles.noteDate, { color: theme.secondaryTextColor, marginVertical: 5 }]}>{formatDate(item.date)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHiddenItem = (data, rowMap) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnLeft]}
        onPress={() => closeRow(rowMap, data.item.key)}
      >
        <Text style={styles.backTextWhite}>Close</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight, {
          borderBottomRightRadius: 10,
          borderTopRightRadius: 10,
        }]}
        onPress={() => deleteRow(rowMap, data.item.key)}
      >
        <Text style={styles.backTextWhite}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <View style={styles.favoriteSection}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.favoriteSectionText, { color: theme.primaryTextColor }]}>Favorites</Text>
          
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {favoriteNotes.length > 0 ? (
            favoriteNotes.map((note) => (
              <TouchableOpacity activeOpacity={1} key={note.id} onPress={() => openNote(note.noteKey)}>
                <View style={{ margin: 10 }}>
                  <View
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      backgroundColor: theme.secondaryBackgroundColor,
                      width: 200,
                      minHeight: 110,
                    }}
                  >
                    <Text style={[styles.noteTitle, { color: theme.primaryTextColor, fontWeight: 'bold', marginVertical: 5 }]}>{note.title}</Text>
                    <View style={{flex: 1, justifyContent: 'center', marginBottom: 15, }}>
                     
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
                     </View>
                    <View style={{position: 'absolute', bottom: 10, marginLeft: 10}}>
                    <Text style={[styles.noteDate, { color: theme.secondaryTextColor, fontSize: 12, marginTop: 5 }]}>
                      {formatDate(note.date)}
                    </Text>
                    </View>
                    
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: theme.secondaryTextColor, margin: 20, textAlign: 'center', width: '100%' }}>You've not marked any notes as favorites</Text>
          )}
        </ScrollView>
      </View>
      <View style={[styles.noteSection, {flex: 1}]}>
        <View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[styles.favoriteSectionText, { color: theme.primaryTextColor, paddingBottom: 10}]}>Recents</Text>
          {Notes.length != 0 ? (
            <TouchableOpacity onPress={() => navigation.navigate('Notes', { favorites: false })}>
              <Text style={[styles.seeAllText, { color: theme.secondaryTextColor }]}>See all</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <SwipeListView
          style={{ flex: 1 }}
          data={lastFiveNotes}
          renderItem={renderItem}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-150}
          onSwipeValueChange={onSwipeValueChange}
          keyExtractor={(item) => item.key.toString()}
        />
      </View>
    </>
  );
};

export default HomeScreenNotes;