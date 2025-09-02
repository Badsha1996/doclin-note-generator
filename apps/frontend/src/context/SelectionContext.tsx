import { createContext, useContext, useState, type ReactNode } from "react";

type SelectionContextType = {
  selectedBoard: string;
  setSelectedBoard: (value: string) => void;
  selectedSubject: string;
  setSelectedSubject: (value: string) => void;
  selectedMarks: string;
  setSelectedMarks: (value: string) => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(
  undefined
);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedMarks, setSelectedMarks] = useState("");

  return (
    <SelectionContext.Provider
      value={{
        selectedBoard,
        setSelectedBoard,
        selectedSubject,
        setSelectedSubject,
        selectedMarks,
        setSelectedMarks,
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
