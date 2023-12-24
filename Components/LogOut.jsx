import React, {useEffect, useContext} from 'react';
import { View } from 'react-native';
import auth from '@react-native-firebase/auth';
import { UserContext } from './contexts/UserContext';
import { clearAll } from './contexts/UserContext';
const LogOut = ({ navigation }) => {
  const {LoggedIn, setLoggedIn} = useContext(UserContext);
  const {user, setUser} = useContext(UserContext);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
        auth().signOut().then(() => console.log('User signed out!'));
        setLoggedIn(false);
        setUser(null);
        console.log('logout');
        navigation.navigate('Login');
        clearAll();
    });
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  return <View />;
}
export default LogOut