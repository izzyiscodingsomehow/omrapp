import React from 'react'
import { TextInput,View,Text } from 'react-native'

const CTextInput = ({ placeholder, twClass, handleChange, keyboardType}) => {

    return (
        <TextInput className={`border border-[#97979B] rounded-lg ${twClass}`} placeholder={placeholder} onChangeText={handleChange} keyboardType={keyboardType ? keyboardType : 'default'} />
    )
}

export default CTextInput
