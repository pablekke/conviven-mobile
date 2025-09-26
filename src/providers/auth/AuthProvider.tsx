import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import {
  setCredentials,
  clearCredentials,
  type AuthUser,
} from "@/src/features/auth/authSlice";
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { useAppDispatch } from "@/src/core/store/hooks";
import {
  deleteSecureItem,
  getSecureItem,
  saveSecureItem,
} from "@/src/core/utils/secureStorage";

const AUTH_STORAGE_KEY = "conviven-auth";

type AuthContextValue = {
  status: "checking" | "authenticated" | "unauthenticated";
  user: AuthUser | null;
  accessToken: string | null;
  login: (payload: { token: string; user: AuthUser }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = PropsWithChildren<{
  onReady?: () => void;
}>;

type StoredAuthSnapshot = {
  token: string;
  user: AuthUser;
};

export const AuthProvider = ({ children, onReady }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const { accessToken, user } = useAuth();
  const [status, setStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const stored = await getSecureItem(AUTH_STORAGE_KEY);
        if (stored) {
          const snapshot = JSON.parse(stored) as StoredAuthSnapshot;
          if (isMounted) {
            if (!accessToken || accessToken !== snapshot.token) {
              dispatch(
                setCredentials({ token: snapshot.token, user: snapshot.user })
              );
            }
            setStatus("authenticated");
          }
        } else {
          if (isMounted) {
            dispatch(clearCredentials());
            setStatus("unauthenticated");
          }
        }
      } catch (error) {
        console.warn("Failed to bootstrap auth state", error);
        if (isMounted) {
          dispatch(clearCredentials());
          setStatus("unauthenticated");
        }
      } finally {
        if (isMounted) {
          onReady?.();
        }
      }
    };

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [accessToken, dispatch, onReady]);

  const login = useCallback(
    async ({ token, user: nextUser }: { token: string; user: AuthUser }) => {
      const snapshot: StoredAuthSnapshot = { token, user: nextUser };
      await saveSecureItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot));
      dispatch(setCredentials({ token, user: nextUser }));
      setStatus("authenticated");
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    await deleteSecureItem(AUTH_STORAGE_KEY);
    dispatch(clearCredentials());
    setStatus("unauthenticated");
  }, [dispatch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,
      login,
      logout,
    }),
    [accessToken, login, logout, status, user]
  );

  if (status === "checking") {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return {
      status: "unauthenticated",
      user: null,
      accessToken: null,
      login: async () => undefined,
      logout: async () => undefined,
    } as AuthContextValue;
  }

  return context;
};
