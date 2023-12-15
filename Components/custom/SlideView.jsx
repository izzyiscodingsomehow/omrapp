import React from 'react'
import { View, Text, StyleSheet } from 'react-native';

// that one view which is visible but you can also slide it up for more details (its in the login and home UI)
const SlideView = ({ height, children }) => {
    const styles = StyleSheet.create({
        container: {
            height: height ? Number(height) : "auto",
        }
    })

    return (

        <View style={styles.container} className="mt-5 w-full rounded-t-3xl absolute bottom-0 pb-5 shadow-lg bg-white ">
            <View className="bg-[#97979B] opacity-50 w-1/5 h-[4px] rounded-full mx-auto mt-3 mb-5"></View>
            {children}
        </View>

    )
}

export default SlideView;