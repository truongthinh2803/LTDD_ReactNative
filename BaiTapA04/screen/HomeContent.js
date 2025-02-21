import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FilterMenu from './FilterMenu'; // Import FilterMenu
import { getProducts } from '../firebase'; // Import hàm lấy sản phẩm từ firebase.js

const HomeContent = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brands, setBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState(''); // Initialize sortOrder
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productList = await getProducts();
        setProducts(productList);
        setFilteredProducts(productList);

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
    navigation.navigate('ProductDetailsScreen', { product });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Icon name="menu" size={24} color="#333" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchIcon}>
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
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleViewDetails(item)}
          >
            <Image source={{ uri: item.image }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7', // Light gradient background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuButton: {
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    elevation: 2, // Elevation for shadow
  },
  searchIcon: {
    marginLeft: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    overflow: 'hidden',
    elevation: 5, // Stronger shadow for better contrast
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    transform: [{ scale: 0.97 }], // Slight scaling effect
    transition: 'all 0.3s ease', // Smooth animation
  },
  productImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
    margin: 10, // Add space around the image
  },
  productInfo: {
    marginLeft: 15,
    justifyContent: 'center',
    flex: 1,
  },
  productName: {
    fontSize: 20, // Tăng kích thước chữ
    fontWeight: 'bold',
    marginBottom: 8, // Tăng khoảng cách phía dưới
    color: '#2C3E50', // Màu tối hơn để tương phản tốt hơn
    textShadowColor: 'rgba(0, 0, 0, 0.2)', // Tạo bóng nhẹ cho chữ
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5, // Tạo khoảng cách giữa các chữ cái để dễ đọc hơn
  },

  productPrice: {
    fontSize: 20,
    color: '#e63946', // Bright red for price
    fontWeight: '600',
  },
});

export default HomeContent;
