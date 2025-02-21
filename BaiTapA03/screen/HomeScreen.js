// HomeScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { FontAwesome } from '@expo/vector-icons'; // Biểu tượng user
import { auth, signOut } from '../firebase'; // Giả sử bạn đã có hàm này

const HomeScreen = ({ navigation }) => {
  const [isMenuVisible, setMenuVisible] = useState(false);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('Login');
      })
      .catch(error => {
        Alert.alert('Đăng xuất thất bại', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.userIcon} onPress={() => setMenuVisible(!isMenuVisible)}>
        <FontAwesome name="user" size={30} color="black" />
      </TouchableOpacity>

      {isMenuVisible && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => { setMenuVisible(false); navigation.navigate('UserScreen'); }}>
            <Text style={styles.menuItem}>Thông tin người dùng</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSignOut}>
            <Text style={styles.menuItem}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  userIcon: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  menu: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  menuItem: {
    padding: 10,
    fontSize: 16,
  },
});

export default HomeScreen;
