import React from 'react'
import { View, Text, Image } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'

const CustomDrawer = (props) => {
    return (
        <>
            <View style={{ flex: 1 }}>

                <DrawerContentScrollView {...props} style={{}} className="">
                    <View style={{ paddingVertical: 15, flex: 1, flexDirection: 'row', alignItems: "center", gap: 15 }} className="border-b border-b-[#D2D3D4] mx-4 mb-2">
                        <Image source={require("../../imgs/userPFP.jpg")} style={{ width: 50, height: 50, borderRadius: 100 }} />
                        <View className="">
                            <Text className="text-[16px] text-black">Jamal Kamal</Text>
                            <Text className="text-[14px]">+92 310 1234567</Text>
                        </View>
                    </View>
                    <DrawerItemList {...props} />
                </DrawerContentScrollView>
                <View className=" px-5 py-3 w-full opacity-60">
                    <Text className="text-left">2023 OMR © All Rights Limited?</Text>
                </View>
            </View>

        </>
    )
}

export default CustomDrawer