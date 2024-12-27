import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getCorredorByNumber, updateCorredor, getAllCorredores } from './database/initializeDatabase';
import useServerTime from './hook/useServerTime';

export default function Cronometro() {
  const route = useRouter();
  const [runnerNumbers, setRunnerNumbers] = useState(['', '', '', '']);
  const [responseMessages, setResponseMessages] = useState(['', '', '', '']);
  const [userName, setUserName] = useState('');
  const { serverTime } = useServerTime();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [delayedRunnerNumbers, setDelayedRunnerNumbers] = useState(['', '', '', '']);

  const animationFrameId = useRef<number | null>(null);  // Ref para armazenar o ID do requestAnimationFrame
  const lastTimeRef = useRef(0);  // Ref para armazenar o tempo do último quadro
  const startTimeRef = useRef(0);  // Ref para armazenar o tempo inicial do cronômetro

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

  // Verifica se o número do corredor existe no banco de dados e se tem tempos finais ou atrasados
  const checkRunnerStatus = async (runnerNumber) => {
    try {
      const corredor = await getCorredorByNumber(runnerNumber);
      if (corredor) {
        console.log(`Número encontrado: ${runnerNumber}`);
        return { exists: true, corredor };
      }
      console.log(`Número não encontrado: ${runnerNumber}`);
      return { exists: false, corredor: null };

    } catch (error) {
      console.error('Erro ao verificar corredor:', error);
      return { exists: false, corredor: null };
    }
  };

  const saveData = async (index) => {
    const runnerNumber = runnerNumbers[index];

    // Verifica se o número do corredor foi preenchido
    if (!runnerNumber.trim()) {
        Alert.alert('Erro', 'Digite o número do corredor antes de salvar.');
        return;
    }

    // Valida se o número do corredor é válido
    if (isNaN(runnerNumber) || parseInt(runnerNumber) <= 0) {
        setResponseMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = 'Número do corredor deve ser um número válido.';
            return newMessages;
        });
        return;
    }

    const { exists, corredor } = await checkRunnerStatus(parseInt(runnerNumber));

    // Se o corredor existir, verifica o campo tempo_final
    if (exists) {
        if (corredor.tempo_final) {
            setResponseMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[index] = `O tempo final já foi registrado: ${corredor.tempo_final}`;
                return newMessages;
            });
        } else {
            try {
                // Atualiza o tempo final no banco de dados
                await updateCorredor({
                    numero_corredor: corredor.numero_corredor,
                    monitor: userName,
                    tempo_final: formatTimeToDisplay(currentTime),
                    tempo_de_atraso: corredor.tempo_de_atraso
                });
                console.log(`Tempo final registrado: ${formatTimeToDisplay(currentTime)} para o corredor número ${runnerNumber}`);
                setResponseMessages((prevMessages) => {
                    const newMessages = [...prevMessages];
                    newMessages[index] = 'Tempo final atualizado com sucesso!';
                    return newMessages;
                });
            } catch (error) {
                console.error('Erro ao atualizar tempo final:', error);
                Alert.alert('Erro ao atualizar tempo final.');
            }
        }
    } else {
        setResponseMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = `Número do corredor ${runnerNumber} não encontrado.`;
            return newMessages;
        });
    }
    setRunnerNumbers(['', '', '', '']); // Limpa os números dos corredores
  };

  const openDelayedRunners = async () =>{
    setRunnerNumbers(['', '', '', '']); // Limpa os números dos corredores
    setResponseMessages(['', '', '', '']); // Limpa as mensagens de resposta  
    setModalVisible(true);// Abre o modal de Partida Atrasada
  }
  const exitDelayedRunners = async () =>{
    setRunnerNumbers(['', '', '', '']); // Limpa os números dos corredores
    setResponseMessages(['', '', '', '']); // Limpa as mensagens de resposta  
    setModalVisible(false);// Abre o modal de Partida Atrasada
    setDelayedRunnerNumbers(['', '', '', '']); // Limpa os números atrasados
  }

  const saveDelayedRunners = async (index) => {
    const runnerNumber = delayedRunnerNumbers[index];
  
    // Verifica se o número do corredor foi informado
    if (!runnerNumber.trim()) {
      Alert.alert('Erro', 'Digite o número do corredor antes de salvar.');
      return;
    }
  
    // Verifica se o número do corredor é válido
    if (isNaN(runnerNumber) || parseInt(runnerNumber) <= 0) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Número do corredor deve ser um número válido.';
        return newMessages;
      });
      return;
    }
  
    // Verifica se o corredor existe
    const { exists, corredor } = await checkRunnerStatus(parseInt(runnerNumber));
  
    if (exists) {
      // Verifica se o corredor já tem tempo de atraso registrado
      if (corredor.tempo_de_atraso) {
        setResponseMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[index] = `O tempo de atraso já foi registrado: ${corredor.tempo_de_atraso}`;
          // Limpa os números de corredores atrasados após a operação
          setDelayedRunnerNumbers(['', '', '', '']);
          return newMessages;
        });
      } else {
        // Verifica se o tempo final já foi registrado
        if (corredor.tempo_final) {
          setResponseMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = `O tempo final já foi registrado: ${corredor.tempo_final}`;
            setDelayedRunnerNumbers(['', '', '', '']);
            return newMessages;
          });
          return; // Não salva se já houver tempo final
        }
  
        try {
          // Atualiza o tempo de atraso
          await updateCorredor({
            numero_corredor: corredor.numero_corredor,
            monitor: userName,
            tempo_final: corredor.tempo_final,
            tempo_de_atraso: formatTimeToDisplay(currentTime),
          });
  
          // Mensagem de sucesso
          setResponseMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = 'Tempo de atraso atualizado com sucesso!';
            return newMessages;
          });
        } catch (error) {
          console.error('Erro ao atualizar tempo de atraso:', error);
          Alert.alert('Erro ao atualizar tempo de atraso.');
        }
      }
    } else {
      // Mensagem caso o corredor não seja encontrado
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = `Número do corredor ${runnerNumber} não encontrado.`;
        return newMessages;
      });
    }
  
    // Limpa os números de corredores atrasados após a operação
    setDelayedRunnerNumbers(['', '', '', '']);
  };  
  
  return (
    <View style={stylescronometro.container}>
      {/* Botão para voltar para a tela anterior */}
      <TouchableOpacity onPress={() => route.back()} style={stylescronometro.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={stylescronometro.title}>Cronômetro atual:</Text>
      
      {/* Exibir "00:00:00.00" até o serverTime aparecer */}
      <Text style={stylescronometro.timer}>
        {serverTime ? formatTimeToDisplay(currentTime) : '00:00:00.00'}
      </Text>
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
          {responseMessages[index] && <Text>{responseMessages[index]}</Text>}
        </View>
      ))}

      {/* Botão de "Partida Atrasada" */}
      <TouchableOpacity style={stylescronometro.button} onPress={() => openDelayedRunners()}>
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
                  <TouchableOpacity style={stylescronometro.saveButton} onPress={() => saveDelayedRunners(index)}>
                    <Text style={stylescronometro.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
                <Text>{responseMessages[index]}</Text>
              </View>
            ))}
            <TouchableOpacity style={stylescronometro.button} onPress={() => exitDelayedRunners()}>
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

const stylescronometro = StyleSheet.create({
  
  // Contêiner principal
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F8FF', // Fundo suave azul claro
  },
  
  // Estilo para o botão de voltar
  backButton: {
    marginBottom: 30, // Espaçamento abaixo do botão
    top: 5, // Espaçamento acima do botão
    left: 1, // Espaçamento à esquerda do botão
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 1,
  },

  // Estilo para o texto do temporizador
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007BFF', 
    marginBottom: 20,
    textAlign: 'center',
  },

  // Estilo geral para os botões
  button: {
    width: '80%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4, // Para Android
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
    alignSelf: 'center',
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
    borderRadius: 10, // Bordas arredondadas
    backgroundColor: '#007BFF', // Cor de fundo azul
    alignItems: 'center', // Centraliza o conteúdo do botão
    marginLeft: 10, // Espaçamento à esquerda do botão
    alignSelf: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 4, // Para Android
  },

  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
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
    textAlign: 'center',
  },
  comment: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
});