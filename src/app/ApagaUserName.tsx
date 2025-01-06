import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useHandleAppState() {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        try {
          await AsyncStorage.removeItem('userName');
          console.log('Username removido com sucesso!');
        } catch (error) {
          console.error('Erro ao remover username:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove(); // Limpeza do listener
    };
  }, []); // Sem dependências, executa apenas uma vez ao montar
}

export function useHandleAppStateCsv(isSharing: boolean) {
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' && !isSharing) {
        try {
          await AsyncStorage.removeItem('userName');
          console.log('Username removido com sucesso!');
        } catch (error) {
          console.error('Erro ao limpar username', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [isSharing]);
}
