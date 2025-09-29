import type { User } from "@/types/api";
import { createContext, useContext, useState, type ReactNode } from "react";

type SelectionContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <SelectionContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error("useSelection must be used inside SelectionProvider");
  }
  return context;
}
