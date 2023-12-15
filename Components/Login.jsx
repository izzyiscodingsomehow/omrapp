import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import CButton from './custom/CButton';
import SlideView from './custom/SlideView';
import CTextInput from './custom/CTextInput';
import { useNavigation } from '@react-navigation/native';

const Login = () => {

  const navigation = useNavigation();

  // styles
  const styles = StyleSheet.create({
    // position the earth bg
  });

  return (
    <View className="flex-1 items-center justify-center text-xl bg-white">

      {/* OMR logo */}
      <Image
        source={require("../imgs/OMR.png")}
        width={50}
        height={50}
      />
      
      {/* earth background */}
      <Image
        source={require("../imgs/earthBg.png")}
        width={50}
        height={50}
        style={styles.backgroundImage}
      />

      <SlideView className="">
        <View className="p-5">
          <Text className="text-xl text-black">Create an account</Text>
          <CTextInput placeholder='+92 XXX XXXXXXX' twClass="p-3 px-4 mt-3 text-lg" />
          <CButton title={"Sign In"} twClass="mt-4" handlePress={() => navigation.navigate("Home")} />
        </View>
      </SlideView>

    </View>
  );
};
export default Login;