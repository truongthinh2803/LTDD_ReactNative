import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, signOut } from '../firebase';

const HomeScreen = ({ navigation }) => {
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
      <Text style={styles.text}>Họ và tên: Phạm Ngọc Đăng Khoa</Text>
      <Text style={styles.text}>Mã số sinh viên: 21110214</Text>
      <Text style={styles.text}>Khoa: Công Nghệ Thông Tin</Text>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff5c5c',
    padding: 10,
    borderRadius: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
