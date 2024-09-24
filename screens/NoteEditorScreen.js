import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Keyboard,
  Share,
} from 'react-native';
import RNFS from 'react-native-fs';
import { SF } from '../components/Francisco';
import {
  RichText,
  Toolbar,
  useEditorBridge,
  TenTapStartKit,
  CoreBridge,
  LinkBridge,
  DEFAULT_TOOLBAR_ITEMS,
} from '@10play/tentap-editor';
import { useTheme } from '../contexts/ThemeContext';
import debounce from 'lodash.debounce';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { styles } from '../styles/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export default function NoteEditorScreen({ navigation, route }) {
  let { newNote, noteKey } = route.params;
  const { theme, setTheme } = useTheme();
  const [content, setContent] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [html, setHtml] = useState('');
  const [title, setTitle] = useState('');
  const [key, setKey] = useState(noteKey || '');
  const [favorite, setFavorite] = useState(false);
  const cameraPng = require('../assets/images/camera.png');
  const [isIntruding, setIsIntruding] = useState(false);

  const favoriteImages = {
    favourite: require('../assets/images/bookmarked.png'),
    notFavourite: require('../assets/images/bookmark.png'),
  };
  const customFont = `
    ${SF}
    * {
        font-family: 'SF Pro Display';
        padding-left: 1px;

        color: ${theme.primaryTextColor};  /* Dynamic text color */
        background-color: ${theme.primaryBackgroundColor}; /* Dynamic background color */
    }
        img {
        margin-right: 10px;
}
        img {
        user-select: none; /* Prevents the image from being selected */
}
        img:selected {
        border: none;
        outline: none;
}
    code {
        background-color: ${theme.secondaryBackgroundColor}; /* Dynamic background color */
        padding: 5px;
        border-radius: 5px;
        font-family: 'Courier New';
        color: ${theme.primaryTextColor}; /* Dynamic text color */
    }
  `;

  useEffect(() => {
    const fetchInitialContent = async () => {
      try {
        const notes = JSON.parse(await AsyncStorage.getItem('notes')) || [];
        const note = notes.find((note) => note.noteKey === key);
        if (note) {
          setInitialContent(note.content || ''); 
          

        }
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchInitialContent();
  }, [key]);


  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    onChange: () => {
      handleContentChange();
    },
    initialContent,
    bridgeExtensions: [
      ...TenTapStartKit,
      CoreBridge.configureCSS(customFont),
      LinkBridge.configureExtension({ openOnClick: false }),
    ],
  });

  useEffect(() => {
    const fetchIntruding = async () => {
      try {
        const intruding = await AsyncStorage.getItem('Intruding');
        if (intruding === 'true') {
          setIsIntruding(true);
        }
      }
      catch (error) {
        console.error('Error fetching intruding:', error);
      }
    }
    fetchIntruding();
  }, [isIntruding])

  // Load existing note if not a new note
  useEffect(() => {
    const loadNote = async () => {
      if (!newNote && key) {
        const notes = await AsyncStorage.getItem('notes');
        const parsedNotes = notes ? JSON.parse(notes) : [];
        const loadedNote = parsedNotes.find((note) => note.noteKey === key);
        if (loadedNote) {
          setTitle(loadedNote.title);
          setHtml(loadedNote.html);
          console.log('Before: ', favorite);
          setFavorite(loadedNote.favorite);
          console.log('Loaded favorite:', loadedNote.favorite);
          editor.setContent(loadedNote.html);
        }
      }
    };
    loadNote();
  }, [newNote, key]);

  const EditNote = async (title, html, key, favorite) => {
    if (!isIntruding) {
    console.log('received edit:', title, html, key, favorite);
    const notes = await AsyncStorage.getItem('notes');
    const parsedNotes = notes ? JSON.parse(notes) : [];
    const content = await parseHtml(html);
    const updatedNotes = parsedNotes.map((note) => {
      if (note.noteKey === key) {
        return { ...note, title, html, favorite: favorite, content: content, date: new Date() };
      }
      return note;
    });
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    console.log('Note updated:', updatedNotes);
  }
  };

  async function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async function parseHtml(html) {
    let parsedText = html.replace(/<img[^>]*>/g, '[image]').replace(/<\/?[^>]+(>|$)/g, '');
    return parsedText.trim();
  }

  const CreatNote = async () => {
    if (!isIntruding) {
    const notes = await AsyncStorage.getItem('notes');
    const parsedNotes = notes ? JSON.parse(notes) : [];
    const key = await randomString(10);
    setKey(key);
    const id = parsedNotes.length + 1;
    let defaultNote = { title: title || 'Untitled', content: content, html, date: new Date(), id: id, noteKey: key, favorite: favorite, key: id };
    console.log('defaultNote:', defaultNote);
    if (notes) {
      const updatedNotes = [...parsedNotes, defaultNote];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    } else {
      await AsyncStorage.setItem('notes', JSON.stringify([defaultNote]));
    }
  }
  };

  const handleContentChange = useCallback(
    debounce(async () => {
      try {
        const htmlContent = await editor.getHTML();
        setHtml(htmlContent);

        console.log('Editor HTML content:', htmlContent);

        if (key) {
          await EditNote(title || 'Untitled', htmlContent, key, favorite);
        }
      } catch (error) {
        console.error('Failed to get editor content:', error);
      }
    }, 500),
    [editor, title, key, newNote, favorite]
  );

  const handleCameraPress = useCallback(async () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            launchCamera({ mediaType: 'photo' }, async (response) => {
              if (response.assets) {
                const imageUri = response.assets[0].uri;
                const base64Image = await RNFS.readFile(imageUri, 'base64');
                console.log('Image from camera:', base64Image);
                const editorState = editor.getEditorState();
                editor.setImage(`data:image/jpeg;base64,${base64Image}`);
                editor.setSelection(
                  editorState.selection.from,
                  editorState.selection.from
                );
                editor.focus();
              }
            });
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary({ mediaType: 'photo' }, async (response) => {
              if (response.assets) {
                console.log('Image from gallery:', response.assets[0]);
                const imageUri = response.assets[0].uri;

                const base64Image = await RNFS.readFile(imageUri, 'base64');
                console.log('Image from Gallery:', base64Image);
                const editorState = editor.getEditorState();
                editor.setImage(`data:image/jpeg;base64,${base64Image}`);
                editor.setSelection(
                  editorState.selection.from,
                  editorState.selection.from
                );
                editor.focus();
              }
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  }, []);

  const favoriteMgr = () => {
    
    const newFavorite = !favorite;
    setFavorite(newFavorite);
    console.log('Favorite toggled:', newFavorite);
    if (key) {
      EditNote(title || 'Untitled', html, key, newFavorite);
    }
  };

  useEffect(() => {
    const saveNote = async () => {
      try {
        if (newNote && !key) {
          await CreatNote();
        } else if (!newNote && key) {
          await EditNote(title || 'Untitled', html, key, favorite);
        }
      } catch (error) {
        console.error('Error saving note:', error);
      }
    };

    saveNote();
  }, [html, title, key, newNote, favorite]);

  useEffect(() => {
    if (key) {
      EditNote(title || 'Untitled', html, key, favorite);
    }
  }, [title]);

  async function ExportNoteDialog() {
    Alert.alert(
      'Export Note',
      'Choose an option',
      [
        {
          'text': 'Share as Text',
          'onPress': () => ExportAsText(),
        },
        {
          'text': 'Share as PDF',
          'onPress': () => ExportAsPDF(),
        },
        {
          'text': 'Cancel',
          'style': 'cancel',
        },
        
      ],
      { cancelable: true }
    );
  }

  async function ExportAsText() {
    const content = await editor.getHTML();
    const text = await parseHtml(content);
    console.log('Text:', text);
    await Share.share({
      message: text,
    });
  }

  async function ExportAsPDF() {
    const content = await editor.getHTML();
    const filePath = await HTMLtoPDF(content);
    console.log('PDF file path:', filePath);
    await Share.share({
      url: `file://${filePath}`,
    });
  }

  async function HTMLtoPDF(content) {
    const options = {
      html: content,
      fileName: 'note',
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    console.log(file.filePath);
    return file.filePath;
  }



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.primaryBackgroundColor }]}>
      <View style={[styles.noteEditorHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require('../assets/images/back.png')}
            style={{ height: 25, width: 25, tintColor: theme.imageTintColor, marginRight: 15 }}
          />
        </TouchableOpacity>
        <TextInput
          placeholder="Title"
          style={{
            color: theme.primaryTextColor,
            fontSize: 24,
            fontWeight: 'bold',
            flex: 1,
          }}
          placeholderTextColor={theme.inputFieldHintColor}
          onChangeText={setTitle}
          value={title}
        />
        <TouchableOpacity onPress={() => favoriteMgr()}>
          <Image
            source={favorite ? favoriteImages.favourite : favoriteImages.notFavourite} // Dynamically change the icon
            style={{ height: 25, width: 25, tintColor: theme.imageTintColor, marginRight: 20 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => ExportNoteDialog()}>
        <Image
          source={require('../assets/images/export.png')}
          style={{ height: 25, width: 25, tintColor: theme.imageTintColor, marginRight: 10 }}
        />
        </TouchableOpacity>
      </View>
      <RichText
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowingReadAccessToURL={'file://'}
        theme={theme}
        allowsLinkPreview={true}
        editor={editor}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Toolbar
          items={[
            {
              onPress: () => handleCameraPress,
              active: () => false,
              disabled: () => false,
              image: () => cameraPng,
            },
            ...DEFAULT_TOOLBAR_ITEMS,
          ]}
          editor={editor}
          theme={theme}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}