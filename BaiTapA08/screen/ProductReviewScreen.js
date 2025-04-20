import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker'; // Import thư viện chọn ảnh
import tw from 'tailwind-react-native-classnames';
import { database, storage } from '../firebase'; // Thêm Firestore Storage
import { get, ref, set, onValue } from 'firebase/database'; 
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef } from 'firebase/storage'; // Import các hàm liên quan đến Firebase Storage

const ProductReviewScreen = ({ route, navigation }) => {
  const { product, orderId } = route.params;
  const [rating, setRating] = useState(5); 
  const [reviewText, setReviewText] = useState('');
  const [userId, setUserId] = useState(null); 
  const [userName, setUserName] = useState(''); 
  const [productDetails, setProductDetails] = useState(null);
  const [userReview, setUserReview] = useState(null); 
  const [selectedImages, setSelectedImages] = useState([]); // Lưu trữ danh sách ảnh người dùng chọn

  // Lấy userId từ Firebase Authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); 
      } else {
        setUserId(null); 
      }
    });

    return () => unsubscribe(); 
  }, []);

  // Lấy thông tin người dùng từ Database
  useEffect(() => {
    if (userId) {
      const userRef = ref(database, `users/${userId}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserName(data.name);
        }
      });
    }
  }, [userId]);

  // Lấy thông tin sản phẩm từ Database
  useEffect(() => {
    const productRef = ref(database, `products/${product.id}`);
    onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductDetails(data); 
      }
    });
  }, [product.id]);

  // Lấy đánh giá của người dùng từ Database
  useEffect(() => {
    if (userId) {
      const reviewRef = ref(database, `products/${product.id}/orders/${orderId}/reviews/${userId}`);
      onValue(reviewRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserReview(data);
          setRating(data.rating); 
          setReviewText(data.reviewText); 
          setSelectedImages(data.images || []); // Lấy danh sách ảnh từ database
        } else {
          setUserReview(null); 
        }
      });
    }
  }, [userId, product.id, orderId]);

  const handleSubmitReview = async () => {
    if (!userId) {
      Alert.alert('Thông báo', 'Bạn cần đăng nhập để gửi đánh giá.');
      return;
    }

    if (rating === 0 || reviewText.trim() === '' || reviewText.length < 10) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao và nhập đánh giá tối thiểu 10 ký tự.');
      return;
    }

    const reviewItem = {
      rating,
      reviewText,
      userName,
      images: selectedImages, // Lưu danh sách ảnh vào đánh giá
      createdAt: new Date().toISOString(),
    };

    try {
      const reviewRef = ref(database, `products/${product.id}/orders/${orderId}/reviews/${userId}`); 
      await set(reviewRef, reviewItem);

      const userRef = ref(database, `users/${userId}`);
      const userSnapshot = await get(userRef);
      const userData = userSnapshot.val();
      const newPoints = (userData.points || 0) + 1000; 
      
      await set(userRef, { ...userData, points: newPoints });

      Alert.alert('Thông báo', 'Đánh giá của bạn đã được gửi thành công. Bạn nhận được 1000 điểm!');
      navigation.navigate('OrderScreen', { reviewSubmitted: true });
      setRating(0); 
      setReviewText('');
      setSelectedImages([]); // Đặt lại danh sách ảnh sau khi gửi
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá: ', error);
      Alert.alert('Thông báo', 'Đã xảy ra lỗi khi gửi đánh giá.');
    }
  };

  // Hàm chọn ảnh từ thư viện
  const handleSelectImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uploadResults = await Promise.all(result.assets.map(asset => uploadImage(asset.uri)));
      setSelectedImages([...selectedImages, ...uploadResults]); // Thêm tất cả URL ảnh vào danh sách
    }
  };

  // Hàm tải ảnh lên Firebase Storage và lưu URL
  const uploadImage = async (imageUri) => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const storage = getStorage();
    const productImageRef = storageRef(storage, `reviews/${userId}/${Date.now()}.jpg`);

    await uploadBytes(productImageRef, blob);
    const downloadURL = await getDownloadURL(productImageRef);
    return downloadURL;
  };

  // Xóa ảnh khỏi danh sách
  const handleRemoveImage = (imageUrl) => {
    const updatedImages = selectedImages.filter((img) => img !== imageUrl);
    setSelectedImages(updatedImages);
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return '';
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' VNĐ';
  };

  const renderRatingDescription = () => {
    switch (rating) {
      case 1:
        return "Chưa hài lòng lắm";
      case 2:
        return "Không tốt như mong đợi";
      case 3:
        return "Chấp nhận được";
      case 4:
        return "Sản phẩm rất tốt";
      case 5:
        return "Sản phẩm xuất sắc";
      default:
        return "";
    }
  };

  return (
    <View style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`p-4 bg-gray-100 pb-20`}>
        <View style={tw`w-full h-60 bg-white rounded-xl mb-5 justify-center items-center`}>
          <Image source={{ uri: product.image }} style={tw`w-full h-full rounded-xl`} resizeMode="contain" />
        </View>
        <View style={tw`bg-white p-4 rounded-xl shadow-lg`}>
          <Text style={tw`text-2xl font-bold mb-2 text-gray-800`}>{product.name}</Text>
          <Text style={tw`text-2xl font-bold mb-2 text-yellow-600`}>{formatPrice(product.totalPrice)}</Text>
          
          {productDetails && (
            <>
              <Text style={tw`text-lg font-bold mb-2 text-gray-600`}>Hãng: {productDetails.brand}</Text>
              <Text style={tw`text-lg font-bold mb-4 text-gray-600`}>Danh mục: {productDetails.category}</Text>
            </>
          )}

          {userReview ? (
            <View>
              <Text style={tw`text-xl font-semibold text-center mb-0`}>Đánh giá của bạn:</Text>
              <Text style={tw`text-xl font-medium text-blue-600 text-center mb-2`}>{renderRatingDescription()}</Text>
              <Text style={tw`text-lg mb-2`}>Đánh giá: {rating} sao</Text>
              <Text style={tw`text-lg mb-2`}>Nội dung: {reviewText}</Text>
              <Text style={tw`text-lg mb-2`}>Hình ảnh sản phẩm:</Text>
              <View style={tw`flex-row flex-wrap`}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={tw`relative mr-2 mb-2`}>
                    <Image source={{ uri: image }} style={tw`w-24 h-24 rounded-lg`} />
                  </View>
                ))}
              </View>
              <TouchableOpacity 
                style={tw`bg-green-500 flex-row justify-center items-center p-3 rounded-md mt-4 shadow-lg`}
                onPress={() => navigation.goBack()}
              >
                <Text style={tw`text-xl text-white font-bold`}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={tw`text-lg font-bold mb-4 text-gray-600`}>Đánh giá sản phẩm</Text>
              <View style={tw`flex-row justify-center mb-4`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <Icon
                      name={star <= rating ? 'star' : 'star-border'}
                      size={50}
                      color={star <= rating ? '#FFD700' : '#CCCCCC'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={tw`text-xl font-medium text-blue-600 text-center mb-2`}>{renderRatingDescription()}</Text>
              <TextInput
                style={tw`border border-gray-300 p-3 rounded-lg text-lg`}
                placeholder="Nhập đánh giá của bạn (tối thiểu 10 ký tự)"
                value={reviewText}
                onChangeText={setReviewText}
                multiline
                numberOfLines={4}
              />
              <View style={tw`flex-row justify-center items-center my-4`}>
                <TouchableOpacity onPress={handleSelectImage} style={tw`bg-blue-500 p-3 rounded-full`}>
                  <Icon name="photo-library" size={30} color="#fff" />
                </TouchableOpacity>
              </View>
              <Text style={tw`text-lg mb-2`}>Hình ảnh sản phẩm:</Text>
              <View style={tw`flex-row flex-wrap`}>
                {selectedImages.map((image, index) => (
                  <View key={index} style={tw`relative mr-2 mb-2`}>
                    <Image source={{ uri: image }} style={tw`w-24 h-24 rounded-lg`} />
                    <TouchableOpacity
                      style={tw`absolute top-0 right-0 bg-red-500 rounded-full p-1`}
                      onPress={() => handleRemoveImage(image)}
                    >
                      <Icon name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity 
                style={tw`bg-green-500 flex-row justify-center items-center p-3 rounded-md mt-4 shadow-lg`}
                onPress={handleSubmitReview}
              >
                <Text style={tw`text-xl text-white font-bold`}>Gửi đánh giá</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductReviewScreen;
