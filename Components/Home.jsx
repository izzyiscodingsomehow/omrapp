import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity, Pressable } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import Geolocation from 'react-native-geolocation-service';
import SlideView from './custom/SlideView'
import { UserContext } from './contexts/UserContext'
import UserLoaderInt from './UserLoaderInt'
import 'firebase/database'
import { firebase } from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth';
import haversine from 'haversine-distance'
import { formatPhoneNumber } from './custom/CustomDrawer';
import { BackHandler } from 'react-native';
import Geocoder from 'react-native-geocoding';

const MAX_RADIUS = 10;

const Home = ({ navigation }) => {
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
    //const { cost, setCost } = useContext(RideContext);
    const { user, setUser } = useContext(UserContext);
    const [isLoader, setIsLoader] = useState(false);
    const [pickedUser, setPickedUser] = useState(false);
    const { searchingRide, setSearchingRide } = useContext(UserContext);
    const [toggleOrigin, setToggleOrigin] = useState(false);
    const [toggleDropoff, setToggleDropoff] = useState(false);

    //Prevents user from going back to login screen after logging in
    // const navigation = useNavigation();

    useEffect(() => {
        const handleBackButton = () => {
            // Your custom logic here
            // Returning true will prevent the default goBack behavior
            return true;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackButton);

        return () => {
            // Remove the event listener when the component unmounts
            backHandler.remove();
        };
    }, [navigation]);

    // check if two objects are equal or not
    const deepEqual = (obj1, obj2) => {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) {
            return false;
        }

        for (const key of keys1) {
            const val1 = obj1[key];
            const val2 = obj2[key];

            if (typeof val1 === 'object' && typeof val2 === 'object') {
                if (!deepEqual(val1, val2)) {
                    return false;
                }
            } else if (val1 !== val2) {
                return false;
            }
        }

        return true;
    };

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

            }).then(() => {
                console.log('Current location pushed to database!');
            })
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
                // console.log('Loaders: ', loaders);

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
                            user_phone: user.phoneNumber,
                            userName: user.displayName
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

    function moveToCurrentLocation() {
        // Manually update the region when the button is pressed
        Geolocation.getCurrentPosition(
            async (position) => {
                const currentRegion = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setRegion(currentRegion);
                // You can also update other state variables like origin here if needed
            },
            (error) => {
                console.log("ERROR CODE: ", error.code, "MESSAGE: ", error.message);
            },
            {
                enableHighAccuracy: true,
            }
        );
    }


    function watchUsersLocation() {
        console.log('hereeeeee');
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

                await updateLocation(user.uid, { latitude: position.coords.latitude, longitude: position.coords.longitude }, dropOff);

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

    //const [newcost, setNewCost] = useState(0);
    let check = 0;


    // useEffect(() => {
    //     //write code for getting cost doc from firebase
    //     const unsubscribe = firestore()
    //         .collection("Cost")
    //         .doc("cost-current")
    //         .onSnapshot(snapshot => {
    //             setNewCost(snapshot.data().cost);
    //             check = snapshot.data().cost;
    //         });

    //     return () => unsubscribe();
    // }, []);


    // const handleDirectionsReady = (result) => {
    //     setCost(result.distance * newcost);
    // };


    // useEffect(() => {
    //     // console.log("COST in use: ", cost);
    // }, [cost]);


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
                    // console.log("here is the user: ", snapshot.val());

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
            await setOngoingRide(ride);
            await changeLocationWhenRide(ongoingRide.loaderId)
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

    function filterByLoaderId(obj, loaderIdToKeep) {
        const result = {};

        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object') {
                if (obj[key].loaderId === loaderIdToKeep) {
                    result[key] = obj[key];
                } else {
                    const nestedResult = filterByLoaderId(obj[key], loaderIdToKeep);
                    if (Object.keys(nestedResult).length > 0) {
                        result[key] = nestedResult;
                    }
                }
            }
        }

        return result;
    }
    const notificationsRef = firebase.app().database('https://omr-app-93d29-default-rtdb.asia-southeast1.firebasedatabase.app/').ref(`notifications`); // Replace 'user1' with the user's ID

    useEffect(() => {
        //Geolocation.requestAuthorization();
        // getCurrentPosition();
        watchUsersLocation();
        // console.log("POSITION: ", position);

        const onNotificationUpdate = async snapshot => {
            const data = await snapshot.val();
            // console.log('data: ', data, 'noti: ', notification);;

            // if (notification != data) {
            // console.log('insdie notis');
            setNotification(data);
            setShowNotification(true);
            if (notification != null) {

                Object.entries(notification).map(async ([key, user]) => {
                    console.log("Loader: ", user.loaderId, " and User:", user.userId);
                })
            }

        };
        // check for null
        if (user != null) {
            notificationsRef.orderByChild('loaderId').equalTo(user.uid).on('value', onNotificationUpdate);
        }

        // Return a cleanup function to unsubscribe when the component unmounts

        return () => notificationsRef.off('value', onNotificationUpdate);

    }, [origin, region, showNotification, notification, notificationsRef]);

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
        setSearchingRide(true);
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
                userName: data.userName,
                loaderLocation: origin,
                rideType: "truck",
                //cost,
                user_phone: data.user_phone,
                loader_phone,
                loaderName: user.displayName

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
    };

    const onLocationSelect = (event) => {
        if (toggleOrigin) {
            Geocoder.from(event.nativeEvent.coordinate.latitude, event.nativeEvent.coordinate.longitude)
                .then(json => {
                        var addressComponent = json.results[0].address_components[0];
                        console.log("ADDRESS: ", addressComponent);
                        //setOrigin(addressComponent);
                })
                .catch(error => console.warn(error));
            console.log("toggle",event.nativeEvent.coordinate);
            setToggleOrigin(false);
            setOrigin({ latitude: event.nativeEvent.coordinate.latitude, longitude: event.nativeEvent.coordinate.longitude });
        }
        else if (toggleDropoff) {
            // Geocoder.from(event.nativeEvent.coordinate.latitude, event.nativeEvent.coordinate.longitude)
            //     .then(json => {
            //             var addressComponent = json.results[0].address_components[0];
            //             setOrigin(addressComponent);
            //     })
            //     .catch(error => console.warn(error));
            console.log(event.nativeEvent.coordinate);
            setToggleDropoff(false);
            setDropOff({ latitude: event.nativeEvent.coordinate.latitude, longitude: event.nativeEvent.coordinate.longitude });
        }
        else {
            console.log("Not in select mode");
        }
    }

    const handleCustomOptionPress = () => {
        // Handle selection of the custom option
        console.log("Custom option selected: Home");
    };
    const renderCustomOption = () => {
        return (
            <TouchableOpacity onPress={handleCustomOptionPress}>
                <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                    <Text style={{ fontSize: 16 }}>Select location on map</Text>
                </View>
            </TouchableOpacity>
        );
    };
    
    Geocoder.init("AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4");
    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapView}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                onPress={onLocationSelect}
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
                // onReady={handleDirectionsReady}
                />
            </MapView>
            {showNotification && (

                <View className="absolute top-10 flex flex-col gap-y-2 w-5/6 self-center rounded">
                    {notification != null ?
                        (
                            Object.entries(notification).map(([key, user]) => (
                                <View key={key} className="bg-white rounded px-3 py-3">
                                    <Text className="text-lg text-[#1a1a1a]" >{user.message}</Text>
                                    <Text className="text-md text-[#5a5a5a]" >Pickup: {user.pickupName}</Text>
                                    <Text className="text-md text-[#5a5a5a]" >Dropoff: {user.dropoffName}</Text>
                                    <View className="flex gap-x-2 flex-row mt-2 self-end ">
                                        <TouchableOpacity
                                            onPress={() => {
                                                deleteRideNotification(key)
                                            }}
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

            {/* Add your custom tailwind classes to twClass*/}
            <SlideView twClass={`2/5 ${toggleOrigin || toggleDropoff ? "hidden" : null}`}>
                {
                    ongoingRide ?
                        <UserLoaderInt currentRide={ongoingRide} updateDropoff={updateDropoff} setOnGoingRide={setOngoingRide} deleteOnGoingRide={deleteOnGoingRide} />
                        // <Text>Loading</Text>
                        :
                        user && user.photoURL == 'loader' ?
                            <>
                                <Pressable
                                    onPress={() => moveToCurrentLocation()}
                                    style={{
                                        position: "absolute",
                                        top: -70,
                                        right: 15
                                    }}
                                >
                                    <View className="rounded-full bg-white p-3">
                                        <Image source={require('../imgs/currentLocation.png')} style={{ width: 30, height: 30 }} />
                                    </View>
                                </Pressable>
                                <View className="flex flex-col px-7">
                                    <View className="flex flex-row items-center gap-3">
                                        {/* <View className="w-[50px] h-[50px] bg-gray-200 rounded-full"></View> */}
                                        <Image source={require(".././imgs/userPFP.png")} style={{ width: 50, height: 50, borderRadius: 100 }} />
                                        <View>
                                            <Text className="text-xl text-[#1a1a1a]">{user ? user.displayName : "You"}</Text>
                                            <Text className="text-lg text-[#6a6a6a]">{user ? formatPhoneNumber(user.phoneNumber) : "You"}</Text>
                                        </View>
                                    </View>
                                    <Text className="mt-5 border rounded-lg border-[#8a8a8a] px-5 text-xl py-2 text-center text-[#6a6a6a]">Waiting for a rider</Text>
                                </View>
                            </>
                            :

                            <>
                                <Pressable
                                    onPress={() => moveToCurrentLocation()}
                                    style={{
                                        position: "absolute",
                                        top: -70,
                                        right: 15
                                    }}
                                >
                                    <View className="rounded-full bg-white p-3">
                                        <Image source={require('../imgs/currentLocation.png')} style={{ width: 30, height: 30 }} />
                                    </View>
                                </Pressable>
                                <View onLayout={(event) => slideViewHeight == 0 ? setSlideViewHeight(event.nativeEvent.layout.height) : null} className={`pt-2 flex flex-col px-4 gap-4 z-[4]`}>
                                    <View className="flex">
                                        <View className="bg-[#E9E9EA]  rounded-md flex flex-row justify-center items-center relative z-[2]">
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
                                                // renderRow={}
                                                // predefinedPlaces={["Select location on map"]}
                                                renderRow={(rowData, sessionToken, isHighlighted) => (
                                                    // <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
                                                    <Text style={{ fontSize: 16 }}>{rowData.description}</Text>
                                                    // </View>
                                                )}
                                                fetchDetails={true}
                                                renderCustomRow={(rowData, sessionToken, isHighlighted) => (
                                                    <View>
                                                        {renderCustomOption()}
                                                    </View>
                                                )}
                                                query={{
                                                    key: "AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4",
                                                    language: 'en'
                                                }}
                                                styles={{
                                                    container: styles.mapsContainer,
                                                    textInputContainer: styles.mapsTextInputContainer,
                                                    textInput: styles.mapsTextInput,
                                                    listView: styles.mapsListView,
                                                    description: { color: '#1a1a1a' }
                                                }}
                                            />
                                            {/* <Image source={require('../imgs/pin.png')} style={{ width: '30px', height: '30px', borderWidth: 1, margin: 0 }} /> */}
                                            <Pressable className="opacity-40" onPress={() => setToggleOrigin(true)} >
                                                <Image source={require('../imgs/pin.png')} style={{ borderWidth: 1, top: 0, marginRight: 20 }} />
                                            </Pressable>
                                        </View>
                                    </View>
                                    <View className="bg-[#E9E9EA]  rounded-md flex flex-row justify-center items-center z-[1]">
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
                                                listView: styles.mapsListView,
                                                description: { color: '#1a1a1a' }
                                            }}
                                            fetchDetails={true}
                                        />
                                        <Pressable className="opacity-40" onPress={() => setToggleOrigin(true)} >
                                            <Image source={require('../imgs/pin.png')} style={{ borderWidth: 1, top: 0, marginRight: 20 }} />
                                        </Pressable>
                                        {/* <Image source={require('../imgs/arrowRightPNG.png')} style={{ width: 20, marginRight: 20 }} /> */}
                                    </View>
                                    <Pressable onPress={invertRideState} className="ml-2 z-0"  disabled={searchingRide ? true : false}>
                                        <View className={`${searchingRide ? "bg-slate-200" : "bg-[#131316]"} px-5 rounded-lg p-[10px]`}>
                                            <Text className={`text-[18px] font-semibold text-center text-white `}>{searchingRide ? "Finding a loader" : "Let's go"}</Text>
                                        </View>
                                    </Pressable>

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
        zIndex: 100,
        top: 0,
        left: 0,
        color: "black",
        // borderWidth: 1

    },
    mapsTextInput: {
        position: "relative",
        top: 2,
        backgroundColor: "transparent",
        color: "black",
        zIndex: 100,


    },
    mapsTextInputContainer: {
        color: "black",
        zIndex: 100,

        // maxHeight: 50,
    },
    mapsListView: {
        backgroundColor: "white",
        position: "absolute",
        top: 50,
        zIndex: 100,
        color: "red"

    }
})

export default Home
