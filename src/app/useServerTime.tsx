import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Hook customizado para buscar a hora do servidor
const useServerTime = () => {
  const [serverTime, setServerTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [urlBase, setUrlBase] = useState<string>(''); // Estado para armazenar a URL base

  // Carregar a URL base salva
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase);
      } else {
        // Defina um valor padrão se não houver URL salva
        setUrlBase('https://hufd66cq2i');
      }
    };
    loadUrlBase();
  }, []);

  // Buscar a hora do servidor apenas depois de ter carregado a URL base
  useEffect(() => {
    const fetchServerTime = async () => {
      if (!urlBase) return; // Aguarda até que a URL base tenha sido carregada

      setLoading(true);
      try {
        const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/configuracoes/hora_servidor`);

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
        if (error instanceof Error) {
          Alert.alert('Erro na Sincronização', error.message);
        } else {
          Alert.alert('Erro desconhecido');
        }

        // Usar a hora local do dispositivo como fallback
        const localTime = new Date();
        const hours = String(localTime.getHours()).padStart(2, '0');
        const minutes = String(localTime.getMinutes()).padStart(2, '0');
        const seconds = String(localTime.getSeconds()).padStart(2, '0');
        const fallbackTime = `${hours}:${minutes}:${seconds}`;
        setServerTime(fallbackTime);
        Alert.alert('Usando Hora Local', `Hora local do dispositivo: ${fallbackTime}`);
      } finally {
        setLoading(false);
      }
    };

    fetchServerTime();
  }, [urlBase]);

  // Atualiza o cronômetro continuamente
  useEffect(() => {
    if (!serverTime) return; // Espera a hora inicial estar definida

    const interval = setInterval(() => {
      setServerTime((prevTime) => {
        if (!prevTime) return null;

        // Incrementa 1 segundo ao horário atual
        const [hours, minutes, seconds] = prevTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, seconds);

        const newHours = String(date.getHours()).padStart(2, '0');
        const newMinutes = String(date.getMinutes()).padStart(2, '0');
        const newSeconds = String(date.getSeconds()).padStart(2, '0');
        return `${newHours}:${newMinutes}:${newSeconds}`;
      });
    }, 1000);

    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, [serverTime]);

  return { serverTime, loading };
};

export default useServerTime;
