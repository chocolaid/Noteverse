import React from "react";
import {
  Text,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { launchImageLibrary } from 'react-native-image-picker';
import { TextInput } from "react-native-gesture-handler";
import { useTheme } from "../contexts/ThemeContext";

export default function NoteEditorScreen({navigation}) {
  const richText = React.useRef(null);
  const {theme, setTheme} = useTheme();

  const handleMediaPick = () => {
    const options = {
      mediaType: 'mixed',
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        if (response.assets[0].type.startsWith('image')) {
          richText.current.insertImage(source.uri);
        } else if (response.assets[0].type.startsWith('video')) {
          richText.current.insertVideo(source.uri);
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 10, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image source={require('../assets/images/back.png')} style={{ height: 25, width: 25, tintColor: theme.color, marginRight: 15, objectFit: 'contain' }} />
       </TouchableOpacity>
       <TextInput placeholder="Title" style={{ fontSize: 24, fontWeight: "bold", flex: 1 }} />
      </View>
      <ScrollView style={styles.scrollView}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <RichEditor
            ref={richText}
            onChange={(descriptionText) => {
              console.log("descriptionText:", descriptionText);
            }}
          />
        </KeyboardAvoidingView>
      </ScrollView>

      <RichToolbar
        editor={richText}
        iconTint={theme.color}
        style={{ backgroundColor: "#fff" }}
        actions={[
          
          actions.undo,
          actions.redo,
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.setStrikethrough,
          actions.insertLink,
          actions.code,
          actions.keyboard,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.checkboxList,
          actions.line,
          actions.insertImage,
          actions.insertVideo,
          actions.fontSize,

        ]}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

