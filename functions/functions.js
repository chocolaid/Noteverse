import AsyncStorage from "@react-native-async-storage/async-storage";

const getNotes = async () => {
    try {
      // AsyncStorage.removeItem('notes');
      const notes = await AsyncStorage.getItem('notes');
      if (notes) {
        console.log('notes:', JSON.parse(notes));  
        return JSON.parse(notes);
        
      }
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