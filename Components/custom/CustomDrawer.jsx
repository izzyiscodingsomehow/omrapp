import React from 'react'
import { View, Text, Image } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'

const CustomDrawer = (props) => {
    return (
        <>
            <View style={{ flex: 1 }}>

                <DrawerContentScrollView {...props} style={{}}>
                    <View style={{ paddingVertical: 10, flex: 1, flexDirection: 'row', alignItems: "center", gap: 10 }}>
                        <Image source={require("../../imgs/userPFP.jpg")} style={{ width: 50, height: 50, marginLeft: 15, borderRadius: 100 }} />
                        <View>
                            <Text>Jamal Kamal</Text>
                            <Text>khawajabilal902@gmail.com</Text>
                        </View>
                    </View>
                    <DrawerItemList {...props} />
                </DrawerContentScrollView>
            </View>

        </>
    )
}

export default CustomDrawer