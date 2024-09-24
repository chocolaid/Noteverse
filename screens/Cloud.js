import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Animated, Easing } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebaseConfig";
import { getNotes } from "../functions/functions";
import { getDatabase, ref, onValue, set, push, query, limitToLast } from "firebase/database";
import CryptoJS from "react-native-crypto-js"; // For encryption
import LinearGradient from "react-native-linear-gradient"; // For beautiful gradients

const FirebaseBaseCloudBackup = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [latestBackup, setLatestBackup] = useState(null);

  // Animations
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Set up authentication state listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserId(user.uid);
        fetchNotes(); // Fetch notes after authentication
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Fetch the latest backup when userId is available
    if (userId) {
      fetchLatestBackup();
    }
  }, [userId]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const storedNotes = await getNotes(); // Fetch notes
      setNotes(storedNotes);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notes: ", error);
      setLoading(false);
    }
  };

  const fetchLatestBackup = async () => {
    if (!userId) {
      console.log("No user ID available; cannot fetch backups.");
      return;
    }

    console.log(`Fetching latest backup for user ID: ${userId}`);
    const db = getDatabase();
    const backupRef = ref(db, `users/noteverse_backups/${userId}`);
    const backupQuery = query(backupRef, limitToLast(1));

    onValue(
      backupQuery,
      (snapshot) => {
        if (snapshot.exists()) {
          const backupData = snapshot.val();
          const backupId = Object.keys(backupData)[0];
          console.log("Backup data fetched successfully:", backupData[backupId]);
          setLatestBackup(backupData[backupId]);
        } else {
          console.log("No backup data found.");
          setLatestBackup(null);
        }
      },
      (error) => {
        console.error("Error fetching backup data:", error);
      }
    );
  };



  const uploadBackupToFirebase = async () => {
    if (!isAuthenticated || !userId) {
      Alert.alert("Error", "You must be logged in to backup your notes.");
      return;
    }

    setLoading(true);
    try {
      const backupData = encryptNotes(notes);
      const db = getDatabase();
      const backupRef = ref(db, `users/noteverse_backups/${userId}`);
      const newBackupRef = push(backupRef);

      await set(newBackupRef, backupData);
      Alert.alert("Success", "Notes backed up to cloud successfully.");
      fetchLatestBackup(); // Refresh the latest backup info
    } catch (error) {
      console.error("Error uploading backup: ", error);
      Alert.alert("Error", "There was an issue uploading the backup.");
    } finally {
      setLoading(false);
    }
  };

  const encryptNotes = (notesToEncrypt) => {
    const encryptionKey = userId;
  
    // Encrypt entire note object as a string
    const encryptedNotes = notesToEncrypt.map((note) => {
      const noteString = JSON.stringify(note); // Convert note object to string
      const encryptedContent = CryptoJS.AES.encrypt(noteString, encryptionKey).toString();
      return { encryptedContent }; // Store the encrypted string
    });
  
    return {
      notes: encryptedNotes,
      backupDate: new Date().toISOString(),
      encryptionType: "AES",
    };
  };
  
  const decryptNotes = (encryptedNotes) => {
    const decryptionKey = userId;
  
    // Decrypt the entire note object
    return encryptedNotes.map((note) => {
      try {
        const bytes = CryptoJS.AES.decrypt(note.encryptedContent, decryptionKey);
        const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);
        const decryptedNote = JSON.parse(decryptedContent); // Convert back to object
        return decryptedNote;
      } catch (error) {
        console.error("Error decrypting note:", error);
        return null; // Handle decryption errors gracefully
      }
    }).filter(note => note !== null); // Filter out any failed decryptions
  };
  

  const restoreBackup = async () => {
    if (!latestBackup) {
      Alert.alert("Error", "No backup found to restore.");
      return;
    }

    setLoading(true);
    try {
      console.log("Restoring backup with data:", latestBackup);
      const decryptedNotes = decryptNotes(latestBackup.notes);
      await AsyncStorage.setItem("notes", JSON.stringify(decryptedNotes));
      Alert.alert("Success", "Notes restored successfully.");
      setNotes(decryptedNotes); // Update local state with restored notes
    } catch (error) {
      console.error("Error restoring notes: ", error);
      Alert.alert("Error", "There was an issue restoring the backup.");
    } finally {
      setLoading(false);
    }
  };

  const animateScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  if (loading) {
    return (
      <LinearGradient colors={["#000000", "#FFFFFF"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#000000", "#FFFFFF"]} style={{ flex: 1, padding: 20, justifyContent: "space-between", alignItems: "center", paddingTop: 60}}>
      <View style={{ alignItems: "center", marginBottom: 30 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff", textAlign: "center" }}>Cloud Backup</Text>
        <Text style={{ color: "#fff", fontSize: 16, marginTop: 10, textAlign: "center" }}>
          Securely backup your notes
        </Text>
      </View>

      {isAuthenticated && latestBackup && (
        <View style={{ alignItems: "center", marginVertical: 20 }}>
          <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>
            Last Backup: {new Date(latestBackup.backupDate).toLocaleString()}
          </Text>
          <Text style={{ color: "#fff", fontSize: 14, textAlign: "center" }}>
            Encryption: {latestBackup.encryptionType}
          </Text>
        </View>
      )}

      {isAuthenticated ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", paddingBottom: 20 }}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, marginRight: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#34D399",
                padding: 15,
                borderRadius: 25,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
              }}
              onPress={() => {
                animateScale();
                uploadBackupToFirebase();
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>Backup Now</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, marginLeft: 10 }}>
            <TouchableOpacity
              style={{
                backgroundColor: "#3B82F6",
                padding: 15,
                borderRadius: 25,
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 5,
              }}
              onPress={() => {
                animateScale();
                restoreBackup();
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18 }}>Restore Backup</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : (
        <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>Please log in to backup or restore your notes.</Text>
      )}
    </LinearGradient>
  );
};

export default FirebaseBaseCloudBackup;
