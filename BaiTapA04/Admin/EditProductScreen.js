import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { updateProduct } from '../firebase'; // Hàm cập nhật sản phẩm trong Firebase
import * as ImageManipulator from 'expo-image-manipulator';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EditProductScreen = ({ route, navigation }) => {
  const { product } = route.params; // Nhận dữ liệu sản phẩm từ route params
  const [name, setName] = useState(product.name);
  const [brand, setBrand] = useState(product.brand);
  const [category, setCategory] = useState(product.category);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price.toString());
  const [image, setImage] = useState(product.image);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      // Thay đổi kích thước ảnh tại đây
      const manipResult = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 600 } }], // Đặt kích thước ảnh mong muốn tại đây
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Tùy chỉnh chất lượng ảnh
      );
      setImage(manipResult.uri); // Cập nhật URI ảnh đã được thay đổi kích thước
    }
  };

  const handleUpdateProduct = async () => {
    if (!name || !brand || !category || !description || !price || !image) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin sản phẩm.');
      return;
    }
  
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn lưu các thay đổi cho sản phẩm này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: async () => {
            const productData = {
              name,
              brand,
              category,
              description,
              price: parseFloat(price),
              image,
            };
  
            try {
              await updateProduct(product.id, productData); // Cập nhật sản phẩm trong database
              Alert.alert('Thông báo', 'Sản phẩm đã được cập nhật thành công!');
              navigation.goBack(); // Quay lại trang trước đó
            } catch (error) {
              console.error('Lỗi cập nhật sản phẩm:', error);
              Alert.alert('Thông báo', 'Có lỗi xảy ra khi cập nhật sản phẩm.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <TouchableOpacity style={styles.imagePlaceholder} onPress={handlePickImage}>
            <Icon name="add-a-photo" size={40} color="#666" />
            <Text style={styles.imageText}>Chọn ảnh sản phẩm</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.editImageButton} onPress={handlePickImage}>
          <Icon name="edit" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên thiết bị</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập tên thiết bị"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hãng sản xuất</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập hãng sản xuất"
          value={brand}
          onChangeText={setBrand}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Danh mục</Text>
        <Picker
          selectedValue={category}
          style={styles.picker}
          onValueChange={(itemValue) => setCategory(itemValue)}
        >
          <Picker.Item label="Chọn danh mục" value="" />
          <Picker.Item label="Phổ thông" value="Phổ thông" />
          <Picker.Item label="Tầm trung" value="Tầm trung" />
          <Picker.Item label="Cận cao cấp" value="Cận cao cấp" />
          <Picker.Item label="Cao cấp" value="Cao cấp" />
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mô tả sản phẩm</Text>
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Nhập mô tả sản phẩm"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Giá sản phẩm</Text>
        <TextInput
          style={styles.input}
          placeholder="Nhập giá sản phẩm"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleUpdateProduct}>
          <Icon name="save" size={20} color="#fff" />
          <Text style={styles.buttonText}>Lưu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={20} color="#fff" />
          <Text style={styles.buttonText}>Trở lại</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative', // Để đặt nút chỉnh sửa trên ảnh
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eaeaea',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  imageText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF5722',
    borderRadius: 50,
    padding: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    height: 100,
  },
  picker: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5722',
    padding: 15,
    borderRadius: 12,
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default EditProductScreen;
