import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({ user: null, role: null, loading: true });

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("accessToken");
  const checkToken = () => {
    if (!token) {
      setUser(null);
      setRole(null);
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        sessionStorage.removeItem("accessToken");
        setUser(null);
        setRole(null);
        navigate("/login");
      } else {
        setUser(decoded);
        setRole(decoded.role || null);
      }
    } catch (err) {
      sessionStorage.removeItem("accessToken");
      setUser(null);
      setRole(null);
      navigate("/login");
    }
  };

  // Vérifie à chaque montage
  useEffect(() => {
    checkToken();
    setLoading(false);
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, role, loading, checkToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
