import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const PaymentMethodCard = ({ method, onConfigure, onToggleSwitch }) => {
    
    // SỬA LẠI LOGIC LẤY LOGO Ở ĐÂY
    const getLogo = (key) => {
        if (key === 'qr_momo') return require('../../assets/images/momo-logo.png');
        if (key === 'qr_zalopay') return require('../../assets/images/zalopay-logo.png');
        return null;
    };
    const imageLogo = getLogo(method.methodKey);

    const iconColor = method.methodKey === 'cash' ? COLORS.success : COLORS.primary;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    {method.methodKey === 'cash' && <Ionicons name="cash-outline" size={28} color={iconColor} />}
                    {method.methodKey === 'qr_bank' && <Ionicons name="qr-code-outline" size={28} color={iconColor} />}
                    {imageLogo && <Image source={imageLogo} style={styles.image} />}
                    <Text style={styles.title}>{method.name}</Text>
                </View>
                <Switch
                    trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                    thumbColor={method.enabled ? COLORS.white : COLORS.white}
                    onValueChange={(newValue) => onToggleSwitch(method, newValue)}
                    value={method.enabled}
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
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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