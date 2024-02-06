import { useState, useEffect, useContext, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetInfo } from '@react-native-community/netinfo';

const RideContext = createContext([]);

const RideContextProvider = ({ children }, navigation) => {

    const { type, isConnected } = useNetInfo();
    const [ride, setRide] = useState(false);
    //const [cost, setCost] = useState(0);
    //const [AsyncUserData, setAsyncUserData] = useState();
    // const [hasData, setHasData] = useState(false);

    //TODO:  update the async state of the ride as well after testing
    
    const checkRideStatus = async () => {
        try {
            console.log('Getting ride status');
            const asyncStatus = await AsyncStorage.getItem('rideStatus')
            if (asyncStatus) {
                // const jsonValue = await AsyncStorage.getItem('rideStatus');
                if (asyncStatus != null || '') {
                    console.log('Ride status was found: ', asyncStatus);
                    //   setHasData(true);
                    setRide(Boolean(asyncStatus));
                }
            }
            else {
                console.log('Could not find ride status in AsyncStorage');
                AsyncStorage.setItem('rideStatus', 'false');
                checkRideStatus();
            }
        } catch (error) {
            console.log('Error while getting ride status: ', error, '\n');
        }
    };

    useEffect(() => {
        checkRideStatus();
    }, [])

    // clearRide();

    return (
        <RideContext.Provider
            value={{ ride, setRide,
            //cost,setCost,
            }}>
            {children}
        </RideContext.Provider>
    );
};

export const startRide = () => {
    AsyncStorage.setItem('rideStatus', 'true');
}

export const endRide = () => {
    AsyncStorage.setItem('rideStatus', 'false');
}

export const clearRide = async () => {
    try {
        await AsyncStorage.removeItem('rideState');
        console.log('Ride has ended / been cancelled!');
    } catch (e) {
        // clear error
        console.log('Could not end / cancel ride');
    }

    console.log('Ride async process done!');
};


export const useData = () => useContext(RideContext);
export { RideContext, RideContextProvider };
