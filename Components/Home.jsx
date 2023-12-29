import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Geolocation from '@react-native-community/geolocation'
import SlideView from './custom/SlideView'
import searchIcon from '../imgs/searchIcon.svg'
import DropDownPicker from 'react-native-dropdown-picker'
import CButton from './custom/CButton'
import mapStyle from '../mapStyle.json'
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions'

const Home = () => {

    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0,
    });


    function getCurrentPosition() {
        Geolocation.getCurrentPosition(

            (position) => {
                console.log(position);
                setPosition({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            }
        )
    }


    useEffect(() => {
        // request location access
        // request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        //     .then((result) => {
        //         // user granted location access
        //         if (result == RESULTS.GRANTED) {
        //         }
        //         // user did not grant location access
        //         else {
        //             console.log("Please give permission to access location");
        //         }
        //     })
        //     .catch(err => {
        //         // error handling
        //         console.log(err);
        //     })
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

    const [origin, setOrigin] = useState({
        latitude: 0,
        longitude: 0,
    });

    const [dropOff, setDropOff] = useState({
        latitude: 0,
        longitude: 0,
    });

    // temp origin
    // const origin = {
    //     latitude: 37.7,
    //     longitude: -122.4,
    // };
    // temp destination
    // const destination = {
    //     latitude: 37.9,
    //     longitude: -122.6,
    // };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapView}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            //customMapStyle={mapStyle}
            >
                <Marker coordinate={origin} title='Your location' />
                <Marker coordinate={dropOff} title='Dropoff' />

                <MapViewDirections
                    origin={position}
                    destination={dropOff}
                    apikey='AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4'
                    strokeWidth={2}
                    strokeColor='#1a1a1a'
                />
            </MapView>
            <SlideView>
                <TouchableOpacity
                    onPress={getCurrentPosition}
                    style={{
                        position: "absolute",
                        top: -70,
                        right: 15
                    }}
                >
                    <View className="rounded-full bg-white p-3">
                        <Image source={require('../imgs/currentLocation.png')} style={{ width: 30, height: 30 }} />
                    </View>
                </TouchableOpacity>
                <View className="pt-2 px-4 flex flex-col gap-4 h-[300px] z-[-4]">

                    <View className=" rounded-md flex flex-row justify-evenly items-center w-auto ">
                        {/* PLACEHOLDER FOR TYPES OF VEHICLES */}
                        <View className="flex flex-col justify-center items-center gap-1 w-1/3">
                            <Image source={require('../imgs/pickupIcon.png')} style={{ width: 50 }} />
                            <Text className="text-[17px] text-black">Pickup Truck</Text>
                        </View>
                        <View className="flex flex-col justify-center items-center gap-1 w-1/3">
                            <Image source={require('../imgs/boxTruckIcon.png')} style={{ width: 50 }} />
                            <Text className="text-[17px] text-black">Box Truck</Text>
                        </View>
                        <View className="flex flex-col justify-center items-center gap-1 w-1/3">
                            <Image source={require('../imgs/semiTruckIcon.png')} style={{ width: 55 }} />
                            <Text className="text-[17px] relative bottom-[5] text-black">Semi Truck</Text>
                        </View>
                    </View>

                    <View className="flex">
                        <View className="bg-[#E9E9EA]  rounded-md flex flex-row justify-center items-center relative z-[-2]">
                            <Image source={require('../imgs/searchPNG.png')} style={{ width: 20, marginLeft: 20 }} />
                            {/* <TextInput placeholder='Pickup location' className="w-[70%]  mx-auto text-xl" /> */}
                            <GooglePlacesAutocomplete
                                placeholder='Pickup location'
                                onPress={(data, details = null) => {
                                    // console.log("PICKUP: ", data, details);
                                    if (details) {
                                        const { location } = details.geometry;
                                        console.log("LOCATION: ", location.lat, "\n", location.lng)
                                        setOrigin({
                                            latitude: location.lat,
                                            longitude: location.lng
                                        })
                                    }

                                }}
                                query={{
                                    key: "AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4",
                                    language: 'en'
                                }}
                                styles={{
                                    container: styles.mapsContainer,
                                    textInputContainer: styles.mapsTextInputContainer,
                                    textInput: styles.mapsTextInput,
                                    listView: styles.mapsListView
                                }}
                                fetchDetails={true}
                            />
                            <Image source={require('../imgs/arrowRightPNG.png')} style={{ width: 20, marginRight: 20 }} />
                        </View>
                    </View>
                    <View className="bg-[#E9E9EA]  rounded-md flex flex-row justify-center items-center z-[-3]">
                        <Image source={require('../imgs/searchPNG.png')} style={{ width: 20, marginLeft: 20 }} />
                        {/* <TextInput placeholder='Dropoff location' className="w-[70%]  mx-auto text-xl" /> */}
                        <GooglePlacesAutocomplete
                            placeholder='Dropoff location'
                            onPress={(data, details = null) => {
                                // console.log("DROP: ", data, details);
                                if (details) {
                                    const { location } = details.geometry;
                                    console.log("LOCATION: ", location.lat, "\n", location.lng)
                                    setDropOff({
                                        latitude: location.lat,
                                        longitude: location.lng
                                    })
                                }

                            }}
                            query={{
                                key: "AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4",
                                language: 'en'
                            }}
                            styles={{
                                container: styles.mapsContainer,
                                textInputContainer: styles.mapsTextInputContainer,
                                textInput: styles.mapsTextInput,
                                listView: styles.mapsListView
                            }}
                            fetchDetails={true}
                        />
                        <Image source={require('../imgs/arrowRightPNG.png')} style={{ width: 20, marginRight: 20 }} />
                    </View>
                    <View className="w-auto">
                        <CButton title={"Let's go"} twClass={"z-[-4]"} />
                    </View>

                    {/* REMOVED TYPE OF CARGOS BECAUSE IT MAKES THINGS OVERCOMPLICATED */}

                    {/* <View className="flex flex-row items-center bg-[#E9E9EA] rounded-md">
                        <Image source={require('../imgs/boxIconPNG.png')} style={{ width: 26, marginLeft: 20 }} />
                        <DropDownPicker
                            items={cargoTypes}
                            open={open}
                            setOpen={setOpen}
                            value={value}
                            setValue={setValue}
                            placeholder='Type of cargo'
                            dropDownContainerStyle={{
                                // marginLeft: 16,
                                maxWidth: 330,
                                minWidth: "auto",
                                backgroundColor: "#E9E9EA",
                                borderWidth: 0,
                                padding: 5

                            }}
                            style={{
                                width: 320,
                                borderWidth: 0,
                                backgroundColor: "#E9E9EA",
                                marginLeft: 5
                            }}
                            textStyle={{
                                fontSize: 19,
                                color:"#6A6A6B",
                            }}
                        />
                    </View> */}
                </View>
            </SlideView>
        </View>
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

export default Home
