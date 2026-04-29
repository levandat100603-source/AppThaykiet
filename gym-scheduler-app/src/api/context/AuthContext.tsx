import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setAuthToken } from '../client'; // Import file cấu hình axios của bạn

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

// 👇 QUAN TRỌNG: Phải khai báo hàm register ở đây thì trang khác mới dùng được
type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  isInitializing: boolean;
  login: (email: string, pass: string) => Promise<any>;
  register: (name: string, email: string, pass: string) => Promise<any>; // <--- DÒNG NÀY SỬA LỖI ĐỎ
  logout: () => Promise<void>;
  updateLocalUser: (nextUser: Partial<User>) => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // 1. Tự động load User từ bộ nhớ khi mở App
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');
        
        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            setAuthToken(storedToken); // 👈 Gọi hàm này
        }
      } catch (e) {
        console.log('Lỗi load user:', e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadData();
  }, []);

  // 2. Hàm Đăng nhập
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/login', { email, password });
      await handleAuthResponse(res);
      return res; 
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm Đăng ký (Mới thêm)
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/register', { name, email, password });
      // Nếu server trả về token luôn sau khi đăng ký thì tự đăng nhập
      if (res.data.token) {
        await handleAuthResponse(res);
      }
      return res;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Hàm phụ: Xử lý lưu token (Dùng chung cho cả login và register)
  const handleAuthResponse = async (res: any) => {
      const userData = res.data.user;
      const accessToken = res.data.access_token || res.data.token;

      setUser(userData);
      setToken(accessToken);
      setAuthToken(accessToken); // Set ngay để request kế tiếp có token

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('token', accessToken);
  };

  // 4. Hàm Đăng xuất
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    setAuthToken(null); // 👈 Gọi hàm này để xóa token
  };

  const updateLocalUser = async (nextUser: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...nextUser };
      AsyncStorage.setItem('user', JSON.stringify(merged));
      return merged;
    });
  };

  const getToken = async (): Promise<string | null> => {
    try {
      // Try to get from state first
      if (token) {
        return token;
      }
      // If not in state, try to get from AsyncStorage
      const storedToken = await AsyncStorage.getItem('token');
      return storedToken;
    } catch (err) {
      console.error('Error getting token:', err);
      return null;
    }
  };

  return (
    // 👇 Nhớ đưa register vào danh sách value gửi đi
    <AuthContext.Provider value={{ user, token, loading, isInitializing, login, register, logout, updateLocalUser, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để dùng nhanh
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải được dùng bên trong AuthProvider');
  return context;
};