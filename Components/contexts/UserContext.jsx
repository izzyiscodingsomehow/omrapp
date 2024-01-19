import {useState, useEffect, useContext, createContext} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import {useNetInfo} from '@react-native-community/netinfo';
import RNRestart from 'react-native-restart';
const UserContext = createContext([]);
const ContextProvider = ({children}, navigation) => {
  const {isConnected} = useNetInfo();
  const [user, setUser] = useState(null);
  //const [AsyncUserData, setAsyncUserData] = useState();
  const [hasData, setHasData] = useState(false);
  const [SignedUp, setSignedUp] = useState(false);
  
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
      value={{user, setUser, hasData, SignedUp,setSignedUp}}>
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
