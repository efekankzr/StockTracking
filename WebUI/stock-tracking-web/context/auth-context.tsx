'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  role: string;
  warehouseId?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        console.log("🔑 HAM TOKEN VERİSİ:", decoded);

        let roleClaim = 
             decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
             decoded['role'] ||
             decoded['Role'] ||
             decoded['roles'];

        if (Array.isArray(roleClaim)) {
            roleClaim = roleClaim[0];
        }

        if (!roleClaim) {
            console.warn("⚠️ Rol bulunamadı, varsayılan atanıyor.");
            roleClaim = "User";
        }

        const idClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || decoded['nameid'] || decoded['id'];
        const nameClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded['unique_name'] || decoded['sub'];
        const warehouseIdClaim = decoded['WarehouseId'];

        console.log("✅ GİRİŞ YAPAN:", { id: idClaim, name: nameClaim, role: roleClaim });

        setUser({
          id: Number(idClaim),
          username: nameClaim,
          role: roleClaim,
          warehouseId: warehouseIdClaim ? Number(warehouseIdClaim) : undefined,
        });

      } catch (error) {
        console.error("Token bozuk:", error);
        Cookies.remove('token', { path: '/' });
      }
    } else {
        console.log("ℹ️ Token bulunamadı (Cookie boş).");
    }
    
    setIsLoading(false);
  }, []);

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);