import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
// 1. Import thư viện lưu trữ
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type CartItem = {
  id: string | number;
  name: string;
  price: number;
  type: 'class' | 'pt' | 'trainer' | 'membership';
  schedule?: string;
  quantity?: number; // Số lượng/ngày tập
  schedules?: string[]; // Danh sách các ngày/lịch tập
  bookedForMember?: boolean;
  memberId?: number;
  memberName?: string;
  memberEmail?: string;
};

type CartContextType = {
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string | number, type: string, memberId?: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // Biến cờ để biết đã load xong chưa
  
  const { user } = useAuth();
  // Dùng useRef để theo dõi user trước đó (để biết chính xác khi nào là hành động Đăng xuất)
  const prevUserRef = useRef(user);

  // --- 1. LOAD GIỎ HÀNG TỪ BỘ NHỚ KHI MỞ APP ---
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('my_cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.log('Lỗi load cart:', error);
      } finally {
        setIsLoaded(true); // Đánh dấu là đã load xong
      }
    };
    loadCart();
  }, []);

  // --- 2. LƯU GIỎ HÀNG VÀO BỘ NHỚ KHI CÓ THAY ĐỔI ---
  useEffect(() => {
    if (isLoaded) { // Chỉ lưu khi đã load xong (tránh lưu đè mảng rỗng lúc mới mở)
      AsyncStorage.setItem('my_cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  // --- 3. XỬ LÝ ĐĂNG XUẤT (Chỉ xóa khi User chuyển từ Có -> Không) ---
  useEffect(() => {
    // Nếu trước đó có User (đang login) MÀ bây giờ user là null => Tức là vừa bấm Đăng xuất
    if (prevUserRef.current && !user) {
      setCart([]); // Xóa state
      AsyncStorage.removeItem('my_cart'); // Xóa bộ nhớ
    }
    // Cập nhật lại user hiện tại cho lần check sau
    prevUserRef.current = user;
  }, [user]);


  // --- CÁC HÀM XỬ LÝ CŨ GIỮ NGUYÊN ---
  const cartTotal = cart.reduce((sum, item) => {
    const qty = item.quantity || 1;
    return sum + (item.price * qty);
  }, 0);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const addToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      const exists = prevCart.some(
        (item) =>
          item.id === newItem.id &&
          item.type === newItem.type &&
          item.bookedForMember === newItem.bookedForMember &&
          item.memberId === newItem.memberId
      );
      if (exists) return prevCart;
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (id: string | number, type: string, memberId?: number) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.id === id && item.type === type && (memberId === undefined || item.memberId === memberId))
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};