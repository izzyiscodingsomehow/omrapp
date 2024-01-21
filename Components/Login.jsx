import { View, Text, Image, StyleSheet,Alert } from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import CButton from './custom/CButton';
import SlideView from './custom/SlideView';
import CTextInput from './custom/CTextInput';
// import {useNavigation} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { UserContext } from './contexts/UserContext';

const Login = ({ navigation, route }) => {
  const settings = auth().settings;
  useEffect(() => {
    settings.appVerificationDisabledForTesting = true;
    //console.log(settings.appVerificationDisabledForTesting);
  }, []);

  // const [initializing, setInitializing] = useState(true);
  // const [user, setUser] = useState();

  // // // Handle user state changes
  // function onAuthStateChanged(user) {
  //   //console.log(user);
  //   console.log('user');
  //   if (initializing) setInitializing(false);
  // }

  // useEffect(() => {
  //   const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
  //   return subscriber; // unsubscribe on unmount
  // }, []);

  //if (initializing) return null;
  const { user, setUser } = useContext(UserContext);
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const { SignedUp } = useContext(UserContext);
  const [phoneNumber, setPhoneNumber] = useState('051');
  const handleChange = text => {
    setPhoneNumber(text);
  };
  const handleCode = text => {
    setCode(text);
  };
  const confirmSignup = async () => {
    try {
      await confirm.confirm(code).then(userInfo => {
        userInfo.additionalUserInfo.isNewUser = false;
        console.log("confirmed");
      });
      setConfirm(null);
    } catch (e) {
      console.log(e);
    }
  }
  const handleOTP = async () => {
    try {
      await confirm.confirm(code).then(userInfo => {
        // auto code await confirm.confirm('123654').then(userInfo => {
        //userInfo.additionalUserInfo.isNewUser = true;
        if (userInfo.additionalUserInfo.isNewUser) {
          console.log("new user");
          navigation.navigate('SignUp');
          //setConfirm(null);
          //in signup update user info and then set async data "ASYNC DATA STORAGE CALLS GET DATA ALWAYS"and login the user
        }
        else {
          console.log("old user", userInfo);
          setUser(userInfo.user);
          setConfirm(null);
          //set async user data and in get data set user state and login the user
        }
      });
    } catch (e) {
      console.log(e);
      Alert.alert(
        'Invalid OTP!',
        'The verification code from SMS/TOTP is invalid. Please check and enter the correct verification code again.', );
    }
  };
  useEffect(() => {
    if (user) {
      navigation.navigate('Home');
    }
  }, [user]);
  useEffect(() => {
    if (SignedUp) {
      confirmSignup();
      navigation.navigate('Home');
    }
  }, [SignedUp]);
  const handleClick = () => {
    // Dummy for testing
    // signInWithPhoneNumber('+923432616877');

    // This is actual code for phone number verification
    if (phoneNumber.length < 10 || phoneNumber.length > 10) {
      Alert.alert(
        'Invalid Phone Number!',
        'Please enter the number in correct form', );
      return;
    } else if (phoneNumber.length == 10) {
      const phone = '+92' + phoneNumber;
      signInWithPhoneNumber(phone);
    }
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
              <Text className="text-xl text-black">Sign In With Phone Number</Text>
              <View className={` rounded-lg p-3 px-4 mt-3 text-lg items-center flex flex-row`}>
                <Text className="text-xl text-grey pr-2 mt-3 text-gray-700">+92</Text>
                <CTextInput
                  placeholder="f.e 3xx12345678"
                  twClass="p-3 px-4 mt-3 text-lg w-5/6"
                  handleChange={handleChange}
                  keyboardType="numeric"
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
                placeholder="XXXXXX"
                twClass="p-3 px-4 mt-3 text-lg"
                keyboardType="numeric"
                handleChange={handleCode}
              />
              <CButton title={'Confirm Code'} twClass="mt-4"
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
