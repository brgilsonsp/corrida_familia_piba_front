// UserContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';

// Definindo o tipo para o contexto
type UserContextType = {
  userName: string;
  setUserName: (name: string) => void;
};

// Criando o contexto com um valor padrão (undefined é permitido aqui)
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Provedor do contexto
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userName, setUserName] = useState<string>('');

  return (
    <UserContext.Provider value={{ userName, setUserName }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para acessar o contexto
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
