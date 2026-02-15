import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem("fhps-users") || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem("fhps-users", JSON.stringify(users));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem("fhps-session");
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch {
      // invalid session
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const users = getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, error: "Invalid email or password" };
    const sessionUser = { id: found.id, name: found.name, email: found.email };
    setUser(sessionUser);
    localStorage.setItem("fhps-session", JSON.stringify(sessionUser));
    return { success: true };
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    const users = getUsers();
    if (users.find(u => u.email === email)) {
      return { success: false, error: "An account with this email already exists" };
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    };
    saveUsers([...users, newUser]);
    const sessionUser = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(sessionUser);
    localStorage.setItem("fhps-session", JSON.stringify(sessionUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("fhps-session");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
