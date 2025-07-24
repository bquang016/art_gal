// src/api/mockApi.js

// Dữ liệu từ dashboard.js
const kpiData = {
    totalOrders: 31862,
    totalRevenue: 1380000000,
    inventory: 450,
    profit: 517500000
};

const salesData = {
    week: { labels: ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'], data: [8.5, 11.2, 9.8, 14.5, 12.0, 15.3, 12.55] },
};

const proportionData = {
    category: {
        labels: ['Sơn dầu', 'Trừu tượng', 'Sơn mài', 'Phong cảnh'],
        data: [45, 25, 15, 15]
    },
};

// Dữ liệu từ quan-ly-tranh.js
const samplePaintings = [
    { id: 'p1', name: 'Chiều hoàng hôn', artist: 'Văn Cao', importPrice: 6000000, sellingPrice: 12000000, category: 'Phong cảnh', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1569783721365-4a634b3563a6?q=80&w=870', status: 'Đang bán' },
    { id: 'p2', name: 'Mảnh ghép', artist: 'Bùi Xuân Phái', importPrice: 12000000, sellingPrice: 25500000, category: 'Trừu tượng', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1531816434923-a07a75309328?q=80&w=774', status: 'Đang bán' },
    { id: 'p3', name: 'Phố cổ về đêm', artist: 'Bùi Xuân Phái', importPrice: 228000000, sellingPrice: 450000000, category: 'Phong cảnh', material: 'Sơn dầu', image: 'https://images.unsplash.com/photo-1599409353922-22c6a1eaf3e5?q=80&w=870', status: 'Đang bán' },
    { id: 'p4', name: 'Dòng chảy', artist: 'Lê Phổ', importPrice: 90000000, sellingPrice: 180000000, category: 'Trừu tượng', material: 'Màu nước', image: 'https://images.unsplash.com/photo-1502908813589-54315f6c9a35?q=80&w=870', status: 'Dừng bán' },
];

// Dữ liệu từ quan-ly-hoa-si.js
const sampleArtists = [
    { id: 'HS01', name: 'Văn Cao', phone: '0901234567', email: 'vancao@email.com', address: '123 Phố Huế, Hà Nội', joinDate: '2022-01-15', status: 'Đang hợp tác' },
    { id: 'HS02', name: 'Bùi Xuân Phái', phone: '0912345678', email: 'buixuanphai@email.com', address: '45 Nguyễn Du, Hà Nội', joinDate: '2021-11-20', status: 'Đang hợp tác' },
    { id: 'HS03', name: 'Lê Phổ', phone: '0923456789', email: 'lepho@email.com', address: '78 Hàng Bông, Hà Nội', joinDate: '2023-03-10', status: 'Đang hợp tác' },
];

// Dữ liệu từ quan-ly-don-hang.js
const sampleOrders = [
    {
        id: 'DH001', customer: 'Anh Nam', employee: 'Admin', date: '25-06-2025', total: 450000000, status: 'Hoàn thành',
        products: [{ name: 'Phố cổ về đêm', artist: 'Bùi Xuân Phái', price: 450000000 }]
    },
    {
        id: 'DH002', customer: 'Chị Lan', employee: 'Admin', date: '26-06-2025', total: 106000000, status: 'Đang xử lý',
        products: [
            { name: 'Chiều hoàng hôn', artist: 'Văn Cao', price: 12000000 },
            { name: 'Sen hạ', artist: 'Mai Trung Thứ', price: 88000000 }
        ]
    },
];


const sampleCustomers = [
    { id: 'KH001', name: 'Anh Nam', phone: '0987654321', email: 'anhnam@email.com', address: '123 Đường Láng, Đống Đa, Hà Nội', status: 'Hoạt động' },
    { id: 'KH002', name: 'Chị Lan', phone: '0912345678', email: 'chilan@email.com', address: '45 Hai Bà Trưng, Hoàn Kiếm, Hà Nội', status: 'Hoạt động' },
    { id: 'KH003', name: 'Anh Tuấn', phone: '0934567890', email: 'anhtuan@email.com', address: '78 Cầu Giấy, Cầu Giấy, Hà Nội', status: 'Dừng hoạt động' },
];

const samplePurchaseHistory = {
    'KH001': [{ id: 'DH001', date: '25-06-2025', total: 450000000, status: 'Hoàn thành' }],
    'KH002': [{ id: 'DH002', date: '26-06-2025', total: 106000000, status: 'Đang xử lý' }],
    'KH003': [], // Anh Tuấn chưa có lịch sử mua hàng
};

const sampleAccounts = [
    { id: 'acc01', username: 'admin', employeeName: 'Quang Đẹp Zai', email: 'admin@artgallery.com', role: 'Admin', status: 'Hoạt động' },
    { id: 'acc02', username: 'nhanvien1', employeeName: 'Nguyễn Văn A', email: 'nhanvien1@artgallery.com', role: 'Nhân viên', status: 'Hoạt động' },
    { id: 'acc03', username: 'nhanvien2', employeeName: 'Lê Thị B', email: 'nhanvien2@artgallery.com', role: 'Nhân viên', status: 'Dừng hoạt động' },
];

const sampleCategories = ['Sơn dầu', 'Trừu tượng', 'Phong cảnh', 'Sơn mài', 'Chân dung'];
const sampleMaterials = ['Sơn dầu', 'Màu nước', 'Sơn mài', 'Acrylic', 'Lụa'];

const sampleImports = [
    { 
        id: 'PN001', artistName: 'Văn Cao', employeeName: 'Admin', date: '2025-06-20', totalValue: 6000000, status: 'Đã hoàn tất', 
        products: [{ name: 'Chiều hoàng hôn', quantity: 1, price: 6000000 }]
    },
    { 
        id: 'PN002', artistName: 'Bùi Xuân Phái', employeeName: 'Admin', date: '2025-06-22', totalValue: 240000000, status: 'Đã hoàn tất', 
        products: [
            { name: 'Mảnh ghép', quantity: 1, price: 12000000 },
            { name: 'Phố cổ về đêm', quantity: 1, price: 228000000 }
        ]
    },
    { 
        id: 'PN003', artistName: 'Lê Phổ', employeeName: 'Admin', date: '2025-06-25', totalValue: 90000000, status: 'Đã hủy', 
        products: [{ name: 'Dòng chảy', quantity: 1, price: 90000000 }]
    }
];

const currentUser = {
    id: 'acc01',
    username: 'admin',
    employeeName: 'Quang Đẹp Zai',
    email: 'admin@artgallery.com',
    phone: '0987654321',
    role: 'Admin',
};

export const api = {
    getCurrentUser: () => Promise.resolve(currentUser),
    getImportSlips: () => Promise.resolve(sampleImports),
    getCategories: () => Promise.resolve(sampleCategories),
    getMaterials: () => Promise.resolve(sampleMaterials),
    getAccounts: () => Promise.resolve(sampleAccounts),
    getCustomers: () => Promise.resolve(sampleCustomers),
    getPurchaseHistory: (customerId) => Promise.resolve(samplePurchaseHistory[customerId] || []),
    getDashboardData: () => Promise.resolve({ kpiData, salesData, proportionData }),
    getPaintings: () => Promise.resolve(samplePaintings),
    getArtists: () => Promise.resolve(sampleArtists),
    getOrders: () => Promise.resolve(sampleOrders),
    login: (username, password) => {
        if (username && password) {
            return Promise.resolve({ success: true, user: { name: 'Quang Đẹp Zai', role: 'Quản trị viên' } });
        }
        return Promise.reject({ message: 'Tên đăng nhập và mật khẩu không được để trống.' });
    }
};