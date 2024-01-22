import {useState, useEffect, useContext, createContext} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import {useNetInfo} from '@react-native-community/netinfo';
import RNRestart from 'react-native-restart';
import {checkMultiple,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,} from 'react-native-permissions';
const UserContext = createContext([]);
const ContextProvider = ({children}, navigation) => {
  const {isConnected} = useNetInfo();
  const [user, setUser] = useState(null);
  //const [AsyncUserData, setAsyncUserData] = useState();
  const [hasData, setHasData] = useState(false);
  const [SignedUp, setSignedUp] = useState(false);
  const [searchingRide, setSearchingRide] = useState(false);
  
  const storeUserData = async () => {
    try {
      if (!hasData) {
        // console.log(hasData);
        const jsonValue = JSON.stringify(user);
        await AsyncStorage.setItem('userdata', jsonValue);
        setHasData(true);
        console.log('storing user data');
      }
    } catch (error) {
      console.log('Error while storing user data: ', error, '\n');
    }
  };
  useEffect(() => {
    checkLocationPermissions();
  }, []);

  const checkLocationPermissions = async () => {
    try {
      const locationPermissionsStatus = await checkMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ]);

      console.log('Fine Location', locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
      console.log('Coarse Location', locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION]);

      // Check individual permission statuses
      if (
        locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
        locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
      ) {
        console.log('Both fine and coarse location permissions granted');
        // Proceed with accessing location here
        return;
      } else {
        // Handle the case where some or all location permissions are not granted
        await requestLocationPermissions();
      }
    } catch (error) {
      console.error('Error checking location permissions:', error);
    }
  };

  const requestLocationPermissions = async () => {
    try {
      const locationPermissionsStatus = await requestMultiple([
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      ]);

      console.log('Fine Location', locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION]);
      console.log('Coarse Location', locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION]);

      // Check individual permission statuses after the request
      if (
        locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
        locationPermissionsStatus[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
      ) {
        console.log('Both fine and coarse location permissions granted after request');
        // Proceed with accessing location here
      } else {
        console.log('Some or all location permissions not granted after request');
        Alert.alert(
          'Permissions Required!',
          'Please allow the necessary permissions for the app to function', 
          [
            {
              text: 'OK.',
              onPress: () => requestLocationPermissions(),
            },
          ]
          );
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  };
  useEffect(() => {
    console.log( 'isConnected: ', isConnected)
    if (isConnected) {
      console.log('Connected to internet!');
    }
    else if (isConnected===false) {
      Alert.alert(
        'No Internet!',
        'The app requires an internet connection.', [
          {
            text: 'Reload App',
            onPress: () => RNRestart.restart(),
          },
        ]);
    }
}, [isConnected]);
  const getUserData = async () => {
    try {
      if (!hasData) {
        console.log('Getting user data');
        const jsonValue = await AsyncStorage.getItem('userdata');
        if (jsonValue != null) {
          console.log('Found user data in AsyncStorage');
          setHasData(true);
          setUser(JSON.parse(jsonValue));
        }
      }
    } catch (error) {
      console.log('Error while getting user data from AsyncStorage: ', error, '\n');
    }
  };
  useEffect(() => {
      if (!user) {
        getUserData();
      }
      if (user) {
        storeUserData();
      }
  }, [user,hasData]);
  // Store in Context API
  return (
    <UserContext.Provider
      value={{user, setUser, hasData, SignedUp, setSignedUp, searchingRide, setSearchingRide}}>
      {children}
    </UserContext.Provider>
  );
};
export const clearAll = async () => {
  try {
    await AsyncStorage.removeItem('userdata');
    console.log('cleared user data async!');
  } catch (e) {
    // clear error
    console.log('did not clear user data async');
  }

  console.log('Done with clearing user async clear.');
};
export const useData = () => useContext(UserContext);
export {UserContext, ContextProvider};
