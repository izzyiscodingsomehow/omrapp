import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';
import Login from './Components/Login';
import LogOut from './Components/LogOut';
import Home from './Components/Home';
import SignUp from './Components/SignUp';
import CustomDrawer from './Components/custom/CustomDrawer';
import {ContextProvider} from './Components/contexts/UserContext';
import FAQ from './Components/FAQ';
import Settings from './Components/Settings';
import UserLoaderInt from './Components/UserLoaderInt';
import {RideContextProvider} from './Components/contexts/RideContext';
const Drawer = createDrawerNavigator();

function DrawerStack() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerTitle: '',
        headerStyle: {
          backgroundColor: 'transparent',
          height: 0,
        },
        drawerActiveBackgroundColor: '#F0F0F0',
        drawerActiveTintColor: '#131316',
        drawerInactiveTintColor: '#131316',
        drawerStyle: {
          borderTopRightRadius: 10,
          borderBottomRightRadius: 10,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: 'normal',
        },
      }}>
      <Drawer.Screen
        name="Login"
        component={Login}
        options={{
          drawerItemStyle: {display: 'none'},
          headerShown: false,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen
        name="SignUp"
        component={SignUp}
        options={{
          drawerItemStyle: {display: 'none'},
          headerShown: false,
          swipeEnabled: false,
        }}
      />
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen
        name="UserLoaderInt"
        component={UserLoaderInt}
        options={{
          drawerItemStyle: {display: 'none'},
          // initialParams={{ usersid:"loader",usersname:"loader",usersphone:"3169973256" }}
        }}
      />
      <Drawer.Screen name="Settings" component={Settings} />
      <Drawer.Screen name="FAQ" component={FAQ} />
      <Drawer.Screen name="Logout" component={LogOut} />
    </Drawer.Navigator>
  );
}

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#D9D9D9',
    text: '#131316',
  },
};

const App = () => {
  return (
    <ContextProvider>
      <RideContextProvider>
        <NavigationContainer theme={theme}>
          <DrawerStack />
        </NavigationContainer>
      </RideContextProvider>
    </ContextProvider>
  );
};
export default App;
