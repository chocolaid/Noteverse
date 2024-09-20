import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
  Modal,
  StyleSheet,
  Dimensions,
  Image,
  ScrollView
} from "react-native";

const CustomBottomSheet = ({ visible, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(2); // Default selection is 'Body'
  const translateY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        translateY.setOffset(translateY.__getValue());
        translateY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 100) {
          Animated.timing(translateY, {
            toValue: Dimensions.get('window').height,
            duration: 300,
            useNativeDriver: false,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (scrollViewRef.current && selectedIndex !== null) {
      scrollViewRef.current.scrollTo({ x: selectedIndex * 80 - 100, animated: true }); // Adjust the scroll position
    }
  }, [selectedIndex]);

  const handleSelect = (index) => {
    setSelectedIndex(index);
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: translateY }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Format</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image source={require('../assets/images/close.png')} style={styles.closeButtonIcon}/>
            </TouchableOpacity>
          </View>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            {['Heading', 'SubHeading', 'Body', 'Monostyled'].map((item, index) => (
              <TouchableOpacity
                key={item}
                onPress={() => handleSelect(index)}
                style={[
                  styles.textSizeBg,
                  {
                    backgroundColor: selectedIndex === index ? '#f7b705' : '#ffffff',
                    borderColor: selectedIndex === index ? '#f7b705' : 'transparent',
                    borderWidth: 0,
                    transform: [{ scale: selectedIndex === index ? 1.005 : 1 }],
                  }
                ]}
              >
                <Text style={[
                  styles.text,
                  // Apply different styles based on the selected index
                  {
                    fontSize: index === 0 ? 22 : index === 1 ? 19 : index === 2 ? 16 : 14, // Font sizes for Heading, SubHeading, Body, Monostyled
                    fontWeight: index === 0 ? 'bold' : index === 1 ? '600' : index === 2 ? '400' : '300', // Font weights for different items
                    fontFamily: index === 0 ? 'Arial-BoldMT' : index === 1 ? 'ArialMT' : index === 2 ? 'TimesNewRoman' : 'CourierNew' // Font families
                  }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    width: '100%',
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.84,
    elevation: 2,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 100,
    alignSelf: 'flex-end',
  },
  closeButtonIcon: {
    height: 12,
    width: 12,
    tintColor: '#525252',
  },
  scrollViewContent: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  textSizeBg: {
    padding: 7,
    borderRadius: 8,
    height: 40,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default CustomBottomSheet;
