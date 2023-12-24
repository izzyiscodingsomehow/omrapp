import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import CTextInput from './custom/CTextInput';
import SlideView from './custom/SlideView';
import CButton from './custom/CButton';
import { UserContext } from './contexts/UserContext';
import auth from '@react-native-firebase/auth';
const SignUp = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  //console.log(user.displayName);
  const [name, setName] = useState('');
  const update = {
    displayName: name,
    photoURL: '1',
  }
  const updateuserinfo = async (userInfo) => {
    try {
      await auth().currentUser.updateProfile(update);
      console.log("current", auth().currentUser);
      setUser(auth().currentUser);
    } catch (e) {
      console.log("Signup Error: ", e);
    }
  }
  const handleChange = async (text) => {
    setName(text);
  }
  const handleClick = async () => {
    await updateuserinfo();
    navigation.navigate('Home');
  }
  const styles = StyleSheet.create({
    // position the earth bg
  });
  return (
    <View className="flex-1 items-center justify-center text-xl bg-white">
      {/* OMR logo */}
      <Image source={require('../imgs/OMR.png')} width={50} height={50} />

      {/* earth background */}
      <Image
        source={require('../imgs/earthBg.png')}
        width={50}
        height={50}
        style={styles.backgroundImage}
      />

      <SlideView className="">
        <View className="p-5">
          <Text className="text-xl text-black">Enter Your Full Name:</Text>
          <CTextInput
            placeholder="f.e M Saad"
            twClass="p-3 px-4 mt-3 text-lg"
            handleChange={handleChange}
          />
          <CButton
            title={'Confirm Code'}
            twClass="mt-4"
            handlePress={handleClick}
          />
        </View>
      </SlideView>
    </View>
  )
}
export default SignUp;