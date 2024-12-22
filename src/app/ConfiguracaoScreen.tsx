import React, { useState, useEffect,useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import useServerTime from './hook/useServerTime'; // Certifique-se de que o hook está correto

const ConfiguracaoScreen = () => {
  const router = useRouter();
  const defaultUrl = 'https://hufd66cq2i';
  const [urlBase, setUrlBase] = useState(defaultUrl);
  const { serverTime } = useServerTime();
  const [currentTime, setCurrentTime] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [inputHoraEspecifica, setInputHoraEspecifica] = useState('');
  const animationFrameId = useRef<number | null>(null);  // Ref para armazenar o ID do requestAnimationFrame
  const lastTimeRef = useRef(0);  // Ref para armazenar o tempo do último quadro
  const startTimeRef = useRef(0);  // Ref para armazenar o tempo inicial do cronômetro

  // Carregar URL base salvo do AsyncStorage
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase);  // Atualiza o estado com a URL salva
      } else {
        await AsyncStorage.setItem('apiUrlBase', defaultUrl);  // Salva o valor default
        setUrlBase(defaultUrl);  // Atualiza o estado para o valor default
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

  // Formatar o tempo em "hh:mm:ss:ms"
    const formatTimeToDisplay = useCallback((time: number) => {
      const totalSeconds = Math.floor(time / 1000);
      const milliseconds = Math.floor((time % 1000) / 10);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      const msString = String(milliseconds).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}.${msString}`;
    }, []);
  
    // Configuração de cronômetro baseado no serverTime
    useEffect(() => {
      if (serverTime) {
        const [hours, minutes, seconds] = serverTime.split(':').map(Number);
        const serverStartTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        setCurrentTime(serverStartTime); // Define o tempo inicial
        startTimeRef.current = serverStartTime;  // Armazenar o tempo inicial
      }
    }, [serverTime]);
  
    const updateTime = useCallback(() => {
      const now = performance.now();  // Obtém o tempo atual em milissegundos (preciso)
      const delta = now - lastTimeRef.current;  // Calcula o tempo passado desde a última atualização
  
      // Atualiza o tempo com base na diferença real
      setCurrentTime((prevTime) => prevTime + delta);
  
      // Armazena o tempo atual para a próxima atualização
      lastTimeRef.current = now;
  
      // Solicita o próximo quadro com requestAnimationFrame
      animationFrameId.current = requestAnimationFrame(updateTime);
    }, []);
  
    useEffect(() => {
      if (serverTime) {
        const start = performance.now();
        lastTimeRef.current = start; // Inicializa o último tempo registrado
        animationFrameId.current = requestAnimationFrame(updateTime);
      }
  
      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [updateTime, serverTime]);
  
    useEffect(() => {
      // Inicia a animação com requestAnimationFrame
      animationFrameId.current = requestAnimationFrame(updateTime);
  
      // Limpeza ao desmontar o componente
      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [updateTime]);
  

  // Valida se a hora inserida está no formato correto
  const validateTimeFormat = (timeStr) => {
    const regex = /^\d{2}:\d{2}:\d{2}:\d{2}$/; // Regex para validar o formato hh:mm:ss:ms
    return regex.test(timeStr);
  };


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
      {/* Exibir "00:00:00.00" até o serverTime aparecer */}
      <Text style={styles.timer}>
        {serverTime ? formatTimeToDisplay(currentTime) : '00:00:00.00'}
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

const styles = StyleSheet.create({
  // Contêiner principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F8FF', // Fundo suave azul claro
  },
  // Estilo para os rótulos
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E', // Azul escuro
    marginBottom: 10,
  },
  // Estilo geral para os botões
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10, // Bordas mais arredondadas
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Sombra para Android
    marginTop: 10,
    marginBottom: 20,
  },
  // Estilo para o texto do botão
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase', // Texto em maiúsculas
  },
  // Estilo para os campos de entrada
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF', // Fundo branco
    borderWidth: 1,
    borderColor: '#DDE6ED', // Borda cinza claro
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#34495E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2, // Sombra para Android
  },
  // Estilo para o texto do temporizador
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007BFF', 
    marginBottom: 20,
    textAlign: 'center',
  },
});
