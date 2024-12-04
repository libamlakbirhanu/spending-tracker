/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { User, UserSettings, AuthContextType } from "../types";
import { SupabaseSubscription, AUTH_EVENTS, AuthChangeEvent } from "../types/auth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserSettings = async (userId: string) => {
    if (!userId) {
      console.log("No userId provided to fetchUserSettings");
      return null;
    }

    try {
      console.log("Fetching settings for user:", userId);

      const { data: settings, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();

      console.log("Settings query result:", { settings, error });

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No settings found, creating default settings");
          const defaultSettings = {
            user_id: userId,
            daily_limit: 100,
            currency: "USD",
          };

          const { data: newSettings, error: createError } = await supabase
            .from("user_settings")
            .insert([defaultSettings])
            .select()
            .single();

          if (createError) {
            console.error("Error creating default settings:", createError);
            throw createError;
          }

          console.log("Successfully created default settings:", newSettings);
          setUserSettings(newSettings);
          return newSettings;
        } else {
          console.error("Error fetching settings:", error);
          throw error;
        }
      }

      console.log("Successfully fetched existing settings:", settings);
      setUserSettings(settings);
      return settings;
    } catch (error) {
      console.error("Failed to load/create user settings:", error);
      toast.error("Failed to load user settings");
      return null;
    }
  };

  // Subscribe to auth changes
  useEffect(() => {
    let isMounted = true;
    let authSubscription: SupabaseSubscription | null = null;

    const setupAuthListener = async () => {
      console.log("Setting up auth state change listener...");

      try {
        setLoading(true);

        // Get initial session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted && session?.user) {
          console.log("Found initial session, fetching user data");
          setUser(session.user);
          await fetchUserSettings(session.user.id);
        }

        // Set up auth listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session) => {
            if (!isMounted) {
              console.log("Skipping auth state change - component unmounted");
              return;
            }

            try {
              switch (event) {
                case AUTH_EVENTS.SIGNED_IN:
                  if (session?.user) {
                    console.log("Setting user and fetching settings...");
                    setUser(session.user);
                    const settings = await fetchUserSettings(session.user.id);
                    console.log("Fetched user settings:", settings);
                    if (isMounted) {
                      navigate("/");
                    }
                  }
                  break;

                case AUTH_EVENTS.SIGNED_OUT:
                  console.log("Processing SIGNED_OUT event...");
                  setUser(null);
                  setUserSettings(null);
                  if (isMounted) {
                    navigate("/login");
                  }
                  break;

                case AUTH_EVENTS.TOKEN_REFRESHED:
                  if (session?.user) {
                    console.log("Refreshing user data...");
                    setUser(session.user);
                    await fetchUserSettings(session.user.id);
                  }
                  break;

                case AUTH_EVENTS.PASSWORD_RECOVERY:
                  // Handle password recovery if needed
                  console.log("Password recovery event received");
                  break;

                case AUTH_EVENTS.USER_UPDATED:
                  if (session?.user) {
                    console.log("User updated, refreshing user data");
                    setUser(session.user);
                  }
                  break;

                default:
                  console.log(`Unhandled auth event: ${event}`);
              }
            } catch (error) {
              console.error("Auth state change error:", error);
              if (isMounted) {
                toast.error("Failed to handle auth state change");
              }
            }
          }
        );

        authSubscription = subscription;
      } catch (error) {
        console.error("Failed to set up auth listener:", error);
        if (isMounted) {
          toast.error("Failed to initialize authentication");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    setupAuthListener().catch((error) => {
      console.error("Failed to set up auth listener:", error);
    });

    return () => {
      console.log("Cleaning up auth state change listener...");
      isMounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

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
      console.log("Starting sign out...");

      // First clear local state
      setUser(null);
      setUserSettings(null);

      // Try to clear session from localStorage directly
      window.localStorage.removeItem(
        "sb-" + import.meta.env.VITE_SUPABASE_URL + "-auth-token"
      );

      // Then attempt Supabase signout with timeout
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Sign out timed out after 5s")), 5000)
      );

      const { error } = await Promise.race([
        signOutPromise,
        timeoutPromise,
      ]).catch((error) => {
        console.error("Sign out race error:", error);
        return { error };
      });

      if (error) {
        console.warn(
          "Supabase sign out had an error, but proceeding with local cleanup:",
          error
        );
      } else {
        console.log("Supabase sign out completed successfully");
      }

      // Always navigate regardless of Supabase signout result
      navigate("/login");
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      // Still navigate on error since we've cleared local state
      navigate("/login");
    }
  };

  const value = {
    user,
    userSettings,
    loading,
    signUp,
    signIn,
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
