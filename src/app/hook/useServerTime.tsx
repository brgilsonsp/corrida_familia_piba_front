import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

// Hook customizado para buscar a hora do servidor
const useServerTime = () => {
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServerTime = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://lvwdj.wiremockapi.cloud/v1/configuracoes/hora_servidor');

        if (!response.ok) {
          throw new Error('Erro ao buscar a hora do servidor');
        }

        const data = await response.json();
        
        if (data?.hora) {
          setServerTime(data.hora);
          Alert.alert('Hora Sincronizada', `Hora do servidor: ${data.hora}`);
        } else {
          throw new Error('Formato inválido da resposta da API');
        }
      } catch (error) {
        if (error instanceof Error) { // Verificação de tipo
          Alert.alert('Erro na Sincronização', error.message);
        } else {
          Alert.alert('Erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServerTime();
  }, []);

  return { serverTime, loading };
};

export default useServerTime;
