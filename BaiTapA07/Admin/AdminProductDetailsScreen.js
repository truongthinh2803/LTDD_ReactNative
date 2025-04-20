import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { deleteProduct } from '../firebase';

const AdminProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;

  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa sản phẩm này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: async () => {
            try {
              await deleteProduct(product.id);
              Alert.alert('Thông báo', 'Sản phẩm đã được xóa.');
              navigation.goBack();
            } catch (error) {
              console.error('Lỗi xóa sản phẩm:', error);
              Alert.alert('Thông báo', 'Có lỗi xảy ra khi xóa sản phẩm.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.price}>{product.price.toLocaleString()} VNĐ</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('EditProductScreen', { product })}
          >
            <Icon name="edit" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <Icon name="delete" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#FAFAFA',
  },
  imageContainer: {
    width: '100%',
    height: Dimensions.get('window').width * 0.6,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  brand: {
    fontSize: 20,
    color: '#555',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  category: {
    fontSize: 19,
    color: '#777',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
  },
  description: {
    fontSize: 18,
    color: '#333',
    textAlign: 'justify', // Căn đều hai bên
  },  

});

export default AdminProductDetailsScreen;
