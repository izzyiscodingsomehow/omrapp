import React, { useEffect, useState, useContext } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
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

const UserLoaderInt = () => {

    const handleChange = text => {
        console.log(text);
    };
    const trycall = () => {
        const args = {
            number: user.phoneNumber,
            prompt: true,
        };
        call(args).catch(console.error);
    }
    const { user, setUser } = useContext(UserContext);
    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0,
    });

    const [slideViewHeight, setSlideViewHeight] = useState(0);

    function getCurrentPosition() {
        Geolocation.getCurrentPosition(

            (position) => {
                console.log(position);
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
            <View onLayout={(event) => slideViewHeight == 0 ? setSlideViewHeight(event.nativeEvent.layout.height) : null} className="ml-7">
                <Text className="text-xl text-black">Name: {user.displayName}</Text>
                <TouchableOpacity
                    //Commented because it works for now
                    // onPress={trycall}
                    className="flex-row"
                >
                    <Text className="text-xl text-black mt-3 mr-5">Call</Text>
                    <View className="rounded-full bg-white p-3 ">
                        <Image source={require('../imgs/phone_icon.png')} style={{ width: 30, height: 30 }} />
                    </View>
                </TouchableOpacity>
            </View>
            <View className="rounded-md flex justify-center items-center z-[-3]">
                <CTextInput
                    placeholder="Chat with your loader"
                    twClass="p-3 px-4 mt-3 text-lg w-[350]"
                    handleChange={handleChange}
                />
            </View>
            <View className=" items-center p-2 ml-5">
                <CButton title={"Confirm"} twClass={"z-[-4]"} />
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
