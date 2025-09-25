import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";

// Création du contexte
const AuthContext = createContext({ role: null, loading: true });

// Provider minimaliste
export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    console.log(token);
    
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log(decoded);
        
        setRole(decoded.role); // On ne garde que le rôle
      } catch (err) {
        console.error("JWT invalide:", err);
        sessionStorage.removeItem("accessToken");
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ role }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pour accéder facilement au rôle
export const useAuth = () => useContext(AuthContext);
