import React from 'react';
import { Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './Components/Login';
import Home from './Components/Home';

const Stack = createNativeStackNavigator();
function BaseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={Home} />
    </Stack.Navigator>
  );
}
const App = () => {
  return (
    <NavigationContainer>
      <BaseStack />
    </NavigationContainer>
  );
};
export default App;