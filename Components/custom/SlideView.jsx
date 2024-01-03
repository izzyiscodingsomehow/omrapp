import React, { useRef, useState } from 'react'
import { View,  StyleSheet, PanResponder, Dimensions, Animated } from 'react-native';

// that one view which is visible but you can also slide it up for more details (its in the login and home UI)
const SlideView = ({ height, children }) => {

    const screenHeight = Dimensions.get('window').height;
    const [yHeight, setYHeight] = useState(new Animated.Value(screenHeight * 0.5));
    let animatedHeight = useRef(yHeight).current; 

    const animateHeight = (height) =>{
    
      Animated.timing(animatedHeight, {
        toValue: height,
        duration: 100,
        useNativeDriver: true,
      }).start();
    }

    const styles = StyleSheet.create({
        container: {
            height: height ? Number(height) : screenHeight,
        }
    })

    let newY;
    const panResponder = useRef(

      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {

        newY = gestureState.dy;

      },

      onPanResponderRelease: () => {
        
        if(newY < -50){
          animateHeight(screenHeight * 0.3);
        }
        else if(newY > 0){
          animateHeight(screenHeight * 0.5);
        }

      }

    })).current;


    return (

        <Animated.View style={[styles.container, {transform: [{translateY : animatedHeight}] }]}  {...panResponder.panHandlers} className="mt-5 w-full rounded-t-3xl absolute bottom-0 pb-5 shadow-lg bg-white ">
            <View className="bg-[#97979B] opacity-50 w-1/5 h-[4px] rounded-full mx-auto mt-3 mb-5"></View>
            {children}
        </Animated.View>

    )
}

export default SlideView;
