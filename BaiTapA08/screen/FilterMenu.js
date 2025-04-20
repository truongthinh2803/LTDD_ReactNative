import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const FilterMenu = ({ 
  categories, 
  brands, 
  selectedCategory, 
  setSelectedCategory, 
  selectedBrand, 
  setSelectedBrand, 
  sortOrder, 
  setSortOrder, 
  onClose 
}) => {
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSortOrder('');
  };

  return (
    <View style={styles.menu}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Xong</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
        <Text style={styles.clearButtonText}>Bỏ chọn</Text>
      </TouchableOpacity>
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Danh mục</Text>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              selectedCategory === category && styles.selectedFilterButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={styles.filterButtonText}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Thương hiệu</Text>
        {brands.map(brand => (
          <TouchableOpacity
            key={brand}
            style={[
              styles.filterButton,
              selectedBrand === brand && styles.selectedFilterButton,
            ]}
            onPress={() => setSelectedBrand(brand)}
          >
            <Text style={styles.filterButtonText}>{brand}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === 'asc' && styles.selectedSortButton,
          ]}
          onPress={() => setSortOrder('asc')}
        >
          <Text style={styles.sortButtonText}>Giá: Thấp đến Cao</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortOrder === 'desc' && styles.selectedSortButton,
          ]}
          onPress={() => setSortOrder('desc')}
        >
          <Text style={styles.sortButtonText}>Giá: Cao đến Thấp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  menu: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007bff', // Green color for close button
    fontWeight: 'bold',
  },
  clearButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#dc3545', // Red color for clear button
    fontWeight: 'bold',
  },
  filterContainer: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#e9ecef', // Light gray for filter buttons
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#dee2e6', // Slightly darker gray border
  },
  selectedFilterButton: {
    backgroundColor: '#28a745', // Green color for selected filters
    borderColor: '#28a745',
  },
  filterButtonText: {
    color: '#333333', // Dark text color for readability
    fontSize: 14,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    backgroundColor: '#e9ecef', // Light gray for sort buttons
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6', // Slightly darker gray border
  },
  selectedSortButton: {
    backgroundColor: '#28a745', // Green color for selected sort buttons
    borderColor: '#28a745',
  },
  sortButtonText: {
    color: '#333333', // Dark text color for readability
    fontSize: 14,
  },
});

export default FilterMenu;
