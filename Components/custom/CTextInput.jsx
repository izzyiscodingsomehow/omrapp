import React from 'react'
import { TextInput,View,Text } from 'react-native'

const CTextInput = ({ placeholder, twClass,handleChange}) => {

    return (
        <TextInput className={`border border-[#97979B] rounded-lg ${twClass}`} placeholder={placeholder} onChangeText={handleChange} keyboardType='numeric' />
    )
}

export default CTextInput