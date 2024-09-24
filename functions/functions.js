import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SharedPreferences from 'react-native-shared-preferences';
import { dummyNotes } from "./dummyNotes";

async function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const getNotes = async () => {
  try {
      let notes = [];

      if (Platform.OS === 'android') {
          const migrationDone = await AsyncStorage.getItem('migrationDone');

          if (!migrationDone) {
              const existingNotesString = await AsyncStorage.getItem('notes');
              let existingNotes = existingNotesString ? JSON.parse(existingNotesString) : [];

              // Retrieve notes from SharedPreferences
              SharedPreferences.getItem('Notes', async (value) => {
                  if (value) {
                      try {
                          const oldNotesList = JSON.parse(value);
                          const newNotesList = await Promise.all(oldNotesList.map(async (oldNote, index) => ({
                              content: oldNote.Note,
                              date: new Date(),
                              favorite: oldNote.Important === 'True',
                              id: existingNotes.length + index + 1,
                              key: existingNotes.length + index + 1,
                              noteKey: await randomString(10),
                              title: oldNote.Title || 'No title',
                          })));

                          // Combine existing notes with migrated notes
                          const allNotes = [...existingNotes, ...newNotesList];

                          // Save the combined notes back to AsyncStorage
                          await AsyncStorage.setItem('notes', JSON.stringify(allNotes));
                          console.log('Notes migrated and combined successfully!');

                          // Mark migration as done
                          await AsyncStorage.setItem('migrationDone', 'true');
                      } catch (jsonError) {
                          console.error('Error parsing SharedPreferences notes:', jsonError);
                      }
                  }
              });
          }
      }

      const intruding = await AsyncStorage.getItem('Intruding');
      if (intruding === 'true') {
          notes = JSON.stringify(dummyNotes);
      } else {
          const notesFromStorage = await AsyncStorage.getItem('notes');
          console.log('notesFromStorage', notesFromStorage); // Debugging line
          notes = notesFromStorage ? JSON.parse(notesFromStorage) : [];
      }

      console.log('notes', notes);
      return notes || []; // Return notes directly
  } catch (error) {
      console.error('Error getting notes:', error);
  }
  return [];
};


const formatDate = (dateString) => {
    const noteDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - noteDate; // Difference in milliseconds

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

export { getNotes, formatDate };
