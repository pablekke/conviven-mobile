import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Alert } from "react-native";

import AuthService from "../services/authService";
import { AuthState, LoginCredentials, RegisterCredentials, User } from "../types/user";
import { NetworkError } from "../services/http";
import { authSession } from "../services/auth/sessionManager";
import Toast from "react-native-toast-message";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  clearError: () => {},
  refreshUser: async () => null,
  updateUser: async () => {},
  setUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = await AuthService.isAuthenticated();

        if (isAuthenticated) {
          const user = await AuthService.getCurrentUser();
          setState({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (error instanceof NetworkError) {
          Alert.alert(
            "Error de Conexión",
            "No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.",
            [{ text: "OK" }],
          );
        }

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to restore authentication state",
        });
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    const unsubscribe = authSession.subscribe(event => {
      if (event.type === "sessionExpired") {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Sesión vencida, iniciá sesión de nuevo.",
        });
        AuthService.saveUser(null).catch(() => undefined);
        Toast.show({ type: "info", text1: "Sesión vencida, iniciá sesión de nuevo." });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await AuthService.login(credentials);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const user = await AuthService.register(credentials);

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      await AuthService.logout();

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      Alert.alert("Logout Error", "Failed to log out. Please try again.");
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const refreshUser = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const refreshedUser = await AuthService.getCurrentUser();
      await AuthService.saveUser(refreshedUser);

      setState({
        user: refreshedUser,
        isAuthenticated: !!refreshedUser,
        isLoading: false,
        error: null,
      });

      return refreshedUser ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to refresh user";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      return null;
    }
  }, []);

  const setUserValue = useCallback(async (nextUser: User | null) => {
    setState(prev => ({
      ...prev,
      user: nextUser,
      isAuthenticated: !!nextUser,
    }));

    await AuthService.saveUser(nextUser);
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    let mergedUser: User | null = null;

    setState(prev => {
      if (!prev.user) {
        mergedUser = null;
        return prev;
      }

      mergedUser = { ...prev.user, ...updates };

      return {
        ...prev,
        user: mergedUser,
        isAuthenticated: prev.isAuthenticated || !!mergedUser,
      };
    });

    await AuthService.saveUser(mergedUser);
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    updateUser,
    setUser: setUserValue,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
