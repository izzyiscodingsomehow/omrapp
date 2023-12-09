import React from 'react'
import { View, Text, StyleSheet } from 'react-native';

// that one view which is visible but you can also slide it up for more details (its in the login and home UI)
const SlideView = ({ height }) => {

    const styles = StyleSheet.create({
        container:{
            height: height ? Number(height) : 200,
        }
    })
    return (

        // WIP
        <View style={styles.container} className="mt-5 w-full rounded-t-lg relative bottom-0 left-0 shadow-xl bg-white">
            <View className="bg-[#1a1a1a] opacity-50 w-1/5 h-[4px] rounded-full mx-auto mt-3 mb-5"></View>
            <Text className="text-center">Hello world</Text>
        </View>

    )
}

export default SlideView;