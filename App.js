import React from 'react';
import { Text, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Login from './Components/Login';
import Home from './Components/Home';
import CustomDrawer from './Components/custom/CustomDrawer';

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
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerTitle: '', headerStyle: {
          backgroundColor: "transparent",
          height: 0,
        },
        // drawerActiveBackgroundColor: "#D9D9D"

      }}>

      <Drawer.Screen name="Login" component={Login} />
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Become a Driver" component={Login} />
      <Drawer.Screen name="Settings" component={Login} />
      <Drawer.Screen name="Support" component={Login} />
      <Drawer.Screen name="FAQ" component={Login} />
    </Drawer.Navigator>
  );
}

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D9D9D9',
    text: "#131316",
  }


}

const App = () => {
  return (
    <NavigationContainer theme={theme} >
      {/* <BaseStack /> */}
      <DrawerStack />
    </NavigationContainer>
  );
};
export default App;