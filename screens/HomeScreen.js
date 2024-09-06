import React, { useRef } from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { styles } from '../styles/styles';
import { useTheme } from '../contexts/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();

  const settingsScaleAnim = useRef(new Animated.Value(1)).current;
  const fabScaleAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current; // Added rotation animation value

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
      // Reset rotation value after animation
      if (rotate) {
        rotationAnim.setValue(0);
      }
    });
  };

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Full rotation
  });

  return (
    <View style={[styles.container]}>
      <View style={styles.homeHeaderSection}>
        <Text style={[styles.homeHeaderText, { color: theme.color }]}>NoteVerse</Text>
        <TouchableOpacity onPress={() => handlePress(settingsScaleAnim, true)}>
          <Animated.View style={{ transform: [{ scale: settingsScaleAnim }, { rotate: rotation }] }}>
            <Image 
              source={require('../assets/images/settings.png')} 
              style={{ height: 30, width: 30, tintColor: theme.color }} 
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{height: "35%", display: 'flex', flexDirection: 'row', paddingVertical: 10}}>
          <View style={{backgroundColor: theme.color, flexGrow: 0.95, backgroundColor: theme.color, borderRadius: 12, marginHorizontal: 6, justifyContent: 'center', alignItems: 'center', elevation: 2,}}>
            <Text style={{ color: "white", fontWeight: '700', fontSize: 18 }}>All Notes</Text>
            <Text style={{ color: "white", fontWeight: '600', fontSize: 16 }}>0</Text>
          </View>
          <TouchableOpacity>
           <View style={{backgroundColor: theme.color, flexGrow: 1.1, backgroundColor: '#ebebeb', borderRadius: 12, marginHorizontal: 6, justifyContent: 'center', alignItems: 'center', elevation: 2}}>
            <Text style={{ color: theme.color, fontWeight: '700', fontSize: 18 }}>Favourites</Text>
            <Text style={{ color: theme.color, fontWeight: '600', fontSize: 16 }}>0</Text>
          </View>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={{ color: theme.color }}>Notes will be displayed here</Text>
        </View>
      </View>
      <TouchableOpacity 
        onPressIn={() => navigation.navigate('NoteEditor')}
        style={[fabStyles.fabButton, { backgroundColor: theme.color }]} 
        onPress={() => handlePress(fabScaleAnim)}
      >
        <Animated.View style={{ transform: [{ scale: fabScaleAnim }] }}>
          <Text style={fabStyles.fabButtonText}>+</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
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
  },
  fabButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
