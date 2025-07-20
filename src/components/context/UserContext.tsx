// src/context/UserContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";


interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string; // base64
}

const UserContext = createContext<User | null>(null);
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId"); // Make sure you store this at login
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const res = await axios.get(`http://localhost:5000/user/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    fetchUser();
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
