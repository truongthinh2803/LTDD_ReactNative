import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icons for better UX
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AdminPage = ({ navigation }) => {
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Thông báo', 'Đã đăng xuất.');
        navigation.replace('Login'); // Navigate back to Login after logging out
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh Mục Quản Lý</Text>

      {/* Section for Product Management */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ProductManagementScreen')}
      >
        <Icon name="inventory" size={30} color="#4CAF50" />
        <Text style={styles.cardText}>Quản lý sản phẩm</Text>
      </TouchableOpacity>

      {/* Section for User Management */}
      <TouchableOpacity style={styles.card}>
        <Icon name="people" size={30} color="#FF9800" />
        <Text style={styles.cardText}>Quản lý người dùng</Text>
      </TouchableOpacity>

      {/* Section for Order Management */}
      <TouchableOpacity style={styles.card}>
        <Icon name="shopping-cart" size={30} color="#2196F3" />
        <Text style={styles.cardText}>Quản lý đơn hàng</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
        <Icon name="exit-to-app" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  cardText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF5252',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  logoutText: {
    fontSize: 16,
    color: '#FFF',
    marginRight: 10,
  },
});

export default AdminPage;
