import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator();

const IntroductionScreen = ({ navigation }) => {
  useEffect(() => {
    // Tự động chuyển sang trang Homepage sau 10 giây
    const timer = setTimeout(() => {
      navigation.replace('Homepage');
    }, 10000);

    // Xoá timer khi rời khỏi màn hình để tránh lỗi
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xin chào!</Text>
      <Text style={styles.description}>
        Tôi là một nhà phát triển phần mềm đam mê học hỏi.
      </Text>
      <Text style={styles.description}>
        Ứng dụng này sẽ chuyển sang Homepage sau 10 giây.
      </Text>
    </View>
  );
};

const Homepage = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang Chủ</Text>
      <Text style={styles.description}>
        Homepage!
      </Text>
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Introduction" component={IntroductionScreen} />
        <Stack.Screen name="Homepage" component={Homepage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
});
