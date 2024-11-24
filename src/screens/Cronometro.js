import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';

export default function Cronometro() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userName } = route.params;

  // Estados do cronômetro e do sistema
  const [runnerNumbers, setRunnerNumbers] = useState(['', '', '', '']);
  const [currentTime, setCurrentTime] = useState('00:00:00:00');
  const [responseMessages, setResponseMessages] = useState(['', '', '', '']);
  const [apiUrlBase, setApiUrlBase] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [counter, setCounter] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

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
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Cronômetro</Text>

      <Text style={styles.timer}>{currentTime}</Text>

      <View style={styles.rowContainer}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={startStopResetCronometro}>
            <Text style={styles.buttonText}>{isRunning ? 'Pausar' : 'Iniciar'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => showConfirmationDialog('reset', 'Você tem certeza que deseja resetar o cronômetro?', resetCronometro)}>
            <Text style={styles.buttonText}>Resetar</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Label para adicionar corredores */}
      <Text style={styles.label}> Adicionar corredores: </Text>

      {runnerNumbers.map((number, index) => (
        <View key={index} style={styles.inputRow}>
          <View style={styles.rowContainer}>
            <TextInput
              style={styles.input}
              placeholder="Número do Corredor"
              value={number}
              onChangeText={(text) => {
                const newNumbers = [...runnerNumbers];
                newNumbers[index] = text;
                setRunnerNumbers(newNumbers);
                setResponseMessages((prevMessages) => {
                  const newMessages = [...prevMessages];
                  newMessages[index] = '';
                  return newMessages;
                });
              }}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveButton} onPress={() => saveData(index)}>
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
          {responseMessages[index] && <Text style={styles.responseMessage}>{responseMessages[index]}</Text>}
        </View>
      ))}

      {/* Botão de "Partida Atrasada" */}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Partida Atrasada</Text>
      </TouchableOpacity>

      {/* Modal para corredores atrasados */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer4}>
          <View style={styles.modalContent4}>
            <Text style={styles.modalTitle4}>Corredores Atrasados</Text>
            {delayedRunnerNumbers.map((number, index) => (
              <View key={index} style={styles.inputRow}>
                <View style={styles.rowContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Número do Corredor"
                    value={number}
                    onChangeText={(text) => {
                      const newNumbers = [...delayedRunnerNumbers];
                      newNumbers[index] = text;
                      setDelayedRunnerNumbers(newNumbers);
                    }}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity style={styles.saveButton} onPress={saveDelayedRunners}>
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.comment}>
        Este cronômetro permite que você registre o tempo de até 4 corredores.
        Digite o número do corredor e clique em "Salvar" para armazenar o tempo registrado.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({

  // Contêiner principal que envolve toda a tela
  container: {
    flex: 1, // Permite que o contêiner ocupe toda a área disponível
    padding: 20, // Adiciona um espaçamento interno de 20 pixels
    backgroundColor: '#ADD8E6', // Cor de fundo azul claro
  },

  // Estilo para o botão de voltar
  backButton: {
    marginBottom: 30, // Espaçamento abaixo do botão
    top: 10, // Espaçamento acima do botão
    left: 10, // Espaçamento à esquerda do botão
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 1,
  },

  // Estilo para o texto do temporizador
  timer: {
    fontSize: 50, // Tamanho da fonte do temporizador
    fontWeight: 'bold', // Texto em negrito
    marginBottom: 10, // Espaçamento abaixo do temporizador
    marginTop: 10, // Espaçamento acima do temporizador
    textAlign: 'center', // Centraliza o texto horizontalmente
  },

  // Estilo geral para os botões
  button: {
    width: '70%', // Largura de 70% do contêiner pai
    backgroundColor: '#007BFF', // Cor de fundo azul
    padding: 15, // Espaçamento interno de 15 pixels
    borderRadius: 5, // Bordas arredondadas
    alignItems: 'center', // Centraliza o conteúdo do botão
    marginTop: 10, // Espaçamento acima do botão
    marginBottom: 10, // Espaçamento abaixo do botão
    alignSelf: 'center', // Centraliza o botão horizontalmente na tela
  },
  rowContainer: {
    flexDirection: 'row', // Alinha os filhos horizontalmente
    justifyContent: 'center', // Centraliza os botões dentro do contêiner
    alignItems: 'center', // Centraliza os botões verticalmente dentro do contêiner
    width: '100%', // Garante que o container ocupe a largura total
  },
  
  buttonContainer: {
    width: '48%', // Cada botão ocupa 48% da largura do contêiner
    marginHorizontal: 5, // Ajusta a distância entre os botões (ajuste conforme necessário)
    marginBottom: 10, // Espaçamento entre os botões e o resto da tela
  },
  
   // Estilo para o texto do botão
   buttonText: {
    color: '#FFFFFF', // Cor do texto (branco)
    fontSize: 16, // Tamanho da fonte do texto
  },
  saveButtonText: {
    color: '#FFFFFF', // Cor do texto (branco)
    fontSize: 15, // Tamanho da fonte do texto
  },
  // Estilo para os rótulos
  label: {
    fontSize: 16, // Tamanho da fonte do rótulo
    marginBottom: 5, // Espaçamento abaixo do rótulo
  },

  inputRow: {
    marginBottom: 5, // Espaçamento abaixo da linha de entrada
    width: '75%', // Largura de 75% do contêiner pai
  },
  // Container para alinhar o input e o botão
  rowContainer: {
    flexDirection: 'row', // Alinha os filhos em uma linha
    alignItems: 'center', // Centraliza os itens verticalmente
  },
  // Estilo para os campos de entrada
  input: {
    width: '100%', // Largura de 75% do contêiner pai
    height: 50, // Altura fixa de 50 pixels
    borderColor: '#ccc', // Cor da borda do campo de entrada
    backgroundColor: '#fff', // Cor de fundo branca
    borderWidth: 1, // Largura da borda de 1 pixel
    borderRadius: 5, // Bordas arredondadas
    paddingHorizontal: 10, // Espaçamento interno horizontal de 10 pixels
    marginBottom: 5, // Margem abaixo do input para espaçamento
  },
  // Estilo para o botão de salvar
  saveButton: {
    width: '30%', // Largura de 20% do contêiner pai
    height: 50,
    padding: 15, // Espaçamento interno de 15 pixels
    borderRadius: 5, // Bordas arredondadas
    backgroundColor: '#007BFF', // Cor de fundo azul
    alignItems: 'center', // Centraliza o conteúdo do botão
    justifyContent: 'center', // Alinha o conteúdo verticalmente no centro
    marginLeft: 10, // Espaçamento à esquerda do botão
    alignSelf: 'center',
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  
  modalContent4: {
    width: '100%', // Definindo uma largura fixa para o modal
    backgroundColor: '#fff',
    padding: 20, // Ajuste de padding para afastar os itens das bordas
    borderRadius: 10,    
    marginHorizontal: 20, // Garantindo que haja algum espaço nas bordas laterais
  },  
  modalTitle4: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20, // Aumentando o espaçamento inferior
  },
  comment: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  
});