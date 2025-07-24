import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const COLORS = {
    primary: '#F97B22',
    primaryHover: '#d96a1e',
    background: '#f8f9fa', // Màu nền sáng hơn một chút
    white: '#ffffff',
    black: '#000000',
    textDark: '#212529',
    textMuted: '#6c757d',
    success: '#198754',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#0dcaf0',
    lightGray: '#dee2e6',
    border: '#ced4da',
};

export const SIZES = {
    // Kích thước cơ bản
    base: 8,
    font: 14,
    radius: 12,
    padding: 16, // Giảm padding chung cho mobile
    itemSpacing: 16,

    // Kích thước font
    largeTitle: 34,
    h1: 28,
    h2: 22,
    h3: 18,
    h4: 16,
    body1: 18,
    body2: 16,
    body3: 14,
    body4: 12,

    // Kích thước màn hình
    width,
    height,
};

export const FONTS = {
    largeTitle: { fontFamily: 'System', fontSize: SIZES.largeTitle, lineHeight: 41 },
    h1: { fontFamily: 'System', fontSize: SIZES.h1, fontWeight: 'bold', lineHeight: 36 },
    h2: { fontFamily: 'System', fontSize: SIZES.h2, fontWeight: 'bold', lineHeight: 30 },
    h3: { fontFamily: 'System', fontSize: SIZES.h3, fontWeight: 'bold', lineHeight: 22 },
    h4: { fontFamily: 'System', fontSize: SIZES.h4, fontWeight: 'bold', lineHeight: 22 },
    body1: { fontFamily: 'System', fontSize: SIZES.body1, lineHeight: 36 },
    body2: { fontFamily: 'System', fontSize: SIZES.body2, lineHeight: 30 },
    body3: { fontFamily: 'System', fontSize: SIZES.body3, lineHeight: 22 },
    body4: { fontFamily: 'System', fontSize: SIZES.body4, lineHeight: 22 },
};

const appTheme = { COLORS, SIZES, FONTS };

export default appTheme;