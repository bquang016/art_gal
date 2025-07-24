// src/components/PaymentMethodCard.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const PaymentMethodCard = ({ method, onConfigure }) => {
    const [isEnabled, setIsEnabled] = useState(method.enabled);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    {method.icon && <Ionicons name={method.icon} size={28} color={method.iconColor || COLORS.primary} />}
                    {method.image && <Image source={method.image} style={styles.image} />}
                    <Text style={styles.title}>{method.name}</Text>
                </View>
                <Switch
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                    thumbColor={isEnabled ? COLORS.white : COLORS.white}
                    onValueChange={toggleSwitch}
                    value={isEnabled}
                />
            </View>
            <Text style={styles.description}>{method.description}</Text>
            <TouchableOpacity 
                style={[styles.button, !method.configurable && styles.buttonDisabled]}
                onPress={() => onConfigure(method)}
                disabled={!method.configurable}
            >
                <Text style={styles.buttonText}>{method.configurable ? 'Cấu hình' : 'Không cần cấu hình'}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    image: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
        marginRight: SIZES.base,
    },
    title: {
        ...FONTS.h3,
        marginLeft: SIZES.base,
    },
    description: {
        ...FONTS.body3,
        color: COLORS.textMuted,
        marginVertical: SIZES.padding,
    },
    button: {
        backgroundColor: COLORS.background,
        paddingVertical: SIZES.base * 1.5,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonDisabled: {
        backgroundColor: COLORS.lightGray,
    },
    buttonText: {
        ...FONTS.h4,
        color: COLORS.textDark,
    },
});

export default PaymentMethodCard;