import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FilterMenu from './FilterMenu'; // Import FilterMenu
import { getProducts } from '../firebase'; // Import hàm lấy sản phẩm từ firebase.js
import { auth } from '../firebase'; // Import firebase auth để lấy userId
import tw from 'tailwind-react-native-classnames';

const HomeContent = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brands, setBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); // State để lưu userId

  useEffect(() => {
    // Lấy userId từ Firebase
    const user = auth.currentUser;
    if (user) {
      setCurrentUserId(user.uid); // Lưu userId vào state
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
        setFilteredProducts(productList);

        const sortedProducts = productList
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 10);
        setTopProducts(sortedProducts);

        const uniqueCategories = [...new Set(productList.map(product => product.category))];
        setCategories(uniqueCategories);

        const uniqueBrands = [...new Set(productList.map(product => product.brand))];
        setBrands(uniqueBrands);
      } catch (error) {
        console.error('Lỗi lấy sản phẩm:', error);
        Alert.alert('Thông báo', 'Có lỗi xảy ra khi lấy danh sách sản phẩm.');
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts(searchQuery, products, selectedCategory, selectedBrand, sortOrder);
  }, [searchQuery, products, selectedCategory, selectedBrand, sortOrder]);

  const filterAndSortProducts = (query, productList, category, brand, order) => {
    let filtered = productList;
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }
    if (brand) {
      filtered = filtered.filter(product => product.brand === brand);
    }
    if (query) {
      const lowercasedQuery = query.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowercasedQuery)
      );
    }
    if (order) {
      filtered = filtered.sort((a, b) => {
        if (order === 'asc') {
          return a.price - b.price;
        } else if (order === 'desc') {
          return b.price - a.price;
        }
        return 0;
      });
    }
    setFilteredProducts(filtered);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
  };

  const handleViewDetails = (product) => {
    navigation.navigate('ProductDetails', {
      product,
      userId: currentUserId, // Gửi userId đến ProductDetailsScreen
    });
  };

  const renderTopProducts = () => (
    <View style={tw`bg-yellow-300 p-2 shadow-lg mb-4`}>
      <Text style={tw`text-lg font-bold text-center mb-2 text-black`}>🔥 Top 10 sản phẩm bán chạy nhất</Text>
      <FlatList
        data={topProducts}
        keyExtractor={(item) => item.id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white shadow-lg p-2 mr-2 items-center w-32`}
            onPress={() => handleViewDetails(item)}
          >
            <Image source={{ uri: item.image }} style={tw`w-20 h-20 mb-1`} />
            <Text style={tw`text-sm font-semibold text-gray-800 text-center`}>{item.name}</Text>
            <View style={tw`flex-row items-center justify-center mt-1`}>
              <Icon name="trending-up" size={18} color="#ff4500" />
              <Text style={tw`ml-1 text-lg font-bold text-red-500 text-center`}>Đã bán: {item.sales}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={tw`flex-1 p-5 bg-gray-100`}>
      <View style={tw`flex-row items-center mb-5`}>
        <TouchableOpacity
          style={tw`mr-4`}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <TextInput
          style={tw`flex-1 h-10 border border-gray-300 rounded-full px-4 bg-gray-200 shadow-md`}
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={tw`ml-2`}>
          <Icon name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <FilterMenu
          categories={categories}
          brands={brands}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onClose={() => setShowMenu(false)}
        />
      )}

      <FlatList
        data={filteredProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={tw`justify-between`}
        ListHeaderComponent={renderTopProducts}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={tw`bg-white mb-4 border border-gray-300 rounded-lg p-2 shadow-lg w-1/2`}
            onPress={() => handleViewDetails(item)}
          >
            <Image 
              source={{ uri: item.image }} 
              style={tw`w-32 h-32 rounded-md mx-auto mt-2`} 
              resizeMode="contain"
            />
            <View style={tw`mt-2 px-2`}>
              <Text style={tw`text-lg font-bold text-gray-800 text-center mb-1`}>{item.name}</Text>
              <Text style={tw`text-lg text-yellow-600 font-semibold text-center`}>{formatPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeContent;
