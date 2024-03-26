import {View, Text, Image, Alert} from 'react-native';
import React, {useEffect, useState, useContext} from 'react';
import CButton from './custom/CButton';
import SlideView from './custom/SlideView';
import CTextInput from './custom/CTextInput';
import auth from '@react-native-firebase/auth';
import {UserContext} from './contexts/UserContext';
import CLoader from './custom/CLoader';
const Login = ({navigation, route}) => {
  const settings = auth().settings;
  useEffect(() => {
    settings.appVerificationDisabledForTesting = false;
  }, []);

  const {user, setUser} = useContext(UserContext);
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [twilioState, setTwilioState] = useState(false);

  const handleChange = text => {
    setPhoneNumber(text);
  };
  const handleCode = text => {
    setCode(text);
  };
  const onAuthStateChanged = user => {
    if (user) {
      // User is signed in
      setUser(user);
      console.log('User is signed in!');
    } else {
      // User is signed out
      console.log('User is signed out!');
      setUser(null);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = auth().onAuthStateChanged(onAuthStateChanged);

    // Unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  //change the function here to the verification one

  let otp;
  const twilioSystem = () => {
    console.log("twilio system activated");
    fetch('http://localhost:3000',{
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },

    }).then(response => {
      if (response.status == 200) {
        response.json().then(data => {
          otp = data.otp;
          setTwilioState(true);
          console.log('OTP:', otp);
        });
      } else {
        console.log('Error:', response.status);
      }
    });
  };

  const handleOTP = async () => {
    if (twilioState) {
      if (code == otp) {
        console.log('OTP verified');
        // navigation.navigate('SignUp');
        auth()
          .signInAnonymously()
          .then(() => {
            console.log('User signed in anonymously');
            if (!auth().currentUser.displayName) {
              console.log('new user');
              navigation.navigate('SignUp');
            }
            else{
              setUser(auth().currentUser);
              setConfirm(null);
              setCode('');
              setTwilioState(false);
            }
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        Alert.alert(
          'Invalid OTP!',
          'The verification code from SMS/TOTP is invalid. Please check and enter the correct verification code again.',
        );
      }
    } else {
      try {
        await confirm.confirm(code).then(userInfo => {
          // auto code await confirm.confirm('123654').then(userInfo => {
          //userInfo.additionalUserInfo.isNewUser = true;
          if (!userInfo?.user?.displayName) {
            console.log('new user');
            navigation.navigate('SignUp');
            //setConfirm(null);
            //in signup update user info and then set async data "ASYNC DATA STORAGE CALLS GET DATA ALWAYS"and login the user
          } else {
            console.log('old user', userInfo);
            setUser(userInfo.user);
            setConfirm(null);
            setCode('');
            //set async user data and in get data set user state and login the user
          }
        });
      } catch (e) {
        console.log(e);
        Alert.alert(
          'Invalid OTP!',
          'The verification code from SMS/TOTP is invalid. Please check and enter the correct verification code again.',
        );
      }
    }
  };
  useEffect(() => {
    if (user) {
      navigation.navigate('Home');
    }
  }, [user]);

  const handleClick = () => {
    // Dummy for testing
    // signInWithPhoneNumber('+923432616877');

    // This is actual code for phone number verification
    if (phoneNumber.length < 10 || phoneNumber.length > 10) {
      Alert.alert(
        'Invalid Phone Number!',
        'Please enter the number in correct form',
      );
      return;
    }
    if (phoneNumber.length == 10) {
      const phone = '+92' + phoneNumber;
      signInWithPhoneNumber(phone);
    }
  };
  const [loading, setLoading] = useState(false);
  const signInWithPhoneNumber = async phoneNumber => {
    try {
      // Set loading to true while waiting for response
      setLoading(true);

      // Make the API call
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      // Once the response is received, set loading to false and update the state
      setLoading(false);
      setConfirm(confirmation);
    } catch (error) {
      // Handle errors here
      console.error('Error occurred:', error);
      setLoading(false);
      twilioSystem();
    }
  };

  return (
    <>
      {loading ? (
        <CLoader />
      ) : (
        <>
          {!confirm || !twilioState ? (
            <View className="flex-1 items-center justify-center text-xl bg-white">
              {/* OMR logo */}
              <Image
                source={require('../imgs/OMR.png')}
                width={50}
                height={50}
              />

              {/* earth background */}
              <Image
                source={require('../imgs/earthBg.png')}
                width={50}
                height={50}
                //style={styles.backgroundImage}
              />

              <SlideView className="" twClass="h-72">
                <View className="p-5">
                  <Text className="text-xl text-black">
                    Sign In With Phone Number
                  </Text>
                  <View
                    className={
                      ' rounded-lg p-3 px-4 mt-3 text-lg items-center flex flex-row'
                    }>
                    <Text className="text-xl text-grey pr-2 mt-3 text-gray-700">
                      +92
                    </Text>
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
              <Image
                source={require('../imgs/OMR.png')}
                width={50}
                height={50}
              />

              {/* earth background */}
              <Image
                source={require('../imgs/earthBg.png')}
                width={50}
                height={50}
              />

              <SlideView className="" twClass="h-60">
                <View className="p-5">
                  <Text className="text-xl text-black">Enter OTP</Text>
                  <CTextInput
                    placeholder="XXXXXX"
                    twClass="p-3 px-4 mt-3 text-lg z-100"
                    keyboardType="numeric"
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
      )}
    </>
  );
};
export default Login;
