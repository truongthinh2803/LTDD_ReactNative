import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Alert, TouchableOpacity } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { getProducts } from '../firebase';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FavoritesScreen = ({ navigation }) => {
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const productList = await getProducts();
        const sortedProducts = productList
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 10);
        setTopProducts(sortedProducts);
      } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        Alert.alert('Thông báo', 'Có lỗi xảy ra khi lấy danh sách sản phẩm.');
      }
    };

    fetchTopProducts();
  }, []);

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetailsScreen', { product });
  };

  return (
    <View style={tw`flex-1 bg-gray-100`}>
      {/* Khu vực hiển thị 10 sản phẩm bán chạy nhất */}
      <View style={tw`bg-yellow-300 p-4 shadow-lg`}>
        <Text style={tw`text-xl font-bold text-center mb-4 text-black`}>🔥 Top 10 sản phẩm bán chạy nhất</Text>
        
        <FlatList
          data={topProducts}
          keyExtractor={(item) => item.id}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={tw`bg-white shadow-lg p-4 mr-4 items-center w-40`}
              onPress={() => handleProductPress(item)}
            >
              <Image source={{ uri: item.image }} style={tw`w-24 h-24 mb-2`} />
              <Text style={tw`text-base font-semibold text-gray-800 text-center`}>{item.name}</Text>
              <View style={tw`flex-row items-center justify-center mt-1`}>
                <Icon name="trending-up" size={18} color="#ff4500" />
                <Text style={tw`ml-1 text-lg font-bold text-red-500 text-center`}>Đã bán: {item.sales}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Khu vực hiển thị "Sản phẩm yêu thích của bạn" */}
      <View style={tw`p-4 mt-6`}>
        <Text style={tw`text-xl font-bold text-center mb-4 text-gray-800`}>❤️ Sản phẩm yêu thích của bạn</Text>
      </View>
    </View>
  );
};

export default FavoritesScreen;
