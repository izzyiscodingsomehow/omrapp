import React, { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import MapView, { Marker } from 'react-native-maps'
import MapViewDirections from 'react-native-maps-directions'

const Home = () => {

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
                <Marker coordinate={origin} title='origin' />
                <Marker coordinate={destination} title='destination' />

                <MapViewDirections
                    origin={origin}
                    destination={destination}
                    apikey='AIzaSyBzkP_jIc71HLCelXc5UtgNZu1jhFIs9Q4'
                    strokeWidth={2}
                    strokeColor='#1a1a1a'
                />
            </MapView>
            <Text>Home</Text>
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
