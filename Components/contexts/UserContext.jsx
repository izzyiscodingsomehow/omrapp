import {useState, useEffect, useContext, createContext} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNetInfo} from '@react-native-community/netinfo';
const UserContext = createContext([]);
const ContextProvider = ({children}) => {
  const { type, isConnected } = useNetInfo();
  const [user, setUser] = useState(null);
  const [AsyncData, setAsyncData] = useState();
  const [LoggedIn, setLoggedIn] = useState(false);
  const [hasData, setHasData] = useState(false);
  // Store in Context API
  return (
    <UserContext.Provider value={{user, setUser,LoggedIn, setLoggedIn,hasData}}>
      {children}
    </UserContext.Provider>
  );
};
export const useData = () => useContext(UserContext);
export {UserContext, ContextProvider};
