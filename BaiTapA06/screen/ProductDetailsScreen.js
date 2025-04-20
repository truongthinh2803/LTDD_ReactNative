import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';
import { database } from '../firebase'; // Giả sử bạn đã cấu hình Firebase trong file này
import { ref, get, set } from 'firebase/database'; // Thêm get từ firebase/database

const ProductDetailsScreen = ({ route }) => {
  const { product, userId } = route.params; // Nhận product và userId từ params

  const handleAddToFavorites = () => {
    Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào yêu thích.');
  };

  const handleAddToCart = async () => {
    const cartItem = {
      name: product.name,
      image: product.image,
      quantity: 1, // Mặc định số lượng là 1
      totalPrice: product.price, // Tổng tiền
    };

    try {
      // Xác định đường dẫn đến giỏ hàng của người dùng
      const cartRef = ref(database, `users/${userId}/cart/${product.id}`);
      
      // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
      const snapshot = await get(cartRef);
      if (snapshot.exists()) {
        // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
        const existingItem = snapshot.val();
        existingItem.quantity += 1; // Tăng số lượng lên 2
        existingItem.totalPrice += product.price; // Cập nhật tổng giá

        // Cập nhật sản phẩm trong giỏ hàng
        await set(cartRef, existingItem);
        Alert.alert('Thông báo', 'Đã cập nhật số lượng sản phẩm trong giỏ hàng');
      } else {
        // Nếu sản phẩm chưa có, thêm sản phẩm mới vào giỏ hàng
        await set(cartRef, cartItem);
        Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào giỏ hàng.');
      }
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng: ', error);
      Alert.alert('Thông báo', 'Đã xảy ra lỗi khi thêm sản phẩm vào giỏ hàng.');
    }
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`p-4 bg-gray-100 pb-20`}>
        <View style={tw`w-full h-60 bg-white rounded-xl mb-5 justify-center items-center`}>
          <Image source={{ uri: product.image }} style={tw`w-full h-full rounded-xl`} resizeMode="contain" />
        </View>
        <View style={tw`bg-white p-4 rounded-xl shadow-lg`}>
          <Text style={tw`text-2xl font-bold mb-2 text-gray-800`}>{product.name}</Text>
          <Text style={tw`text-2xl font-bold mb-2 text-red-600`}>{formatPrice(product.price)}</Text>
          <Text style={tw`text-lg font-bold mb-2 text-gray-600`}>Hãng: {product.brand}</Text>
          <Text style={tw`text-lg font-bold mb-4 text-gray-600`}>Danh mục: {product.category}</Text>
          <Text style={tw`text-base mb-6 text-gray-600 text-justify`}>{product.description}</Text>
        </View>
      </ScrollView>
      <View style={tw`absolute bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t border-gray-200`}>
        <View style={tw`flex-row justify-between`}>
          <TouchableOpacity
            style={tw`flex-row items-center bg-red-500 py-3 px-4 rounded-lg flex-1 mx-1 justify-center`}
            onPress={handleAddToFavorites}
          >
            <Icon name="favorite-border" size={24} color="#FFF" />
            <Text style={tw`text-white text-lg font-semibold ml-2`}>Yêu thích</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-row items-center bg-yellow-500 py-3 px-4 rounded-lg flex-1 mx-1 justify-center`}
            onPress={handleAddToCart}
          >
            <Icon name="shopping-cart" size={24} color="#FFF" />
            <Text style={tw`text-white text-lg font-semibold ml-2`}>Giỏ hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-row items-center bg-green-500 py-3 px-4 rounded-lg flex-1 mx-1 justify-center`}
            onPress={() => Alert.alert('Thông báo', 'Đặt hàng thành công.')}
          >
            <Icon name="shopping-bag" size={24} color="#FFF" />
            <Text style={tw`text-white text-lg font-semibold ml-2`}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ProductDetailsScreen;
