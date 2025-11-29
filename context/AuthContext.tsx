import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react";
import { Alert } from "react-native";

import AuthService from "../services/authService";
import { AuthState, LoginCredentials, RegisterCredentials, User } from "../types/user";
import { NetworkError } from "../services/http";
import { authSession } from "../services/auth/sessionManager";
import Toast from "react-native-toast-message";
import { useFeedPrefetch } from "@/features/feed/hooks";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<User | null>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
  isManualLogin: boolean; // Flag para indicar si fue login manual
  isLogoutInProgress: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isManualLogin: false,
  isLogoutInProgress: false,
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
  const [isManualLogin, setIsManualLogin] = useState(false);
  const [isLogoutInProgress, setIsLogoutInProgress] = useState(false);
  const logoutSuppressUntilRef = useRef<number>(0);
  const { prefetchFeed, clearPrefetch } = useFeedPrefetch();

  useAuthBootstrap({ setState, logoutSuppressUntilRef, prefetchFeed });

  const { login, register, logout, clearError, refreshUser, setUserValue, updateUser } =
    useAuthActions({
      setState,
      setIsManualLogin,
      prefetchFeed,
      clearPrefetch,
      logoutSuppressUntilRef,
      setIsLogoutInProgress,
    });

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
    updateUser,
    setUser: setUserValue,
    isManualLogin,
    isLogoutInProgress,
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

type AuthBootstrapDeps = {
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
  logoutSuppressUntilRef: React.MutableRefObject<number>;
  prefetchFeed: () => Promise<unknown>;
};

function useAuthBootstrap({ setState, logoutSuppressUntilRef, prefetchFeed }: AuthBootstrapDeps) {
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isAuthenticated = await AuthService.isAuthenticated();

        if (isAuthenticated) {
          const user = await AuthService.getCurrentUser();

          // Precargar el feed antes de establecer isLoading: false (similar al login)
          if (user) {
            try {
              await prefetchFeed();
            } catch (prefetchError) {
              console.warn("[AuthBootstrap] Error precargando feed tras bootstrap:", prefetchError);
            }
          }

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
  }, [setState, prefetchFeed]);

  useEffect(() => {
    const unsubscribe = authSession.subscribe(event => {
      if (event.type === "sessionExpired") {
        if (logoutSuppressUntilRef.current > Date.now()) {
          return;
        }

        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Sesión vencida, iniciá sesión de nuevo.",
        });
        AuthService.saveUser(null).catch(() => undefined);
        Toast.show({
          type: "info",
          text1: "Sesión vencida, iniciá sesión de nuevo.",
          position: "bottom",
        });
      }
    });

    return unsubscribe;
  }, [logoutSuppressUntilRef, setState]);
}

type AuthActionsDeps = {
  setState: React.Dispatch<React.SetStateAction<AuthState>>;
  setIsManualLogin: React.Dispatch<React.SetStateAction<boolean>>;
  prefetchFeed: () => Promise<unknown>;
  clearPrefetch: () => void;
  logoutSuppressUntilRef: React.MutableRefObject<number>;
  setIsLogoutInProgress: React.Dispatch<React.SetStateAction<boolean>>;
};

function useAuthActions({
  setState,
  setIsManualLogin,
  prefetchFeed,
  clearPrefetch,
  logoutSuppressUntilRef,
  setIsLogoutInProgress,
}: AuthActionsDeps) {
  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setIsManualLogin(true);
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const user = await AuthService.login(credentials);

        try {
          await prefetchFeed();
        } catch (prefetchError) {
          console.warn("[AuthContext] Error precargando feed tras login:", prefetchError);
        }

        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "El Login ha fallado.";

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: message,
        }));

        throw error;
      }
    },
    [prefetchFeed, setIsManualLogin, setState],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials) => {
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
    },
    [setState],
  );

  const logout = useCallback(async () => {
    setIsLogoutInProgress(true);
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    logoutSuppressUntilRef.current = Date.now() + 4000;

    try {
      await AuthService.logout();
      setIsManualLogin(false);

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      Toast.show({ type: "success", text1: "Sesión cerrada con éxito", position: "bottom" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      Alert.alert("Logout Error", "Failed to log out. Please try again.");
    } finally {
      clearPrefetch();
      logoutSuppressUntilRef.current = Date.now() + 4000;
      setIsLogoutInProgress(false);
    }
  }, [clearPrefetch, logoutSuppressUntilRef, setIsLogoutInProgress, setIsManualLogin, setState]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, [setState]);

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
  }, [setState]);

  const setUserValue = useCallback(
    async (nextUser: User | null) => {
      setState(prev => ({
        ...prev,
        user: nextUser,
        isAuthenticated: !!nextUser,
      }));

      await AuthService.saveUser(nextUser);
    },
    [setState],
  );

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
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
    },
    [setState],
  );

  return {
    login,
    register,
    logout,
    clearError,
    refreshUser,
    setUserValue,
    updateUser,
  };
}
