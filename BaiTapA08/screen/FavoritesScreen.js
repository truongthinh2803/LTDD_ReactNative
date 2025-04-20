import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { database } from '../firebase'; // Giả sử bạn đã cấu hình Firebase trong file này
import { ref, onValue, remove } from 'firebase/database'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Nhập Firebase Auth
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import icon thùng rác
import tw from 'tailwind-react-native-classnames';

const FavoritesScreen = ({ navigation }) => {
    const [favorites, setFavorites] = useState({});
    const [userId, setUserId] = useState(null); // State để lưu userId
    const [topProducts, setTopProducts] = useState([]); // Lưu trữ danh sách 10 sản phẩm bán chạy nhất

    useEffect(() => {
        const auth = getAuth(); // Khởi tạo Firebase Auth
        
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid); // Lưu userId
            } else {
                Alert.alert('Thông báo', 'Vui lòng đăng nhập để xem danh sách yêu thích.');
                navigation.navigate('Login'); // Điều hướng đến màn hình đăng nhập
            }
        });

        return () => unsubscribe(); // Dọn dẹp khi component bị hủy
    }, [navigation]);

    useEffect(() => {
      if (userId) { // Kiểm tra userId có tồn tại
          const favoritesRef = ref(database, `users/${userId}/favorites`);
  
          const unsubscribeFavorites = onValue(favoritesRef, async (snapshot) => {
              if (snapshot.exists()) {
                  const favoriteProducts = snapshot.val();
                  let updatedFavorites = {};
  
                  // Lấy thông tin chi tiết của từng sản phẩm yêu thích
                  for (const key of Object.keys(favoriteProducts)) {
                      const productId = favoriteProducts[key].id || key;
  
                      try {
                          const productDetails = await fetchProductDetails(productId); // Lấy thông tin từ bảng products
                          updatedFavorites[key] = {
                              ...favoriteProducts[key], // name, image, price
                              ...productDetails // brand, category, description, v.v.
                          };
                      } catch (error) {
                          console.error(`Lỗi khi lấy chi tiết sản phẩm: ${error}`);
                      }
                  }
  
                  setFavorites(updatedFavorites); // Cập nhật state với thông tin đầy đủ
              } else {
                  setFavorites({});
              }
          });
  
          return () => unsubscribeFavorites(); // Dọn dẹp khi component bị hủy
      }
  }, [userId]);
  

    // Lấy 10 sản phẩm bán chạy nhất
    useEffect(() => {
        const topProductsRef = ref(database, 'products'); // Lấy tất cả sản phẩm

        const unsubscribeTopProducts = onValue(topProductsRef, (snapshot) => {
            if (snapshot.exists()) {
                const products = snapshot.val();
                const productList = Object.keys(products).map(key => ({
                    ...products[key],
                    id: key,
                }));
                // Sắp xếp theo số lượng bán và lấy 10 sản phẩm bán chạy nhất
                const sortedProducts = productList.sort((a, b) => b.sales - a.sales).slice(0, 10);
                setTopProducts(sortedProducts);
            }
        });

        return () => unsubscribeTopProducts(); // Dọn dẹp khi component bị hủy
    }, []);

    const handleRemoveFavorite = async (productId) => {
        try {
            await remove(ref(database, `users/${userId}/favorites/${productId}`));
            Alert.alert('Thông báo', 'Sản phẩm đã được xóa khỏi danh sách yêu thích.');
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm yêu thích: ', error);
            Alert.alert('Thông báo', 'Đã xảy ra lỗi khi xóa sản phẩm khỏi danh sách yêu thích.');
        }
    };

    // Hàm lấy thông tin chi tiết của một sản phẩm từ bảng products
    const fetchProductDetails = async (productId) => {
      return new Promise((resolve, reject) => {
          const productRef = ref(database, `products/${productId}`);
          onValue(productRef, (snapshot) => {
              if (snapshot.exists()) {
                  resolve(snapshot.val());
              } else {
                  reject('Không tìm thấy sản phẩm');
              }
          }, (error) => {
              reject(error);
          });
      });
    };


    const formatPrice = (price) => {
      if (price === undefined || price === null) return '';
      return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
    };

    const handleViewDetails = (product) => {
      navigation.navigate('ProductDetails', {
        product,
        userId, // Gửi userId đến ProductDetailsScreen
      });
    };

    return (
        <View style={tw`flex-1 bg-gray-100`}>
          <ScrollView contentContainerStyle={tw`p-4`}>
            {Object.keys(favorites).length === 0 ? (
              <View style={tw`flex-1 items-center justify-center`}>
                <Icon name="star" size={60} color="#f00" />
                <Text style={tw`text-lg text-center text-gray-600 mt-4`}>
                  Danh sách yêu thích của bạn đang trống!
                </Text>
                <Text style={tw`text-base text-center text-gray-500 mt-2`}>
                  Hãy khám phá các sản phẩm tuyệt vời và thêm vào danh sách yêu thích ngay nhé!
                </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('HomeContent')} // Điều hướng đến trang sản phẩm
                  style={tw`bg-green-500 rounded-lg mt-4 px-4 py-2`}
                >
                  <Text style={tw`text-white text-lg font-bold`}>Khám phá ngay</Text>
                </TouchableOpacity>
              </View>
            ) : (
              Object.keys(favorites).map((key) => {
                const product = favorites[key];
                const productId = product.id || key;
                return (
                  <TouchableOpacity 
                    key={key} 
                    style={tw`bg-white rounded-lg p-4 mb-4 flex-row items-center shadow`}
                    onPress={() => handleViewDetails({ ...product, id: productId })} // Gọi hàm điều hướng khi nhấn vào sản phẩm
                  >
                    <Image source={{ uri: product.image }} style={tw`w-20 h-20 rounded-lg`} resizeMode="contain" />
                    <View style={tw`flex-1 ml-4`}>
                      <Text style={tw`text-base font-bold`}>{product.name}</Text>
                      <Text style={tw`text-lg font-bold text-yellow-600`}>{formatPrice(product.price)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={tw`ml-2`}
                      onPress={() => handleRemoveFavorite(key)} // Giữ chức năng xóa sản phẩm yêu thích
                    >
                      <Icon name="delete" size={30} color="red" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
              
            )}
      
            {/* Đường ngang với chữ "Có lẽ bạn sẽ thích" */}
            <View style={tw`flex-row items-center my-6`}>
              <View style={tw`flex-1 h-px bg-gray-300`} />
              <Text style={tw`mx-4 text-gray-600 text-lg font-semibold`}>Có thể bạn sẽ thích</Text>
              <View style={tw`flex-1 h-px bg-gray-300`} />
            </View>
      
            {/* Hiển thị 10 sản phẩm bán chạy nhất trong 2 cột */}
            <View style={tw`flex-row flex-wrap justify-between`}>
              {topProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={tw`w-1/2 p-1`}
                  onPress={() => handleViewDetails(product)} // Gọi hàm handleViewDetails khi nhấn vào sản phẩm
                >
                  <View style={tw`bg-white rounded-lg p-2 shadow`}>
                    <Image source={{ uri: product.image }} style={tw`w-full h-32 rounded-lg`} resizeMode="contain" />
                    <Text style={tw`mt-2 text-xs font-bold text-center`}>{product.name}</Text>
                    <Text style={tw`text-lg font-bold text-yellow-600 text-center`}>{formatPrice(product.price)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      );        
};

export default FavoritesScreen;
