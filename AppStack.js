import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import NotesScreen from './screens/NotesScreen';
import NoteEditorScreen from './screens/NoteEditorScreen';
import SettingsScreen from './screens/SettingsScreen';
import ViewNoteScreen from './screens/ViewNoteScreen';
import LockScreen from './screens/LockScreen';

const Stack = createStackNavigator();

export default function AppStack() {
    const screenOptions = ({ route, navigation }) => ({
        headerShown: false,
    });

    return (
        <Stack.Navigator>
            <Stack.Screen name="Lock" component={LockScreen} options={screenOptions} />
            <Stack.Screen name="Home" component={HomeScreen} options={screenOptions} />
            <Stack.Screen name="Notes" component={NotesScreen} options={screenOptions} />
            <Stack.Screen name="NoteEditor" component={NoteEditorScreen} options={screenOptions} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={screenOptions} />
            <Stack.Screen name="ViewNote" component={ViewNoteScreen} options={screenOptions} />
        </Stack.Navigator>
    );
}
