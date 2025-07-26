// src/components/CustomPicker.js
import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    Modal, SafeAreaView, FlatList, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../theme/theme';

const CustomPicker = ({ label, data, selectedValue, onValueChange, placeholder = "Chưa có lựa chọn" }) => {
    const [isModalVisible, setModalVisible] = useState(false);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => {
                onValueChange(item.value);
                setModalVisible(false);
            }}
        >
            <Text style={styles.itemText}>{item.label}</Text>
            {selectedValue === item.value && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
        </TouchableOpacity>
    );
    
    // Tìm nhãn tương ứng với giá trị đã chọn
    const selectedLabel = data.find(item => item.value === selectedValue)?.label || placeholder;

    return (
        <View>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
                <Text style={[styles.pickerButtonText, !selectedValue && styles.placeholderText]}>
                    {selectedLabel}
                </Text>
                <Ionicons name="chevron-down" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>

            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                             <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>{label}</Text>
                                <FlatList
                                    data={data}
                                    renderItem={renderItem}
                                    keyExtractor={item => item.value.toString()}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    label: { ...FONTS.h4, color: COLORS.textMuted, marginBottom: SIZES.base, marginLeft: SIZES.base },
    pickerButton: {
        height: 50,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: SIZES.radius,
        paddingHorizontal: SIZES.padding,
        marginBottom: SIZES.itemSpacing,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    pickerButtonText: {
        ...FONTS.body3,
        color: COLORS.textDark,
    },
    placeholderText: {
        color: COLORS.textMuted,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: '70%',
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius,
        padding: SIZES.padding,
    },
    modalTitle: {
        ...FONTS.h2,
        marginBottom: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
        paddingBottom: SIZES.base,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SIZES.padding,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    itemText: {
        ...FONTS.body3,
        color: COLORS.textDark,
    }
});

export default CustomPicker;