import React, { useState, useEffect } from 'react';
import { getAllCorredores } from './database/initializeDatabase'; // Importe suas funções do banco de dados
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage

// Hook personalizado
const usePostCorredores = () => {
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

  // Função para postar as largadas
  const postLargadas = async () => {
    try {
      const corredores = await getAllCorredores(); // Obtém todos os corredores do banco de dados

      const requests = corredores.map(corredor => {
        if (!corredor.tempo_de_atraso) return null; // Ignora os corredores sem tempo de atraso

        const payload = {
          numero_peito: corredor.numero_corredor,
          hora: corredor.tempo_de_atraso, // Usando tempo de atraso como hora
          monitor: corredor.monitor,
        };

        return fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/cronometragem/largadas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      });

      const responses = await Promise.all(requests.filter(Boolean)); // Executa todas as requisições

      Alert.alert(
        'Largadas enviadas',
        `${responses.length} largadas foram postadas com sucesso!`
      );
    } catch (error) {
      console.error('Erro ao postar largadas:', error);
      Alert.alert('Erro ao postar largadas');
    }
  };

  // Função para postar as chegadas
  const postChegadas = async () => {
    try {
      const corredores = await getAllCorredores(); // Obtém todos os corredores do banco de dados

      const requests = corredores.map(corredor => {
        if (!corredor.tempo_final) return null; // Ignora os corredores sem tempo final

        const payload = {
          numero_peito: corredor.numero_corredor,
          hora: corredor.tempo_final, // Usando tempo final como hora
          monitor: corredor.monitor,
        };

        return fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/cronometragem/chegadas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      });

      const responses = await Promise.all(requests.filter(Boolean)); // Executa todas as requisições

      Alert.alert(
        'Chegadas enviadas',
        `${responses.length} chegadas foram postadas com sucesso!`
      );
    } catch (error) {
      console.error('Erro ao postar chegadas:', error);
      Alert.alert('Erro ao postar chegadas');
    }
  };

  return { postLargadas, postChegadas };
};

export default usePostCorredores;
