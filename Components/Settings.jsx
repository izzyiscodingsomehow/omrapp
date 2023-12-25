import React from 'react'
import { StyleSheet, Text, View, Image, TextInput } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import Home from './Home';
import Login from './Login';

const Stack = createNativeStackNavigator();
function BaseStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            <Stack.Screen name="Distance" component={Login} />
            <Stack.Screen name="Rules and Terms" component={Home} />
            <Stack.Screen name="Delete Account" component={Home} />
        </Stack.Navigator>
    );
}

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#D9D9D9',
        text: '#131316',
    },
}

const Settings = () => {

    return (
        <>
            {/* <BaseStack /> */}
        </>
    )
}

export default Settings