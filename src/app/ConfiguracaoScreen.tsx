import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import useServerTime from './hook/useServerTime'; // Certifique-se de que o hook está correto
import styles from './Styles';

const ConfiguracaoScreen = () => {
  const router = useRouter();
  const defaultUrl = 'https://frzz2vj490';
  const [urlBase, setUrlBase] = useState(defaultUrl);
  const { serverTime} = useServerTime();
  const [currentTime, setCurrentTime] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [inputHoraEspecifica, setInputHoraEspecifica] = useState('');

  // Carregar URL base salvo do AsyncStorage
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase);
      } else {
        await AsyncStorage.setItem('apiUrlBase', defaultUrl);
      }
    };
    loadUrlBase();
  }, []);

  const handleSaveUrlBase = async () => {
    try {
      await AsyncStorage.setItem('apiUrlBase', urlBase);
      Alert.alert('URL base salva com sucesso!', urlBase);
    } catch (error) {
      console.error('Erro ao salvar a URL base:', error);
    }
  };

  const handleSaveCurrentTime = () => {
    setSavedTime(currentTime);
    Alert.alert('Cronômetro salvo com sucesso!', formatTimeToDisplay(currentTime));
  };

  const handleSaveInputTime = () => {
    if (validateTimeFormat(inputHoraEspecifica)) {
      const timeInMs = convertTimeToMilliseconds(inputHoraEspecifica);
      setSavedTime(timeInMs);
      Alert.alert('Horário salvo com sucesso!', inputHoraEspecifica);
    } else {
      Alert.alert('Formato inválido', 'Digite no formato hh:mm:ss:ms');
    }
  };

  // Converte tempo para milissegundos
  const convertTimeToMilliseconds = (timeStr) => {
    const [hours, minutes, seconds, milliseconds] = timeStr.split(':').map(Number);
    return ((hours * 3600 + minutes * 60 + seconds) * 1000) + milliseconds;
  };

  const formatTimeToDisplay = (timeMs) => {
    const totalSeconds = Math.floor(timeMs / 1000); // Obtemos a parte inteira em segundos
    const milliseconds = Math.floor((timeMs % 1000) / 10); // Pegando as frações em 2 casas decimais
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const msString = String(milliseconds).padStart(2, '0');
  
    return `${hours}:${minutes}:${seconds}.${msString}`;
  };

  // Valida se a hora inserida está no formato correto
  const validateTimeFormat = (timeStr) => {
    const regex = /^\d{2}:\d{2}:\d{2}:\d{2}$/; // Regex para validar o formato hh:mm:ss:ms
    return regex.test(timeStr);
  };

  // Configuração de cronômetro baseado no serverTime
  useEffect(() => {
    if (serverTime) {
      const [hours, minutes, seconds] = serverTime.split(':').map(Number);
      const serverStartTime = (hours * 3600 + minutes * 60 + seconds) * 1000;

      setCurrentTime(serverStartTime);
    }
  }, [serverTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime((prevTime) => prevTime + 10);
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Botão para voltar */}
      <TouchableOpacity onPress={() => router.back()}>
        <Icon name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>

      <Text style={styles.label}>Editar URL base:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a URL base (ex: https://192.168.0.5:9111)"
        value={urlBase}
        onChangeText={setUrlBase}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveUrlBase}>
        <Text style={styles.buttonText}>Salvar URL</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Cronômetro atual:</Text>
      <Text style={styles.timer}>
        {formatTimeToDisplay(currentTime)}
      </Text>

      {/* Botão para salvar o cronômetro */}
      <TouchableOpacity style={styles.button} onPress={handleSaveCurrentTime}>
        <Text style={styles.buttonText}>Salvar Cronômetro</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Digite um horário específico:</Text>
      <TextInput
        style={styles.input}
        placeholder="Formato: hh:mm:ss:ms"
        value={inputHoraEspecifica}
        onChangeText={setInputHoraEspecifica}
      />

      {/* Botão para salvar hora específica */}
      <TouchableOpacity style={styles.button} onPress={handleSaveInputTime}>
        <Text style={styles.buttonText}>Salvar Horário</Text>
      </TouchableOpacity>

      <Text style={styles.label}>
        Horário salvo: {formatTimeToDisplay(savedTime)}
      </Text>
    </View>
  );
};

export default ConfiguracaoScreen;
