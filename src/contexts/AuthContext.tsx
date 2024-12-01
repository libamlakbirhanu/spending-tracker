import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, UserSettings, AuthContextType } from "../types";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading] = useState(false);

  const fetchUserSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user settings:", error);
        return;
      }

      setUserSettings(data);
    } catch (error) {
      console.error("Error in fetchUserSettings:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        await fetchUserSettings(session.user.id);
        navigate("/");
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setUserSettings(null);
        navigate("/login");
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        setUser(session.user);
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (
    email: string,
    password: string,
    options?: {
      data?: {
        [key: string]: any;
      };
    }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: options?.data,
      },
    });
    if (error) throw error;
    else {
      toast.success("Successfully registered!");
      navigate("/login");
      return { error: null };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    else {
      toast.success("Successfully signed in!");
      return { error: null };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  const value = {
    user,
    userSettings,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
