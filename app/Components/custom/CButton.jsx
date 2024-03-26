import React, { useContext } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RideContext } from '../contexts/RideContext';
// Custom Button 
const CButton = ({ title, padding, textColor, twClass, handlePress }) => {

    const {ride, setRide} = useContext(RideContext);
    // stylesheet for custom numbers/properties that tailwind cant handle through props
    const styles = StyleSheet.create({
        container: {
            padding: padding ? Number(padding) : 10,
        },
        text: {
            color: textColor ? textColor : "white",
        }

    })

    // twClass: gets the tailwind classes from the instance and copies them here so they actually work
    // now that i realize, you could just pass the TW classes as props instead of making separate props, oh well i've already coded it out, might as well leave it
    return (
        <TouchableOpacity
            style={styles.container}
            className={`bg-[#131316] px-5 rounded-lg ${twClass ? twClass : null}`}
            onPress={handlePress}
        >

            <Text style={styles.text} className={`text-[18px] font-semibold text-center`}>{title}</Text>
        </TouchableOpacity>
    )
}

export default CButton