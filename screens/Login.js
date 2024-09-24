import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Image, TouchableOpacity, Modal, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import LottieView from 'lottie-react-native';
import { modalStyles } from '../styles/login';
import { getDatabase, ref, set } from 'firebase/database';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const { theme } = useTheme();
  const [isErrorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isFullNameVisible, setIsFullNameVisible] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        AsyncStorage.setItem('isAuthenticated', 'true');
        navigation.navigate('Home');
      } else {
        console.log('User is logged out');
      }
    });
    return unsubscribe;
  }, [auth, navigation]);

  const loading = () => setModalVisible(true);
  const hideModal = () => setModalVisible(false);
  const showErrorModal = (message) => {
    setErrorMessage(message);
    setErrorModalVisible(true);
  };
  const hideErrorModal = () => {
    setErrorModalVisible(false);
    setErrorMessage('');
  };

  const handleLogin = async () => {
    loading();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      hideModal();
    } catch (error) {
      hideModal();
      showErrorModal(error.message);
    }
  };

  const handleCreateAccount = async () => {
    loading();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const db = getDatabase();
      const userRef = ref(db, 'users/noteverse/' + auth.currentUser.uid);
      set(userRef, {
        fullName,
        email,
        password,
        uid: auth.currentUser.uid,
        accountDate: new Date().toDateString(),
      });
      hideModal();
    } catch (error) {
      hideModal();
      showErrorModal(error.message);
    }
  };

  const handlePasswordReset = async () => {
    loading();
    try {
      await sendPasswordResetEmail(auth, email);
      hideModal();
      showErrorModal('Password reset email sent.');
    } catch (error) {
      hideModal();
      showErrorModal(error.message);
    }
  };

  const ContinueAuth = () => {
    if (isResetPassword) handlePasswordReset();
    else if (isSignup) handleCreateAccount();
    else handleLogin();
  };

  const switchAuthMode = () => {
    setIsSignup((prevState) => !prevState);
    toggleFullNameVisibility();
  };

  const toggleFullNameVisibility = () => setIsFullNameVisible((prevState) => !prevState);
  const togglePasswordVisibility = () => setIsPasswordVisible((prevState) => !prevState);
  const toggleResetPasswordMode = () => {
    setIsResetPassword((prevState) => !prevState);
    if (!isResetPassword) {
      setFullName('');
      setPassword('');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, justifyContent: 'center', padding: 20, backgroundColor: theme.primaryBackgroundColor }}>
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: theme.primaryTextColor }}>
              {isSignup ? 'Welcome!' : isResetPassword ? 'Reset Password' : 'Welcome back!'}
            </Text>
            <Text style={{ fontSize: 16, color: theme.secondaryTextColor }}>
              {isSignup
                ? 'Create a new account to get started.'
                : isResetPassword
                ? 'Enter your email to reset your password.'
                : "Let's login with your account details to continue."}
            </Text>
          </View>

          {isFullNameVisible && !isResetPassword && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Image source={require('../assets/images/user.png')} style={{ width: 20, height: 20, marginRight: 10, objectFit: 'contain', tintColor: theme.imageTintColor }} />
              <TextInput
                style={{
                  borderBottomWidth: 1,
                  flex: 1,
                  borderColor: theme.primaryTextColor,
                  paddingVertical: 5,
                }}
                placeholder="Full Name"
                placeholderTextColor={theme.inputFieldHintColor}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 15 }}>
            <Image source={require('../assets/images/email.png')} style={{ width: 20, height: 20, marginRight: 10, tintColor: theme.imageTintColor }} />
            <TextInput
              style={{
                borderBottomWidth: 1,
                flex: 1,
                paddingVertical: 5,
                borderColor: theme.primaryTextColor,
                color: theme.primaryTextColor,
              }}
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              placeholderTextColor={theme.inputFieldHintColor}
            />
          </View>

          {!isResetPassword && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Image source={require('../assets/images/lock.png')} style={{ width: 20, height: 20, marginRight: 10, tintColor: theme.imageTintColor, objectFit: 'contain' }} />
              <TextInput
                style={{
                  borderBottomWidth: 1,
                  flex: 1,
                  paddingVertical: 5,
                  color: theme.primaryTextColor,
                  borderColor: theme.primaryTextColor,
                }}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                placeholderTextColor={theme.inputFieldHintColor}
              />
              <TouchableOpacity onPress={isSignup ? togglePasswordVisibility : toggleResetPasswordMode}>
                <Image
                  source={isSignup ? (isPasswordVisible ? require('../assets/images/hide.png') : require('../assets/images/show.png')) : require('../assets/images/question.png')}
                  style={{ width: 18, height: 18, marginLeft: 10, tintColor: theme.imageTintColor }}
                />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: theme.secondaryBackgroundColor,
              borderRadius: 8,
              padding: 15,
              marginBottom: 10,
              alignItems: 'center',
            }}
            onPress={ContinueAuth}
          >
            <Text style={{ color: theme.primaryTextColor, fontSize: 16 }}>
              {isResetPassword ? 'Send Reset Email' : isSignup ? 'Create Account' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#4544EA',
              borderRadius: 8,
              padding: 15,
              alignItems: 'center',
            }}
            onPress={isResetPassword ? toggleResetPasswordMode : switchAuthMode}
          >
            <Text style={{ color: '#4544EA', fontSize: 16 }}>
              {isResetPassword ? 'Back to Login' : isSignup ? 'Already have an account' : 'Create new account'}
            </Text>
          </TouchableOpacity>

          <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={hideModal}>
            <View style={modalStyles.modalContainer}>
              <View style={modalStyles.modalContent}>
                <LottieView source={require('../assets/animations/loading.json')} autoPlay loop style={modalStyles.lottie} />
              </View>
            </View>
          </Modal>

          <Modal animationType="slide" transparent visible={isErrorModalVisible} onRequestClose={hideErrorModal}>
            <View style={modalStyles.modalContainer}>
              <View style={modalStyles.errorModalContent}>
                <Text style={{ fontSize: 18, color: 'black', fontWeight: 'bold' }}>Error</Text>
                <Text style={modalStyles.errorMessage}>{errorMessage}</Text>
                <TouchableOpacity style={modalStyles.closeButton} onPress={hideErrorModal}>
                  <Text style={modalStyles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;