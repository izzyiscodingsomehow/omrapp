import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, Text, TextInput, View, Image, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Geolocation from '@react-native-community/geolocation'
import SlideView from './custom/SlideView'
import searchIcon from '../imgs/searchIcon.svg'
import DropDownPicker from 'react-native-dropdown-picker'
import CButton from './custom/CButton'
import CTextInput from './custom/CTextInput'
import mapStyle from '../mapStyle.json'
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions'
import { UserContext } from './contexts/UserContext'
import call from 'react-native-phone-call'
import firestore from '@react-native-firebase/firestore';
import { doc, updateDoc,setDoc,getDoc } from "firebase/firestore";
import { db } from '../firebase';

const UserLoaderInt = () => {

    //chat handling code
    const[msgs, setMsgs] = useState([]);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const { user, setUser } = useContext(UserContext);
    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0,
    });
    const updateMessage = async () => {
      try {
        // Get a reference to the document
        const messageDocRef = doc(db, user.user.uid, user.user.uid);
    
        // Fetch the current data of the document
        const messageDocSnap = await getDoc(messageDocRef);
    
        // Check if the document exists
        if (messageDocSnap.exists()) {
          // Get the current array of messages from the document data
          const currentMessages = messageDocSnap.data().messages || [];
    
          // Append the new message to the array
          const newMessage = {
            userId: user.user.uid,
            text: text, // Assuming text is a variable containing the new message text
          };
    
          const updatedMessages = [...currentMessages, newMessage];
    
          // Update the document with the modified array
          await updateDoc(messageDocRef, {
            messages: updatedMessages,
          });
    
          // Clear the text input
          setText('');
        } else {
          console.log('Document does not exist.');
        }
      } catch (error) {
        console.error('Error updating message:', error);
      }
    };
    const [slideViewHeight, setSlideViewHeight] = useState(0);

    useEffect(() => {
        const unsubscribe = firestore()
            .collection(user.user.uid)
            .doc(user.user.uid)
            .onSnapshot((snapshot) => {
                const newMessages = snapshot.data().messages.map((msg) => msg);
                setMessages(newMessages);
            });

        return () => unsubscribe();
    }, []);

    const createinterface = async () => {
      console.log("user", user.user.uid);
      await setDoc(doc(db, user.user.uid, user.user.uid), {
            userid: user.user.uid,
            loaderid: "loader",
            messages: [{ id:user.user.uid, text}],
            createdAt: new Date(),
            cost: 0,
            transstart:false,
            transend:false,
      });
    };
    //chat handling code ends here


    const handleChange = text => {
        setText(text)
    };
    const trycall = () => {
        const args = {
            number: user.phoneNumber,
            prompt: true,
        };
        call(args).catch(console.error);
    }
    

    function getCurrentPosition() {
        Geolocation.getCurrentPosition(

            (position) => {
                console.log("get curr", position);
                setOrigin({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
                setRegion({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                })
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 2000, maximumAge: 1000 }

        )
    }

    useEffect(() => {
        Geolocation.requestAuthorization();
        getCurrentPosition();
        console.log("POSITION: ", position);
    }, []);

    // temp region
    const [region, setRegion] = useState({
        latitude: 31.5497,
        longitude: 74.358,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
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
        <>
            {!isFocused ? (
                <View className="ml-7">
                    <Text className="text-xl text-black">
                        Name: {user.displayName}
                    </Text>
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
                    <View className="border flex flex-col w-80">
                    {messages.map((message, index) => (
                      message.userId === user.user.uid ?
                        <Text className="text-lg text-black text-right w-auto self-end" key={index}>{message.text}</Text>
                        :
                        <Text className="text-lg text-black text-left w-auto self-start" key={index}>{message.text}</Text>
                    ))}
                    </View>
                </View>
            )
            }
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
                    <CButton
                        title={'Confirm'}
                        twClass={'z-[-4]'}
                      //  handlePress={createinterface}
                    />
                </View>
                {isFocused ? (<View className=" items-center p-2 ml-5">
                    <CButton
                        title={'Send'}
                        twClass={'z-[-4] w-[100]'}
                        handlePress={updateMessage}
                    />
                </View>) : (<View></View>)}
            </View>
        </>
    )
}
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
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        top: 0,
        left: 0,

    },
    mapsTextInput: {
        position: "relative",
        top: 2,
        backgroundColor: "transparent",
        color: "black",
        zIndex: 1

    },
    mapsTextInputContainer: {
        color: "black",
        zIndex: 1
    },
    mapsListView: {
        backgroundColor: "red",
        position: "absolute",
        top: 50,
        zIndex: 12

    }
})

export default UserLoaderInt
