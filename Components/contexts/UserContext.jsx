import {useState, useEffect, useContext, createContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from '@react-native-community/netinfo';
import {get} from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
const UserContext = createContext([]);
const ContextProvider = ({children}, navigation) => {
  const {type, isConnected} = useNetInfo();
  const [user, setUser] = useState(null);
  //const [AsyncUserData, setAsyncUserData] = useState();
  const [LoggedIn, setLoggedIn] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [SignedUp, setSignedUp] = useState(false);
  const storeUserData = async () => {
    try {
      if (!hasData) {
        console.log(hasData);
        const jsonValue = JSON.stringify(user);
        await AsyncStorage.setItem('userdata', jsonValue);
        setHasData(true);
        console.log('storedata');
      }
    } catch (error) {
      console.log('storedata Error: ', error, '\n');
    }
  };

  const getUserData = async () => {
    try {
      if (!hasData) {
        console.log('getdata1');
        const jsonValue = await AsyncStorage.getItem('userdata');
        if (jsonValue != null) {
          console.log('getdata2');
          setHasData(true);
          setUser(JSON.parse(jsonValue));
          setLoggedIn(true);
        }
      }
    } catch (error) {
      console.log('getdata Error: ', error, '\n');
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
      value={{user, setUser, LoggedIn, setLoggedIn, hasData, SignedUp,setSignedUp}}>
      {children}
    </UserContext.Provider>
  );
};
export const clearAll = async () => {
  try {
    await AsyncStorage.removeItem('userdata');
    console.log('cleared async!');
  } catch (e) {
    // clear error
    console.log('did not clear async');
  }

  console.log('Done.');
};
export const useData = () => useContext(UserContext);
export {UserContext, ContextProvider};
