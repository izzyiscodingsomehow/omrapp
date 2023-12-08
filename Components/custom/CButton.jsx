import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

// Custom Button 
const CButton = ({ title, padding, textColor, twClass }) => {

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
        <TouchableOpacity style={styles.container} className={`bg-[#131316] px-5 rounded-lg ${twClass ? twClass : null}`}>
            <Text style={styles.text} className={`text-[16px]`}>{title}</Text>
        </TouchableOpacity>
    )
}

export default CButton