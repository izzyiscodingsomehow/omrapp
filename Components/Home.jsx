import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'
import Geolocation from '@react-native-community/geolocation'
import SlideView from './custom/SlideView'

const Home = () => {

    const [position, setPosition] = useState({
        latitude: 0,
        longitude: 0,
    });

    function getCurrentPosition() {
        Geolocation.getCurrentPosition(

            (position) => {
                console.log(position.coords);
                setPosition({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                })
            },
            (error) => {
                // See error code charts below.
                console.log(error.code, error.message);
            },
            {
                enableHighAccuracy: true, timeout: 15000, maximumAge: 10000
            }
        )
    }

    useEffect(() => {
        getCurrentPosition();

    }, []);

    // temp region
    const [region, setRegion] = useState({
        latitude: 37.7,
        longitude: -122.4,
        latitudeDelta: 0.09,
        longitudeDelta: 0.04,
    });

    // temp origin
    const origin = {
        latitude: 37.7,
        longitude: -122.4,
    };
    // temp destination
    const destination = {
        latitude: 37.9,
        longitude: -122.6,
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapView}
                region={region}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
            >
                <Marker coordinate={position} title='origin' />
                <Marker coordinate={destination} title='destination' />

                <MapViewDirections
                    origin={position}
                    destination={destination}
                    apikey='AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4'
                    strokeWidth={2}
                    strokeColor='#1a1a1a'
                />
            </MapView>
            <SlideView>
                <Text>Hello there</Text>
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
    }
})

export default Home
