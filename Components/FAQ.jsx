import React from 'react'
import Markdown from '@ronradtke/react-native-markdown-display';
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    ScrollView,
} from "react-native";
import { faqText } from '../Texts/FAQ';

const FAQ = () => {
    const bodyText = faqText;
    return (
        <>
            <ScrollView>
                <View >
                    <View className="mt-12 p-4">
                        <Markdown
                            style={{
                                body: { fontSize: 17, color: "black" }
                            }}>
                            {bodyText}
                        </Markdown>
                    </View>
                </View>
            </ScrollView>
        </>
    )
}

export default FAQ