import { View, Text, Image, StyleSheet } from 'react-native'
import React, { useState, useContext, useEffect } from 'react'
import CTextInput from './custom/CTextInput';
import SlideView from './custom/SlideView';
import CButton from './custom/CButton';
import { UserContext } from './contexts/UserContext';
import auth from '@react-native-firebase/auth';
import CheckBox from '@react-native-community/checkbox';
const SignUp = ({ navigation }) => {
  const { user, setUser } = useContext(UserContext);
  const { setSignedUp } = useContext(UserContext);
  const [toggleCheckBox, setToggleCheckBox] = useState(false)

  //console.log(user.displayName);
  const [name, setName] = useState('');
  const update = {
    displayName: name,
    photoURL: toggleCheckBox ? "loader" : "user",
  }
  const updateuserinfo = async (userInfo) => {
    try {
      await auth().currentUser.updateProfile(update);
      console.log("current", auth().currentUser);
      setUser(auth().currentUser);
      setSignedUp(true);
    } catch (e) {
      console.log("Signup Error: ", e);
    }
  }
  const handleChange = async (text) => {
    setName(text);
  }
  const handleClick = async () => {
    await updateuserinfo();
    navigation.navigate('Login');
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
          <View className="rounded-lg py-3 mv-5 text-lg items-center flex flex-row">
          <Text className="text-xl text-black">
          Are You A Loader?
          </Text>
          <View className="px-2">
          <CheckBox
            disabled={false}
            value={toggleCheckBox}
            tintColors={{true: "#414141"}}
            onValueChange={(newValue) => setToggleCheckBox(newValue)}
          />
          </View>
          </View>
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