import { useState, useEffect } from 'react';
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

  const postLargadas = async () => {
    try {
      const corredores = await getAllCorredores();
      console.log('Corredores:', corredores);
  
      const requests = corredores.map(async corredor => {
        // Construção do payload na ordem correta
        const payload = {
          numero_peito: corredor.numero_corredor,
          hora: corredor.tempo_de_atraso || null,
          monitor: corredor.monitor,
        };
  
        console.log('Payload para largadas:', payload);
  
        const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/cronometragem/largadas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        const responseData = await response.json();
        if (response.ok) {
          console.log('Largada registrada com sucesso:', responseData);
        } else {
          console.error('Erro ao enviar largada:', responseData);
          Alert.alert('Erro ao enviar largada', responseData.message || 'Erro desconhecido');
        }
      });
  
      await Promise.all(requests);
      Alert.alert('Largadas enviadas', 'Todas as largadas foram registradas com sucesso!');
    } catch (error) {
      console.error('Erro ao postar largadas:', error);
      Alert.alert('Erro ao postar largadas', error.message || 'Erro desconhecido');
    }
  };
  
  const postChegadas = async () => {
    try {
      const corredores = await getAllCorredores();
      console.log('Corredores:', corredores);
  
      const requests = corredores.map(async corredor => {
        // Construção do payload na ordem correta
        const payload = {
          numero_peito: corredor.numero_corredor,
          hora: corredor.tempo_final || null,
          monitor: corredor.monitor,
        };
  
        console.log('Payload para chegadas:', payload);
  
        const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/cronometragem/chegadas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        const responseData = await response.json();
        if (response.ok) {
          console.log('Chegada registrada com sucesso:', responseData);
        } else {
          console.error('Erro ao enviar chegada:', responseData);
          Alert.alert('Erro ao enviar chegada', responseData.message || 'Erro desconhecido');
        }
      });
  
      await Promise.all(requests);
      Alert.alert('Chegadas enviadas', 'Todas as chegadas foram registradas com sucesso!');
    } catch (error) {
      console.error('Erro ao postar chegadas:', error);
      Alert.alert('Erro ao postar chegadas', error.message || 'Erro desconhecido');
    }
  };  

  return { postLargadas, postChegadas };
};

export default usePostCorredores;
