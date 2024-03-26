import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';

const CLoader = () => {
    return (
        <View className="flex-1 items-center text-xl bg-white">
          {/* OMR logo */}
          <Image
            source={require('../../imgs/OMR.png')}
            width={50}
            height={50}
            //style={styles.backgroundImage}
            className="mb-10 mt-40"
            />
          {/* earth background */}
          
          <ProgressBar
                indeterminate={true}
                width={200}
                color={'#000000'}
                style={styles.progress}
                
            />
          <Image source={require('../../imgs/earthBg.png')} width={50} height={50} className="absolute bottom-[-100]"/>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        backgroundColor: '#4d4d4d',
        zIndex: 1,
        marginBottom: 450,
    },
});
export default CLoader;