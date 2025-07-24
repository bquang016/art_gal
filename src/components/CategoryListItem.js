// src/components/CategoryListItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';
import StatusBadge from './StatusBadge';

const CategoryListItem = ({ item, onEdit }) => (
    <View style={styles.container}>
        <View style={styles.infoContainer}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            <View style={styles.footer}>
                <Text style={styles.countText}>Số lượng tranh: {item.paintingCount}</Text>
                <StatusBadge status={item.status} />
            </View>
        </View>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
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
    infoContainer: {
        flex: 1,
    },
    name: {
        ...FONTS.h3,
    },
    description: {
        ...FONTS.body3,
        color: COLORS.textMuted,
        marginVertical: SIZES.base,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    countText: {
        ...FONTS.body4,
        color: COLORS.textMuted,
    },
    editButton: {
        marginLeft: SIZES.padding,
        padding: SIZES.base,
    },
});

export default CategoryListItem;