import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';
import { database } from '../firebase'; // Giả sử bạn đã cấu hình Firebase trong file này
import { ref, get, set } from 'firebase/database'; // Thêm get từ firebase/database

const ProductDetailsScreen = ({ route }) => {
  const { product, userId } = route.params; // Nhận product và userId từ params
  const [reviews, setReviews] = useState([]); // State để lưu danh sách đánh giá
  const [similarProducts, setSimilarProducts] = useState([]); // State để lưu danh sách sản phẩm tương tự

  useEffect(() => {
    // Hàm để lấy danh sách đánh giá từ Firebase
    const fetchReviews = async () => {
      try {
        const reviewsRef = ref(database, `products/${product.id}/orders`);
        const snapshot = await get(reviewsRef);
        const orders = snapshot.val();

        // Lấy danh sách các reviews từ các orders
        let allReviews = [];
        if (orders) {
          Object.keys(orders).forEach(orderId => {
            const orderReviews = orders[orderId].reviews;
            if (orderReviews) {
              Object.keys(orderReviews).forEach(reviewId => {
                allReviews.push(orderReviews[reviewId]);
              });
            }
          });
        }

        setReviews(allReviews); // Cập nhật state
      } catch (error) {
        console.error('Lỗi khi lấy đánh giá: ', error);
      }
    };

    // Hàm để lấy các sản phẩm tương tự từ Firebase
    const fetchSimilarProducts = async () => {
      try {
        const productsRef = ref(database, 'products');
        const snapshot = await get(productsRef);
        const allProducts = snapshot.val();

        let filteredProducts = [];
        if (allProducts) {
          Object.keys(allProducts).forEach(id => {
            const currentProduct = allProducts[id];
            // Kiểm tra xem sản phẩm có cùng brand và category nhưng không phải sản phẩm hiện tại
            if (currentProduct.brand === product.brand && currentProduct.category === product.category && currentProduct.id !== product.id) {
              filteredProducts.push(currentProduct);
            }
          });
        }

        setSimilarProducts(filteredProducts); // Cập nhật state
      } catch (error) {
        console.error('Lỗi khi lấy sản phẩm tương tự: ', error);
      }
    };

    fetchReviews(); // Gọi hàm lấy đánh giá khi component được render
    fetchSimilarProducts(); // Gọi hàm lấy sản phẩm tương tự
  }, [product.id]);

  const handleAddToFavorites = async () => {
    const favoriteItem = {
      image: product.image,
      name: product.name,
      price: product.price,
    };

    try {
      // Xác định đường dẫn đến danh sách yêu thích của người dùng
      const favoritesRef = ref(database, `users/${userId}/favorites/${product.id}`);

      // Thêm sản phẩm vào danh sách yêu thích
      await set(favoritesRef, favoriteItem);

      Alert.alert('Thông báo', 'Sản phẩm đã được thêm vào danh sách yêu thích.');
    } catch (error) {
      console.error('Lỗi khi thêm vào yêu thích: ', error);
      Alert.alert('Thông báo', 'Đã xảy ra lỗi khi thêm sản phẩm vào danh sách yêu thích.');
    }
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
      <ScrollView contentContainerStyle={tw`p-4 bg-gray-100 pb-32`}>
        <View style={tw`w-full h-60 bg-white rounded-xl mb-5 justify-center items-center`}>
          <Image
            source={{ uri: product.image }}
            style={tw`w-full h-full rounded-xl`}
            resizeMode="contain"
          />
        </View>
        <View style={tw`bg-white p-4 rounded-xl shadow-lg`}>
          <Text style={tw`text-2xl font-bold mb-2 text-gray-800`}>{product.name}</Text>
          <Text style={tw`text-2xl font-bold mb-2 text-yellow-600`}>{formatPrice(product.price)}</Text>
          <Text style={tw`text-lg font-bold mb-2 text-gray-600`}>Hãng: {product.brand}</Text>
          <Text style={tw`text-lg font-bold mb-4 text-gray-600`}>Danh mục: {product.category}</Text>
          <Text style={tw`text-base mb-6 text-gray-600 text-justify`}>{product.description}</Text>
        </View>

        {/* Phần hiển thị đánh giá */}
        <View style={tw`bg-white p-4 rounded-xl shadow-lg mt-5`}>
          <Text style={tw`text-xl font-bold mb-4 text-gray-800`}>
            Đánh giá sản phẩm ({reviews.length})
          </Text>
          {reviews.length === 0 ? (
            <Text style={tw`text-gray-600`}>Chưa có đánh giá nào.</Text>
          ) : (
            reviews.map((review, index) => (
              <View key={index} style={tw`mb-3 border-b border-gray-200 pb-2`}>
                <View style={tw`flex-row justify-start items-center`}>
                  <Text style={tw`text-lg font-semibold text-gray-700`}>{review.userName}</Text>
                  <Text style={tw`text-gray-500 text-sm ml-2 italic`}>
                    ({new Date(review.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })})
                  </Text>
                </View>
                <Text style={tw`text-xl text-yellow-500`}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </Text>
                <Text style={tw`text-base text-gray-600`}>{review.reviewText}</Text>
              </View>
            ))
          )}
        </View>

        {/* Phần hiển thị sản phẩm tương tự */}
        <View style={tw`bg-white p-4 rounded-xl shadow-lg mt-5`}>
          <Text style={tw`text-xl font-bold mb-4 text-gray-800`}>Sản phẩm tương tự</Text>
          <View style={tw`flex-row flex-wrap justify-between`}>
            {similarProducts.map((item) => (
              <View key={`${item.id}-${item.name}`} style={tw`w-1/2 p-1`}>
                  <View style={tw`bg-white rounded-lg p-2 shadow`}>
                    <Image
                      source={{ uri: item.image }}
                      style={tw`w-full h-32 rounded-lg`}
                      resizeMode="contain"
                    />
                    <Text style={tw`mt-2 text-lg font-bold text-center`}>{item.name}</Text>
                    <Text style={tw`text-lg font-bold text-yellow-600 text-center`}>{formatPrice(item.price)}</Text>
                  </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Phần hiển thị các nút dưới cùng */}
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
