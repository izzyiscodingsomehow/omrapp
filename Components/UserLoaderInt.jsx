import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import SlideView from './custom/SlideView';
import searchIcon from '../imgs/searchIcon.svg';
import DropDownPicker from 'react-native-dropdown-picker';
import CButton from './custom/CButton';
import CTextInput from './custom/CTextInput';
import mapStyle from '../mapStyle.json';
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { UserContext } from './contexts/UserContext';
import call from 'react-native-phone-call';
import firestore from '@react-native-firebase/firestore';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { RideContext } from './contexts/RideContext';
import { db } from '../firebase';

const UserLoaderInt = ({ navigation }) => {

  //chat handling code
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('Confirm Ride');
  const [isFocused, setIsFocused] = useState(false);
  const [states, setStates] = useState([false, false, false, false]);
  const { user, setUser } = useContext(UserContext);
  const [DocRef, setDocRef] = useState(null);
  const [created, setCreated] = useState(false);
  const { cost, setCost } = useContext(RideContext);
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
  });

  let usersid;
  if (user.photoURL === 'loader') {
    usersid = route.params.usersid;
    console.log("usersid: ", usersid);
  }
  else {
    usersid = user.uid;
  }
  usersid = user.uid;

  useEffect(() => {
    console.log('user id', usersid);
    setDocRef(doc(db, usersid, usersid));
    // console.log(route.params.usersid,route.params.usersname,route.params.usersphone);
  }, []);
  // email handling code
  //   const sendEmail = async () => {
  //     const ConfirmDocSnap = await getDoc(DocRef);
  //     const userdoc = ConfirmDocSnap.data();
  //     try {
  //         const response = await fetch('https://your-firebase-project-id.cloudfunctions.net/sendEmail', {
  //             method: 'POST',
  //             headers: {
  //             'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({
  //             userdoc: {
  //                 username: userdoc.username,
  //                 loadername: userdoc.loadername,
  //                 userphone: userdoc.loaderphone,
  //                 loaderphone: userdoc.loaderphone,
  //                 createdAt: userdoc.createdAt,
  //                 cost: userdoc.cost,
  //             },
  //             }),
  //         });

  //         if (response.ok) {
  //             console.log('Email sent successfully');
  //         } else {
  //             console.error('Failed to send email');
  //         }
  //         } catch (error) {
  //         console.error('Error:', error);
  //         }
  //   };

  const setNewStates = newStates => {
    setStates(newStates);
  };
  useEffect(() => {
    const unsubscribe = firestore()
      .collection(usersid)
      .doc(usersid)
      .onSnapshot(snapshot => {
        setNewStates([
          snapshot.data().usertransstart,
          snapshot.data().loadertransstart,
          snapshot.data().usertransend,
          snapshot.data().loadertransend,
        ]);
      });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    if (states) {
      if (!states[0] && !states[1] && !states[2] && !states[3]) {
        setButtonText('Confirm Ride');
        console.log('confirm ride state');
      } else if (states[0] && states[1] && !states[2] && !states[3]) {
        setButtonText('End Ride');
        console.log('ride started state');
      } else if (states[0] && states[1] && states[2] && states[3]) {
        setButtonText('');
        navigation.navigate('Home');
        console.log('ride ended state');
      }
    }
  }, [states]);

  const confirmRide = async () => {
    try {
      // Fetch the current data of the document
      const ConfirmDocSnap = await getDoc(DocRef);
      const userdoc = ConfirmDocSnap.data().userid;

      // Get the current state of button from the document data
      const currentConfirm = ConfirmDocSnap.data().usertransstart;

      // if false then set it to true
      if (buttonText === 'Confirm Ride') {
        if (userdoc === usersid) {
          await updateDoc(DocRef, {
            usertransstart: true,
          });
        } else {
          await updateDoc(DocRef, {
            loadertransstart: true,
          });
        }
        console.log('confirm ride');
      } else if (buttonText === 'End Ride') {
        if (userdoc === usersid) {
          await updateDoc(DocRef, {
            usertransend: true,
          });
        } else {
          await updateDoc(DocRef, {
            loadertransend: true,
          });
        }
        console.log('end ride');
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };
  const updateMessage = async () => {
    try {
      // Fetch the current data of the document
      const messageDocSnap = await getDoc(DocRef);

      // Get the current array of messages from the document data
      const currentMessages = messageDocSnap.data().messages || [];

      // Append the new message to the array
      const newMessage = {
        userId: user.uid,
        text: text, // Assuming text is a variable containing the new message text
      };

      const updatedMessages = [...currentMessages, newMessage];

      // Update the document with the modified array
      await updateDoc(DocRef, {
        messages: updatedMessages,
      });

      // Clear the text input
      setText('');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };
  const [slideViewHeight, setSlideViewHeight] = useState(0);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection(usersid)
      .doc(usersid)
      .onSnapshot(snapshot => {
        const newMessages = snapshot.data().messages.slice(1).map(msg => msg);
        setMessages(newMessages);
      });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    //call create interface here
    createinterface();
  }, []);
  const createinterface = async () => {
    setButtonText('Confirm Ride');
    console.log('user', user.uid);
    if (user.photoURL === 'user' && !created) {
      await setDoc(doc(db, usersid, usersid), {
        userid: usersid,
        username: user.displayName,
        loaderid: route.params.usersid,
        loadername: route.params.usersname,
        userphone: user.phoneNumber,
        loaderphone: route.params.usersphone,
        messages: [""],
        createdAt: new Date(),
        cost: cost,
        usertransstart: false,
        loadertransstart: false,
        usertransend: false,
        loadertransend: false,
      });
    }
    console.log('interface created');
    setCreated(true);
  };
  //chat handling code ends here

  const handleChange = text => {
    setText(text);
  };
  const trycall = () => {
    const args = {
      number: user.phoneNumber,
      prompt: true,
    };
    call(args).catch(console.error);
  };

  function getCurrentPosition() {
    Geolocation.getCurrentPosition(
      position => {
        console.log('get curr', position);
        setOrigin({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setRegion({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      },
      error => {
        // See error code charts below.
        console.log(error.code, error.message);
      },
      { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 },
    );
  }

  useEffect(() => {
    Geolocation.requestAuthorization();
    getCurrentPosition();
    console.log('POSITION: ', position);
  }, []);

  // temp region
  const [region, setRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // pickup location
  const [origin, setOrigin] = useState({
    latitude: 0,
    longitude: 0,
  });

  // dropoff location
  const [dropOff, setDropOff] = useState({
    latitude: 0,
    longitude: 0,
  });

  return (
    <View className="mt-[10]">
      {!isFocused ? (
        <View className="ml-7 ">
          <Text className="text-xl text-black">Name: {user.displayName}</Text>
          <TouchableOpacity
            //Commented because it works for now
            // onPress={trycall}
            className="flex-row">
            <Text className="text-xl text-black mt-3 mr-5">Call</Text>
            <View className="rounded-full bg-white p-3 ">
              <Image
                source={require('../imgs/phone_icon.png')}
                style={{ width: 30, height: 30 }}
              />
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="ml-7">
          <TouchableOpacity
            //Commented because it works for now
            // onPress={trycall}
            className="flex-row">
            <Text className="text-xl text-black mt-3 mr-5">Call</Text>
            <View className="rounded-full bg-white p-3 ">
              <Image
                source={require('../imgs/phone_icon.png')}
                style={{ width: 30, height: 30 }}
              />
            </View>
          </TouchableOpacity>
          <View className="flex flex-col w-80">
            {messages.map((message, index) =>
              message.userId === user.uid ? (
                <Text
                  className="text-lg text-white text-right w-auto self-end bg-[#000000] rounded-lg p-2"
                  key={index}>
                  {message.text}
                </Text>
              ) : (
                <Text
                  className="text-lg text-white text-left w-auto self-start bg-[#000000] rounded-lg p-2"
                  key={index}>
                  {message.text}
                </Text>
              ),
            )}
          </View>
        </View>
      )}
      <View className="rounded-md flex justify-center items-center z-[-3]">
        <TextInput
          placeholder="Chat with your loader"
          // twClass="p-3 px-4 mt-3 text-lg w-[350]"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`border border-[#97979B] rounded-lg p-3 px-4 mt-3 text-lg w-[350]`}
          value={text}
          onChangeText={handleChange}
        />
      </View>
      <View className="flex flex-row flex-wrap content-center items-center gap-2 overflow-hidden p-2">
        <View className=" items-center p-2 ml-5">
          {buttonText === '' ? (
            <></>
          ) : (
            <CButton
              title={buttonText}
              twClass={'z-[-4]'}
              handlePress={confirmRide}
            />
          )}
        </View>
        {isFocused ? (
          <View className=" items-center p-2 ml-5">
            <CButton
              title={'Send'}
              twClass={'z-[-4] w-[100]'}
              handlePress={updateMessage}
            />
          </View>
        ) : (
          <View></View>
        )}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mapView: {
    ...StyleSheet.absoluteFillObject,
  },
  mapsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    top: 0,
    left: 0,
  },
  mapsTextInput: {
    position: 'relative',
    top: 2,
    backgroundColor: 'transparent',
    color: 'black',
    zIndex: 1,
  },
  mapsTextInputContainer: {
    color: 'black',
    zIndex: 1,
  },
  mapsListView: {
    backgroundColor: 'red',
    position: 'absolute',
    top: 50,
    zIndex: 12,
  },
});

export default UserLoaderInt;
