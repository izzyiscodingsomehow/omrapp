import {View, Text, Image, StyleSheet} from 'react-native';
import React, {useEffect, useState} from 'react';
import CButton from './custom/CButton';
import SlideView from './custom/SlideView';
import CTextInput from './custom/CTextInput';
import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import firebase from '../firebase';

const Login = () => {
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const navigation = useNavigation();
  const [phoneNumber, setPhoneNumber] = useState('051');
  const handleChange = text => {
    setPhoneNumber(text);
  };
  const handleCode = text => {
    setCode(text);
  };
  const handleOTP = async () => {
    try {
      await confirm.confirm(code).then(user => {
        console.log(user);
      });
      //navigation.navigate('Home');
    } catch (e) {
      console.log(e);
      alert(
        'The verification code from SMS/TOTP is invalid. Please check and enter the correct verification code again.',
      );
    }
  };
  const handleClick = () => {
    //console.log(phoneNumber);
    if (phoneNumber.length < 10 || phoneNumber.length > 10) {
      alert('Please enter a valid phone number');
      return;
    } else if (phoneNumber.length == 10) {
      const phone = '+92' + phoneNumber;
      signInWithPhoneNumber(phone);
    }
    //navigation.navigate('Home');
  };
  async function signInWithPhoneNumber(phoneNumber) {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    //console.log(confirmation);
    setConfirm(confirmation);
  }
  // styles
  const styles = StyleSheet.create({
    // position the earth bg
  });

  return (
    <>
      {!confirm ? (
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
              <Text className="text-xl text-black">Create an account</Text>
              <View className={` rounded-lg p-3 px-4 mt-3 text-lg items-center flex flex-row`}>
              <Text className="text-xl text-grey pr-2 mt-3">+92</Text>
              <CTextInput
                placeholder="f.e 123 12345678"
                twClass="p-3 px-4 mt-3 text-lg w-[250]"
                handleChange={handleChange}
              />
              </View>
              <CButton
                title={'Sign In'}
                twClass="mt-4"
                handlePress={handleClick}
              />
            </View>
          </SlideView>
        </View>
      ) : (
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
              <Text className="text-xl text-black">Enter OTP</Text>
              <CTextInput
                placeholder="f.e 123546"
                twClass="p-3 px-4 mt-3 text-lg"
                handleChange={handleCode}
              />
              <CButton
                title={'Confirm Code'}
                twClass="mt-4"
                handlePress={handleOTP}
              />
            </View>
          </SlideView>
        </View>
      )}
    </>
  );
};
export default Login;
