import React, { useContext } from 'react'
import { View, Text, Image } from 'react-native'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { UserContext } from '../contexts/UserContext';

const CustomDrawer = (props) => {

    const { user, setUser } = useContext(UserContext);

    function formatPhoneNumber(phoneNumber) {
        return phoneNumber.replace(/^(\+92)(\d{3})(\d+)/, '$1 $2 $3');
    }
    let phoneNumber = null;
    if (user) {
        phoneNumber = formatPhoneNumber(user.phoneNumber);
    }

    return (
        <>
            <View style={{ flex: 1 }}>

                <DrawerContentScrollView {...props} style={{}} className="">
                    <View style={{ paddingVertical: 15, flex: 1, flexDirection: 'row', alignItems: "center", gap: 15 }} className="border-b border-b-[#D2D3D4] mx-4 mb-2">
                        <Image source={require("../../imgs/userPFP.png")} style={{ width: 50, height: 50, borderRadius: 100 }} />
                        <View className="">
                            <Text className="text-[16px] text-black">{user ? user.displayName : "Jamal Kamal"}</Text>
                            <Text className="text-[14px]">{phoneNumber ? phoneNumber : "N/A"}</Text>
                        </View>
                    </View>
                    <DrawerItemList {...props} />
                </DrawerContentScrollView>
                <View className=" px-5 py-3 w-full opacity-60">
                    <Text className="text-left">2024 OMR © All Rights Limited</Text>
                </View>
            </View>

        </>
    )
}

export default CustomDrawer