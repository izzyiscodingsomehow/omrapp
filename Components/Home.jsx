import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
// import Geolocation from '@react-native-community/geolocation'
import Geolocation from 'react-native-geolocation-service';
import SlideView from './custom/SlideView'
import { RideContext, clearRide } from './contexts/RideContext'
import { endRide } from './contexts/RideContext'
import { UserContext } from './contexts/UserContext'
import UserLoaderInt from './UserLoaderInt'
import { or } from 'firebase/firestore'
import haversine from 'haversine-distance'
// import firebase from 'firebase/app'
import 'firebase/database'
import database, { firebase } from '@react-native-firebase/database'
import { app } from '../firebase'
import { update } from 'firebase/database'

const Home = () => {

    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0,
    });

    const ref = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref('/users/location')

    const updateLocation = async (userId, pickup, dropoff) => {
        try {
            await firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`/users/location/${userId}`).set({
                pickup,
                dropoff
            }).then(() => console.log('Data set.'));
            // invertRideState();
        } catch (err) {
            console.log("Firebase database Error: ", err);
        }
    }

    const [slideViewHeight, setSlideViewHeight] = useState(0);
    const { ride, setRide } = useContext(RideContext);
    const { cost, setCost } = useContext(RideContext);    
    const { user, setUser } = useContext(UserContext);

    function watchUsersLocation() {
        Geolocation.watchPosition(

            async (position) => {
                console.log(position);
                setOrigin({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })

                // setRegion({
                //     latitude: position.coords.latitude,
                //     longitude: position.coords.longitude,
                //     latitudeDelta: 0.05,
                //     longitudeDelta: 0.05,
                // })
                updateLocation(user.uid, origin, dropOff);
            },
            (error) => {
                console.log("ERROR CODE: ", error.code, "MESSAGE: ", error.message);
            },
            {
                enableHighAccuracy: true,
                interval: 500,
                fastestInterval: 250
            }

        )
    }
    useEffect(() => {
        if(origin.latitude != 0 && origin.longitude != 0 && dropOff.latitude != 0 && dropOff.longitude != 0){
            const distance = (haversine(origin, dropOff)/1000)*400;
            console.log("DISTANCE: ", distance);
            setCost(distance*400);
        }
    }, [origin, dropOff]);
    useEffect(() => {
        Geolocation.requestAuthorization();
        // getCurrentPosition();
        watchUsersLocation();
        console.log("POSITION: ", position);

    }, [origin]);

    // temp region
    const [region, setRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const [origin, setOrigin] = useState({
        latitude: 0,
        longitude: 0,
    });

    const [dropOff, setDropOff] = useState({
        latitude: 0,
        longitude: 0,
    });

    const invertRideState = () => {
        console.log("HERES USER: ", user)
        updateLocation(user.uid, origin, dropOff);
        // setRide(x => !x);
    }

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
                    origin={origin}
                    destination={dropOff}
                    apikey='AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4'
                    strokeWidth={2}
                    strokeColor='#1a1a1a'
                />
            </MapView>

            <SlideView >
                {
                    !ride ?
                        <UserLoaderInt />
                        :
                        <>
                            <TouchableOpacity
                                onPress={watchUsersLocation}
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
                            <View onLayout={(event) => slideViewHeight == 0 ? setSlideViewHeight(event.nativeEvent.layout.height) : null} className=" pt-2 px-4 flex flex-col gap-4 z-[-4]">

                                <View className=" rounded-md flex flex-row justify-evenly items-center w-auto">
                                    <View className="flex flex-col justify-center items-center gap-1 w-1/3 bg-gray-100 rounded">
                                        <Image source={require('../imgs/pickupIcon.png')} style={{ width: 50 }} />
                                        <Text className="text-[15px] text-black pb-3">Pickup Truck</Text>
                                    </View>
                                    <View className="flex flex-col justify-center items-center gap-1 w-1/3 bg-gray-100 rounded">
                                        <Image source={require('../imgs/boxTruckIcon.png')} style={{ width: 50 }} />
                                        <Text className="text-[15px] text-black pb-3">Box Truck</Text>
                                    </View>
                                    <View className="flex flex-col justify-center items-center gap-1 w-1/3 bg-gray-100 rounded">
                                        <Image source={require('../imgs/semiTruckIcon.png')} style={{ width: 55 }} />
                                        <Text className="text-[15px] relative bottom-[5] text-black pb-1">Semi Truck</Text>
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
                                                    setRegion({
                                                        latitude: location.lat,
                                                        longitude: location.lng,
                                                        latitudeDelta: 0.05,
                                                        longitudeDelta: 0.05,
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
                                                setRegion({
                                                    latitude: location.lat,
                                                    longitude: location.lng,
                                                    latitudeDelta: 0.09,
                                                    longitudeDelta: 0.05,
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
                                <View className="w-auto ">
                                    <Pressable onPress={invertRideState} className="">
                                        <View className={`bg-[#131316] px-5 rounded-lg z-[-4] p-[10px]`}>
                                            <Text className={`text-[18px] font-semibold text-center text-white`}>Let's go</Text>
                                        </View>
                                    </Pressable>
                                </View>

                            </View>
                        </>

                }
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
        color: "black"
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
        color: "black"

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
        backgroundColor: "white",
        position: "absolute",
        top: 50,
        zIndex: 12,
        color: "black"

    }
})

export default Home
