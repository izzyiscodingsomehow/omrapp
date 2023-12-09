import React from 'react'
import { TextInput } from 'react-native'

const CTextInput = ({ placeholder, twClass }) => {

    return (
        <TextInput className={`border border-[#97979B] rounded-lg ${twClass}`} placeholder={placeholder} />
    )
}

export default CTextInput