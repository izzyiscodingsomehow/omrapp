import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable, Button } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import firestore from '@react-native-firebase/firestore';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Geolocation from 'react-native-geolocation-service';
import SlideView from './custom/SlideView'
import { RideContext, clearRide } from './contexts/RideContext'
import { endRide } from './contexts/RideContext'
import { UserContext } from './contexts/UserContext'
import UserLoaderInt from './UserLoaderInt'
import { or } from 'firebase/firestore'
import 'firebase/database'
import database, { firebase } from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth';
import { app } from '../firebase'
import { set, update } from 'firebase/database'
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import haversine from 'haversine-distance'

const MAX_RADIUS = 10;
// const auth = firebase.auth();

const Home = () => {

    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0,
    });

    const [notification, setNotification] = useState(null);
    const [showNotification, setShowNotification] = useState(false);
    const [pickupName, setPickupName] = useState(null);
    const [dropoffName, setDropoffName] = useState(null);
    const [ongoingRide, setOngoingRide] = useState(null);
    const [slideViewHeight, setSlideViewHeight] = useState(0);
    const [rideInProgress, setRideInProgress] = useState(false);
    const { cost, setCost } = useContext(RideContext);
    const { user, setUser } = useContext(UserContext);
    const [isLoader, setIsLoader] = useState(false);
    const [pickedUser, setPickedUser] = useState(false);

    // const ref = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref('/users/location')

    const deleteOnGoingRide = (loaderId, userId) => {
        const ref = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref('/ongoing-rides')
        const query = ref.orderByChild('loaderId').equalTo(loaderId);

        query.once('value', (snapshot) => {
            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();

                // Check if the userId also matches
                if (data.userId === userId) {
                    // Remove the node from the database
                    childSnapshot.ref.remove();
                }
            });
        });
    }

    const updateLocation = async (userId, pickup, dropoff) => {
        try {
            await firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`/users/${userId}`).set({
                pickup,
                dropoff,
                role: user.photoURL

            }).then(() => console.log('Data set.'));
            // invertRideState();
        } catch (err) {
            console.log("Firebase database Error: ", err);
        }
    }

    const getActiveLoaders = async () => {
        try {
            const snapshot = await firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref('users').orderByChild('role').equalTo('loader').once('value');
            if (snapshot.exists()) {
                const loaders = await snapshot.val();
                console.log('Loaders: ', loaders);

                const filteredUsers = Object.entries(loaders)
                    .filter(([key, user]) => user.role === 'loader')
                    .reduce((acc, [key, user]) => ({ ...acc, [key]: user }), {});

                // Map over the filtered users, log keys and user data
                Object.entries(filteredUsers).map(async ([key, loader]) => {
                    console.log('User key:', key);
                    console.log('User data:', loader);

                    // check which loaders are near the user
                    const notiRef = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`notifications`);
                    const distance = calculateDistance(origin, loader.pickup);
                    if (distance <= MAX_RADIUS) {
                        console.log(key, " is near the user");
                        await notiRef.child(notiRef.push().key).set({
                            message: `Ride requested by ${user.displayName}`,
                            origin,
                            dropOff,
                            pickupName,
                            dropoffName,
                            loaderId: key,
                            userId: user.uid,
                            user_phone: user.phoneNumber
                        }).then(() => {

                            console.log("sent notification");
                        })

                    }
                    else {
                        console.log("No loaders near user");
                    }

                });

            }
            else {
                console.log('No loaders found');
            }
        } catch (err) {
            console.log("Error while fetching active loaders: ", err);
        }
    }

    function watchUsersLocation() {
        Geolocation.watchPosition(

            async (position) => {
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
                updateLocation(user.uid, origin, dropOff);

                let dist = calculateDistance(origin, dropOff);

                if (dist < 1) {
                    console.log("he is near");
                }
                else {
                    console.log("he is not near");
                }
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

    const calculateDistance = (user, loader) => {
        console.log(user, loader);
        const distance = ((haversine(user, loader) / 1000) * 400) / 1000 // getting distance in meters and converting to kilometers;
        console.log("Distance: ", distance);
        return distance;

    }

    const [newcost, setNewCost] = useState(0);
    let check = 0;


    useEffect(() => {
        //write code for getting cost doc from firebase
        const unsubscribe = firestore()
            .collection("Cost")
            .doc("cost-current")
            .onSnapshot(snapshot => {
                setNewCost(snapshot.data().cost);
                check = snapshot.data().cost;
            });

        return () => unsubscribe();
    }, []);


    const handleDirectionsReady = (result) => {
        setCost(result.distance * newcost);
    };


    useEffect(() => {
        console.log("COST in use: ", cost);
    }, [cost]);


    // weird name i know, but this just checks if the user is the loader and updates his dropoff location
    const changeLocationWhenRide = (userId) => {

        const usersRef = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users`);

        // Query the database using the user's UID
        const userQuery = usersRef.child(userId);

        // Use the 'once' method to retrieve data once
        userQuery.once('value')
            .then(async (snapshot) => {
                if (snapshot.exists()) {
                    // Data found, update the state
                    // setUserData(snapshot.val());
                    console.log("here is the user: ", snapshot.val());

                    if (snapshot.val().role == 'loader') {
                        setIsLoader(true);
                        if (!pickedUser) {
                            await updateDropoff(userId, ongoingRide.pickup)

                        }
                        else {
                            await updateDropoff(userId, ongoingRide.dropoff)
                        }

                    }


                } else {
                    // No data found for the given UID
                    // setUserData(null);
                }
            })
            .catch((error) => {
                console.error('Error fetching user data:', error);
            });

    }

    const updateDropoff = async (userId, dropoff) => {
        const ref = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`users/${userId}`);

        await ref.update({
            dropoff
        }).then(() => {
            console.log("updated dropoff");
            setDropOff(dropoff)
        })
    }

    useEffect(() => {
        const loaderIdToFilter = user.uid;

        // Reference to the 'ongoing-rides' node
        const ongoingRidesRef = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref('ongoing-rides');

        // Event listener for value changes
        const onValueChange = async (snapshot) => {
            let ride = null;

            await snapshot.forEach((childSnapshot) => {
                // Check if loaderId matches the condition
                if (user.photoURL == 'loader') {
                    console.log("OK SO HERE YOU ARE: ", childSnapshot.val().loaderId);
                    if (childSnapshot.val().loaderId == loaderIdToFilter) {
                        ride = {
                            key: childSnapshot.key,
                            ...childSnapshot.val(),
                        };
                    }
                }
                else {
                    if (childSnapshot.val().userId == loaderIdToFilter) {
                        ride = {
                            key: childSnapshot.key,
                            ...childSnapshot.val(),
                        };
                    }
                }
            });
            setOngoingRide(ride);
            changeLocationWhenRide(ongoingRide.loaderId)
        };

        // Add the listener
        ongoingRidesRef.on('value', onValueChange);
        console.log("this is the current ride: ", ongoingRide);
        setRideInProgress(true);
        if (ongoingRide != null) {
            setRegion({
                latitude: ongoingRide.pickup.latitude,
                longitude: ongoingRide.pickup.longitude,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
            })
            setOrigin({
                latitude: ongoingRide.pickup.latitude,
                longitude: ongoingRide.pickup.longitude,
            })
            setDropOff({
                latitude: ongoingRide.dropoff.latitude,
                longitude: ongoingRide.dropoff.longitude,
            })
        }
        // Clean up the listener when the component is unmounted
        return () => ongoingRidesRef.off('value', onValueChange);
    }, [rideInProgress]);


    useEffect(() => {
        //Geolocation.requestAuthorization();
        // getCurrentPosition();
        watchUsersLocation();
        // console.log("POSITION: ", position);

        const onNotificationUpdate = async snapshot => {
            const data = await snapshot.val();
            setNotification(data);
            // console.log("the noti is running");
            // console.log("noti data: ", notification, " with id: ", notification.userId);
            if (notification != null) {

                Object.entries(notification).map(async ([key, user]) => {
                    console.log("Loader: ", user.loaderId, " and User:", user.userId);
                })
                setShowNotification(true);
            }
        };

        const notificationsRef = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`notifications`); // Replace 'user1' with the user's ID

        notificationsRef.orderByChild('loaderId').equalTo(user.uid).on('value', onNotificationUpdate);

        // Return a cleanup function to unsubscribe when the component unmounts
        // checkForOnGoingRides();
        return () => notificationsRef.off('value', onNotificationUpdate);

    }, [origin, showNotification]);

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
        // console.log("HERES USER: ", user)
        updateLocation(user.uid, origin, dropOff);
        // setRide(x => !x);
        getActiveLoaders();
    }

    const deleteRideNotification = (key) => {
        const ref = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`/notifications/${key}`);
        ref.remove()
            .then(() => {
                console.log('successfully deleted notification of the ride');
            }).catch(err => {
                console.log("ERROR: while deleting notification: ", err);
            })

    }


    const exchangeData = async (ride) => {

        const data = notification[ride];
        console.log("ACCEPTINGGG", data);

        const loader_phone = await auth().currentUser.phoneNumber;

        const ref = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref('ongoing-rides');
        try {
            await ref.child(ref.push().key).set({
                userId: data.userId,
                loaderId: data.loaderId,
                pickup: data.origin,
                dropoff: data.dropOff,
                pickupName: data.pickupName,
                dropoffName: data.dropoffName,
                loaderLocation: origin,
                rideType: "truck",
                cost,
                user_phone: data.user_phone,
                loader_phone

            }).then(() => {
                deleteRideNotification(ride)
                console.log('New ride started')
            });
            // invertRideState();
        } catch (err) {
            console.log("Firebase database Error: ", err);
        }

    }

    const handleAction = (key) => {
        // Handle the action (e.g., mark the notification as read)
        // Update the database accordingly
        setShowNotification(false);
        exchangeData(key);
        // console.log(user.uid, " accepted the ride of ", notification);
    };

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
                    onReady={handleDirectionsReady}
                />
            </MapView>
            {showNotification && (

                <View className="absolute top-10 flex flex-col gap-y-2 w-5/6 self-center rounded">
                    {notification != null ?
                        (
                            Object.entries(notification).map(([key, user]) => (
                                <View key={key} className="bg-white rounded px-3 py-3">
                                    <Text className="text-lg" >{user.message}</Text>
                                    <Text className="text-md" >Pickup: {user.pickupName}</Text>
                                    <Text className="text-md" >Dropoff: {user.dropoffName}</Text>
                                    <View className="flex gap-x-2 flex-row mt-2 self-end ">
                                        <TouchableOpacity
                                            // onPress={() => {
                                            //     handleAction
                                            // }}
                                            className="bg-[#ffffff] px-3 border border-[#1a1a1a] rounded py-1"
                                        >
                                            <Text className="text-lg text-[#1a1a1a]">Decline</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                handleAction(key)
                                            }}
                                            className="bg-[#1a1a1a] px-4 rounded py-1"
                                        >
                                            <Text className="text-lg text-white">Accept</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                            ))
                        )
                        :
                        null
                    }
                </View>
            )
            }


            <SlideView >
                {
                    ongoingRide ?
                        <UserLoaderInt currentRide={ongoingRide} updateDropoff={updateDropoff} setOnGoingRide={setOngoingRide} deleteOnGoingRide={deleteOnGoingRide} />
                        // <Text>Loading</Text>
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
                                                setPickupName(data.description);
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
                                            setDropoffName(data.description);
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
                                {cost != check ? <Text className="text-[20px] text-black">Fare: {cost} PKR</Text> : null}
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
        </View >
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
