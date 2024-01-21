import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import CButton from './custom/CButton';
import { UserContext } from './contexts/UserContext';
import call from 'react-native-phone-call';
import firestore from '@react-native-firebase/firestore';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { RideContext } from './contexts/RideContext';
import { db } from '../firebase';

const UserLoaderInt = ({ navigation, currentRide, updateDropoff, setOnGoingRide, deleteOnGoingRide }) => {

  //chat handling code
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [buttonText, setButtonText] = useState('Start Ride');
  const [isFocused, setIsFocused] = useState(false);
  const [states, setStates] = useState([false, false, false, false]);
  const { user, setUser } = useContext(UserContext);
  const [DocRef, setDocRef] = useState(null);
  const [created, setCreated] = useState(false);
  const { cost, setCost } = useContext(RideContext);
  const { ride, setRide } = useContext(RideContext)
  const [showEnd, setShowEnd] = useState(false);
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
  });


  // let usersid;
  // if (user.photoURL === 'loader') {
  //   usersid = route.params.usersid;
  //   console.log("usersid: ", usersid);
  // }
  // else {
  //   usersid = user.uid;
  // }
  // usersid = user.uid;

  useEffect(() => {
    // console.log('user id', usersid);
    setDocRef(doc(db, currentRide.userId, currentRide.userId));
    // console.log(route.params.usersid,route.params.usersname,route.params.usersphone);
  }, []);
  useEffect(() => {
    //call create interface here
    createinterface();
  }, []);

  const createinterface = async () => {
    console.log('creating interface');
    console.log('user id', currentRide);
    // if you want it to work from loader interface for now then change user.photoURL to loader or do this
    // if (!created) {
    if (user.photoURL === 'user' && !created) {
      const docSnap = await getDoc(DocRef);
      if (docSnap.exists()) {
        console.log('interface already created');
        setCreated(true);
        return;
      }

      else {
        await setDoc(doc(db, currentRide.userId, currentRide.userId), {
          userid: currentRide.userId,
          username: user.displayName,
          loaderid: currentRide.loaderId,
          //update here with currentRide.loadername
          loadername: "Dummy",
          userphone: currentRide.user_phone,
          loaderphone: currentRide.loader_phone,
          messages: [""],
          createdAt: new Date(),
          cost: cost,
          usertransstart: false,
          loadertransstart: false,
          usertransend: false,
          loadertransend: false,
        });
        console.log('interface created');
        setCreated(true);
      }
    }
  };

  const endRide = () => {
    setShowEnd(true);
    setOnGoingRide(null);
    deleteOnGoingRide(currentRide.loaderId, currentRide.userId);
    updateDropoff(currentRide.userId, { latitude: 0, longitude: 0 });
    updateDropoff(currentRide.loaderId, { latitude: 0, longitude: 0 });
    console.log("Ended ride");
  }

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
    if (created) {
      const unsubscribe = firestore()
        .collection(currentRide.userId)
        .doc(currentRide.userId)
        .onSnapshot(snapshot => {
          setNewStates([
            snapshot.data().usertransstart,
            snapshot.data().loadertransstart,
            snapshot.data().usertransend,
            snapshot.data().loadertransend,
          ]);
        });

      return () => unsubscribe();
    }
  }, [created]);
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
      setRide(true);
      updateDropoff(currentRide.loaderId, currentRide.dropoff)
      setButtonText("End Ride")

      const ConfirmDocSnap = await getDoc(DocRef);
      const userdoc = ConfirmDocSnap.data().userid;

      // Get the current state of button from the document data
      const currentConfirm = ConfirmDocSnap.data().usertransstart;

      // if false then set it to true
      if (buttonText === 'Confirm Ride') {
        if (userdoc === currentRide.userId) {
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
        if (userdoc === currentRide.userId) {
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

  useEffect(() => {
    if (created) {
      console.log("new messages listener")
      const unsubscribe = firestore()
        .collection(currentRide.userId)
        .doc(currentRide.userId)
        .onSnapshot(snapshot => {
          const newMessages = snapshot.data().messages.slice(1).map(msg => msg);
          setMessages(newMessages);
        });

      return () => unsubscribe();
    }
  }, []);

  //chat handling code ends here

  const handleChange = text => {
    setText(text);
  };
  const trycall = () => {
    const args = {
      number: user.uid === currentRide.userId ? currentRide.loader_phone : currentRide.user_phone,
      prompt: true,
    };
    call(args).catch(console.error);
  };

  return (
    <View className="mt-[10]">

      {!isFocused && !showEnd ? (
        <View className="ml-7 ">
          <View className="flex flex-row items-center gap-3">
            {/* <View className="w-[50px] h-[50px] bg-gray-200 rounded-full"></View> */}
            <Image source={require(".././imgs/userPFP.png")} style={{ width: 50, height: 50, borderRadius: 100 }} />
            <Text className="text-xl text-[#1a1a1a]">{user != null && user.photoURL != 'user' ? currentRide.userName : currentRide.loaderName}</Text>
          </View>
          <TouchableOpacity
            //Commented because it works for now
            onPress={trycall}
            className="flex-row border border-gray-200 w-[350px] flex justify-between px-5 rounded-lg mt-3">
            <Text className="text-xl text-black mt-3">Call the loader</Text>
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
          {/* <TouchableOpacity
            //Commented because it works for now
            onPress={trycall}
            className="flex-row">
            <Text className="text-xl text-black mt-3 mr-5">Call</Text>
            <View className="rounded-full bg-white p-3 ">
              <Image
                source={require('../imgs/phone_icon.png')}
                style={{ width: 30, height: 30 }}
              />
            </View>
          </TouchableOpacity> */}
          {/* update the chat styling here */}
          {user && user != null ? // adding check for null to avioid error
            <ScrollView className="flex flex-col   w-[350px] gap-y-1 max-h-[200px]" scrollEnabled={true}>

              {messages.map((message, index) =>

                message.userId === user.uid ? (
                  <Text
                    className="text-lg text-white text-right w-auto self-end bg-[#000000] rounded-lg px-3 py-1"
                    key={index}>
                    {message.text}
                  </Text>
                ) : (
                  <Text
                    className="text-lg text-white text-left w-auto self-start bg-[#000000] rounded-lg px-3 py-1"
                    key={index}>
                    {message.text}
                  </Text>
                ),
              )}
            </ScrollView> : <></>}
        </View>
      )}
      <View className="rounded-md flex justify-center items-center z-[-3]">
        <TextInput

          placeholder="Chat with your loader"
          // twClass="p-3 px-4 mt-3 text-lg w-[350]"
          placeholderTextColor={"#97979B"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`border border-[#97979B] rounded-lg p-3 px-4 mt-3 text-lg w-[350] text-black`}
          value={text}
          onChangeText={handleChange}
        />
      </View>
      <View className="flex flex-row flex-wrap justify-center  gap-2 overflow-hidden p-2">
        <View className=" items-center w-[355px] flex justify-center">
          {buttonText === '' ? (
            <></>
          ) : (
            <CButton
              title={buttonText}
              twClass={'z-[-4] w-full ml-2'}
              handlePress={buttonText == 'Confirm Ride' ? confirmRide : endRide}

            />
          )}
          {isFocused && !showEnd ? (
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

          {
            showEnd ?
              (
                <>
                  <Text className="text-xl text-[#1a1a1a]">Total Cost: {currentRide.cost}</Text>
                </>
              ) :
              <></>
          }
        </View>
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
