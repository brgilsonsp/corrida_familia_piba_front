import React from 'react';
import { UserProvider } from './UserContext';  // Caminho correto para o UserContext
import { Slot } from 'expo-router';  // Componente que renderiza as rotas

export default function Layout() {
  return (
    <UserProvider>  
      <Slot />      
    </UserProvider>
  );
}
