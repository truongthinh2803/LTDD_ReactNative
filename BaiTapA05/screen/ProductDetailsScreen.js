import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProductDetailsScreen = ({ route, navigation }) => {
  const { product } = route.params;

  const handleAddToFavorites = () => {
    Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào yêu thích.');
  };

  const handleAddToCart = () => {
    Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào giỏ hàng.');
  };

  const handleOrder = () => {
    Alert.alert('Thông báo', 'Đặt hàng thành công.');
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
        <Text style={styles.brand}>Hãng: {product.brand}</Text>
        <Text style={styles.category}>Danh mục: {product.category}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.favoriteButton]} onPress={handleAddToFavorites}>
            <Icon name="favorite-border" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Thêm vào yêu thích</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.cartButton]} onPress={handleAddToCart}>
            <Icon name="shopping-cart" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.orderButton]} onPress={handleOrder}>
            <Icon name="shopping-bag" size={24} color="#FFF" />
            <Text style={styles.buttonText}>Đặt hàng</Text>
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
    height: Dimensions.get('window').width * 0.6, // Tạo kích thước container tỉ lệ 16:9
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  price: {
    fontSize: 24, // Tăng kích thước chữ giá
    color: '#FF5722', // Màu sắc nổi bật cho giá
    marginBottom: 10,
    fontWeight: '700', // Đậm hơn cho giá
  },
  brand: {
    fontSize: 19,
    color: '#666',
    marginBottom: 8,
  },
  category: {
    fontSize: 19,
    color: '#666',
    marginBottom: 12,
  },
  description: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'justify',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: 'center',
  },
  favoriteButton: {
    backgroundColor: '#F44336',
  },
  cartButton: {
    backgroundColor: '#FF9800',
  },
  orderButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
});

export default ProductDetailsScreen;
