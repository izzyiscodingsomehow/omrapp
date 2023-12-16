import React from 'react';
import { Text, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Login from './Components/Login';
import Home from './Components/Home';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function BaseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}

function DrawerStack() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Login" component={Login} />
    </Drawer.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      {/* <BaseStack /> */}
      <DrawerStack />
    </NavigationContainer>
  );
};
export default App;