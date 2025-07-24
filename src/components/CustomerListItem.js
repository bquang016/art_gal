// src/components/CustomerListItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';

const CustomerListItem = ({ item, onEdit, onViewHistory }) => (
    <View style={styles.container}>
        <View style={styles.infoWrapper}>
            <View style={styles.avatar}>
                <Ionicons name="person-circle-outline" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.contact}>{item.phone}</Text>
            </View>
        </View>
        <View style={styles.footer}>
            <StatusBadge status={item.status} />
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.button}>
                    <Ionicons name="create-outline" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onViewHistory(item)} style={[styles.button, { marginLeft: SIZES.base }]}>
                    <Ionicons name="time-outline" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    infoWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: `${COLORS.primary}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.padding,
    },
    info: {
        flex: 1,
    },
    name: {
        ...FONTS.h3,
    },
    contact: {
        ...FONTS.body3,
        color: COLORS.textMuted,
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: SIZES.padding,
        paddingTop: SIZES.padding,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    actions: {
        flexDirection: 'row',
    },
    button: {
        padding: SIZES.base,
    },
});

export default CustomerListItem;