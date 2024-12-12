import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import stylescronometro from './Stylescronometro';
import { insertCorredor } from './database/initializeDatabase'; // Atualize o caminho para o arquivo correto

export default function Cronometro() {
  const route = useRouter();
  // Estados do cronômetro e do sistema
  const [runnerNumbers, setRunnerNumbers] = useState(['', '', '', '']);
  const [currentTime, setCurrentTime] = useState('00:00:00:00');
  const [responseMessages, setResponseMessages] = useState(['', '', '', '']);
  const [apiUrlBase, setApiUrlBase] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [userName, setUserName] = useState('');

  // Estado do modal de partida atrasada
  const [modalVisible, setModalVisible] = useState(false);
  const [delayedRunnerNumbers, setDelayedRunnerNumbers] = useState(['', '', '', '']);

  // Formatar o tempo em "00:00:00:00"
  const formatTime = useCallback((counter) => {
    const hours = String(Math.floor(counter / (100 * 60 * 60))).padStart(2, '0');
    const minutes = String(Math.floor((counter / (100 * 60)) % 60)).padStart(2, '0');
    const seconds = String(Math.floor((counter / 100) % 60)).padStart(2, '0');
    const milliseconds = String(counter % 100).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
  }, []);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName);
        }
      } catch (error) {
        console.error('Erro ao carregar userName do AsyncStorage', error);
      }
    };

    fetchUserName();
  }, []);

  // Atualiza o cronômetro
  const updateCurrentTime = useCallback(() => {
    setCounter((prevCounter) => {
      const newCounter = prevCounter + 1;
      setCurrentTime(formatTime(newCounter));
      return newCounter;
    });
  }, [formatTime]);

  // Função para confirmar pausa e reset
  const showConfirmationDialog = useCallback((action, message, onConfirm) => {
    Alert.alert(message, '', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', onPress: onConfirm },
    ]);
  }, []);

  // Pausa o cronômetro
  const pauseCronometro = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
      setIsRunning(false);
    }
  }, [intervalId]);

  // Reseta o cronômetro
  const resetCronometro = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setIsRunning(false);
    setCounter(0);
    setCurrentTime('00:00:00:00');
  }, [intervalId]);

  // Inicia o cronômetro
  const startCronometro = useCallback(() => {
    const id = setInterval(updateCurrentTime, 10);
    setIntervalId(id);
    setIsRunning(true);
  }, [updateCurrentTime]);

  // Controla o botão de iniciar/pausar/resetar
  const startStopResetCronometro = useCallback(() => {
    if (isRunning) {
      showConfirmationDialog('pause', 'Você tem certeza que deseja pausar o cronômetro?', pauseCronometro);
    } else {
      startCronometro();
    }
  }, [isRunning, showConfirmationDialog, pauseCronometro, startCronometro]);

  // Carrega a URL base do AsyncStorage
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) setApiUrlBase(savedUrlBase);
    };
    loadUrlBase();

    return () => {
      if (intervalId) {
        clearInterval(intervalId); // Limpa o intervalo ao desmontar
      }
    };
  }, [intervalId]);

  // Salva os dados do cronômetro
  const saveData = async (index) => {
    if (!isRunning) {
      Alert.alert('Erro', 'O cronômetro precisa estar rodando para salvar o tempo.');
      return;
    }

    const runnerNumber = runnerNumbers[index];
    if (!runnerNumber.trim()) {
      Alert.alert('Erro', 'Digite o número do corredor antes de salvar.');
      return;
    }

    if (isNaN(runnerNumber) || parseInt(runnerNumber) <= 0) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Número do corredor deve ser um número válido.';
        return newMessages;
      });
      return;
    }

    const data = {
      dados: [{ operador: userName, numero_atleta: parseInt(runnerNumber), momento_chegada: currentTime }],
    };

    const fullUrl = `${apiUrlBase}.execute-api.us-east-1.amazonaws.com/corre-familia/cronometros`;

    try {
      await axios.post(fullUrl, data, { headers: { 'Content-Type': 'application/json' } });

      setRunnerNumbers((prevNumbers) => {
        const newNumbers = [...prevNumbers];
        newNumbers[index] = '';
        return newNumbers;
      });

      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Tempo registrado com sucesso!';
        return newMessages;
      });
    } catch (error) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Número do corredor não encontrado.';
        return newMessages;
      });
      console.error(error);
    }
  };

  // Função para salvar os corredores atrasados
  const saveDelayedRunners = async () => {
    const delayedData = delayedRunnerNumbers.map((number, index) => ({
      operador: userName,
      numero_atleta: parseInt(number),
      momento_chegada: currentTime,
    }));

    if (delayedData.some(item => isNaN(item.numero_atleta) || item.numero_atleta <= 0)) {
      Alert.alert('Erro', 'Todos os números dos corredores atrasados devem ser válidos.');
      return;
    }

    const data = { dados: delayedData };

    const fullUrl = `${apiUrlBase}.execute-api.us-east-1.amazonaws.com/corre-familia/cronometros`;

    try {
      await axios.post(fullUrl, data, { headers: { 'Content-Type': 'application/json' } });

      setDelayedRunnerNumbers(['', '', '', '']);
      setModalVisible(false);
      Alert.alert('Sucesso', 'Todos os tempos dos corredores atrasados foram salvos!');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao salvar os corredores atrasados.');
    }
  };

  return (
    <View style={stylescronometro.container}>
      {/* Botão para voltar para a tela anterior */}
      <TouchableOpacity onPress={() => route.back()}>
        <Icon name="arrow-back" size={30} color="#000" />
      </TouchableOpacity>
      <View>
      <Text>Olá, {userName}!</Text>
    </View>

      <Text style={stylescronometro.title}>Cronômetro</Text>

      <Text style={stylescronometro.timer}>{currentTime}</Text>

      <View style={stylescronometro.rowContainer}>
        <View style={stylescronometro.buttonContainer}>
          <TouchableOpacity style={stylescronometro.button} onPress={startStopResetCronometro}>
            <Text style={stylescronometro.buttonText}>{isRunning ? 'Pausar' : 'Iniciar'}</Text>
          </TouchableOpacity>
        </View>
        <View style={stylescronometro.buttonContainer}>
          <TouchableOpacity style={stylescronometro.button} onPress={() => showConfirmationDialog('reset', 'Você tem certeza que deseja resetar o cronômetro?', resetCronometro)}>
            <Text style={stylescronometro.buttonText}>Resetar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Label para adicionar corredores */}
      <Text style={stylescronometro.label}>Adicionar corredores:</Text>

      {runnerNumbers.map((number, index) => (
        <View key={index} style={stylescronometro.inputRow}>
          <View style={stylescronometro.rowContainer}>
            <TextInput
              style={stylescronometro.input}
              placeholder="Número do Corredor"
              value={number}
              onChangeText={(text) => {
                const newNumbers = [...runnerNumbers];
                newNumbers[index] = text;
                setRunnerNumbers(newNumbers);
                setResponseMessages((prevMessages) => {
                  const newMessages = [...prevMessages];
                  newMessages[index] = '';  // Limpar a mensagem de resposta
                  return newMessages;
                });
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity style={stylescronometro.saveButton} onPress={() => saveData(index)}>
              <Text style={stylescronometro.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
          {responseMessages[index] && <Text style={stylescronometro.responseMessage}>{responseMessages[index]}</Text>}
        </View>
      ))}

      {/* Botão de "Partida Atrasada" */}
      <TouchableOpacity style={stylescronometro.button} onPress={() => setModalVisible(true)}>
        <Text style={stylescronometro.buttonText}>Partida Atrasada</Text>
      </TouchableOpacity>

      {/* Modal para corredores atrasados */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={stylescronometro.modalContainer4}>
          <View style={stylescronometro.modalContent4}>
            <Text style={stylescronometro.modalTitle4}>Corredores Atrasados</Text>
            {delayedRunnerNumbers.map((number, index) => (
              <View key={index} style={stylescronometro.inputRow}>
                <View style={stylescronometro.rowContainer}>
                  <TextInput
                    style={stylescronometro.input}
                    placeholder="Número do Corredor"
                    value={number}
                    onChangeText={(text) => {
                      const newNumbers = [...delayedRunnerNumbers];
                      newNumbers[index] = text;
                      setDelayedRunnerNumbers(newNumbers);
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={stylescronometro.saveButton} onPress={saveDelayedRunners}>
                    <Text style={stylescronometro.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={stylescronometro.button} onPress={() => setModalVisible(false)}>
              <Text style={stylescronometro.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Text style={stylescronometro.comment}>
        Este cronômetro permite que você registre o tempo de até 4 corredores. Digite o número do corredor e clique em "Salvar" para armazenar o tempo registrado.
      </Text>
    </View>
  );
}
