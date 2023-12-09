import { View, Text, Button } from 'react-native';
import React from 'react';
import CButton from './custom/CButton';
import SlideView from './custom/SlideView';

const Login = () => {
  return (
    <View className="flex-1 items-center justify-center text-xl">
      <Text className="text-dark">Open up App.js to start working on your app! hello there</Text>
      <CButton title="Sign In" twClass="" padding="" handlePress={() => console.log("clicked")} />
      <SlideView height={200}/>
    </View>
  );
};
export default Login;