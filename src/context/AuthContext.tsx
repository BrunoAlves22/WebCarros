import { ReactNode, createContext, useState, useEffect, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConnection";

type AuthContextData = {
  signed: boolean;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  loadingAuth: boolean;
  visiblePassword: () => void;
  handleInfoUser: ({ name, email, uid }: UserProps) => void;
  user: UserProps | null;
};

interface AuthProviderProps {
  children: ReactNode;
}

interface UserProps {
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [user, setUser] = useState<UserProps | null>(null);

  const handleVisiblePassword = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email,
        });
        setLoadingAuth(false);
      } else {
        setUser(null);
        setLoadingAuth(false);
      }
    });

    return () => {
      unsub();
    };
  }, []);

  function handleInfoUser({ email, name, uid }: UserProps) {
    setUser({
      name,
      email,
      uid,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        showPassword,
        setShowPassword,
        loadingAuth,
        visiblePassword: handleVisiblePassword,
        handleInfoUser,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
