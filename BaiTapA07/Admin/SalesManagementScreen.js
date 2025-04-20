import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import tw from 'tailwind-react-native-classnames';
import { getProducts, updateProductSales } from '../firebase';

// Thành phần hiển thị thông tin sản phẩm
const ProductItem = React.memo(({ item, sales, onSalesChange, onSave }) => {
  return (
    <View style={tw`bg-white p-4 mb-4 rounded-lg shadow-md border border-gray-300 flex-1 m-2`}>
      <Image 
        source={{ uri: item.image }} 
        style={tw`w-16 h-16 rounded-lg mx-auto mb-2`} 
      />
      <Text style={tw`text-lg font-semibold text-center mb-2 text-gray-800`}>{item.name}</Text>

      <View style={tw`flex-row items-center border border-gray-300 rounded-lg overflow-hidden h-12 mb-2`}>
        <TextInput
          style={tw`flex-1 p-2 text-center text-gray-800 text-lg rounded-l-lg`}
          keyboardType="numeric"
          placeholder="Nhập doanh số"
          placeholderTextColor="#A0AEC0"
          value={sales?.toString() || '0'}
          onChangeText={(text) => onSalesChange(item.id, parseInt(text) || 0)}
        />
      </View>

      <TouchableOpacity
        style={tw`bg-blue-700 h-12 justify-center items-center rounded-lg shadow-md`}
        onPress={() => onSave(item.id)}
      >
        <View style={tw`flex-row items-center`}>
          <Icon name="update" size={24} color="#FFF" />
          <Text style={tw`text-white text-sm font-semibold ml-2`}>Cập nhật</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

const SalesManagementScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);

        const initialSales = {};
        productList.forEach(product => {
          initialSales[product.id] = product.sales || 0;
        });
        setSales(initialSales);
      } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        Alert.alert('Thông báo', 'Có lỗi xảy ra khi lấy danh sách sản phẩm.');
      }
    };

    fetchProducts();
  }, []);

  const handleSalesChange = (id, newSales) => {
    setSales({ ...sales, [id]: newSales });
  };

  const handleSaveSales = async (id) => {
    try {
      await updateProductSales(id, sales[id]);
      Alert.alert('Thông báo', 'Cập nhật doanh số thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật doanh số:', error);
      Alert.alert('Thông báo', 'Có lỗi xảy ra khi cập nhật doanh số.');
    }
  };

  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      <Text style={tw`text-center text-2xl font-bold text-blue-800 mb-6`}>Quản Lý Doanh Số Sản Phẩm</Text>
      
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductItem 
            item={item} 
            sales={sales[item.id]} 
            onSalesChange={handleSalesChange} 
            onSave={handleSaveSales} 
          />
        )}
        numColumns={2} // Hiển thị 2 cột
        columnWrapperStyle={tw`justify-between`} // Căn giữa các cột
      />
    </View>
  );
};

export default SalesManagementScreen;
