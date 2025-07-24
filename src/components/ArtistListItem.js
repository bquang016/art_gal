// src/components/ArtistListItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';

const ArtistListItem = ({ item, onViewPaintings, onEdit }) => (
    <View style={styles.container}>
        <View style={styles.infoWrapper}>
            <View style={styles.avatar}>
                <Ionicons name="person-outline" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.contact}><Ionicons name="mail-outline" size={14} /> {item.email}</Text>
                <Text style={styles.contact}><Ionicons name="call-outline" size={14} /> {item.phone}</Text>
            </View>
        </View>
        <View style={styles.footer}>
            <StatusBadge status={item.status} />
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => onEdit(item)} style={styles.button}>
                    <Text style={styles.buttonText}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onViewPaintings(item.name)} style={[styles.button, styles.primaryButton]}>
                    <Text style={[styles.buttonText, styles.primaryButtonText]}>Xem Tranh</Text>
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
        width: 48,
        height: 48,
        borderRadius: 24,
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
        paddingVertical: SIZES.base,
        paddingHorizontal: SIZES.padding,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginLeft: SIZES.base,
    },
    primaryButton: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    buttonText: {
        ...FONTS.body3,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    primaryButtonText: {
        color: COLORS.white,
    },
});

export default ArtistListItem;