import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput, Modal, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getCorredorByNumber, insertCorredor,updateCorredor } from './initializeDatabase';
import useServerTime from './useServerTime';
import { useUserContext } from './UserContext';

export default function Cronometro() {
  const route = useRouter();
  const [runnerNumbers, setRunnerNumbers] = useState(['', '', '', '']);
  const [responseMessages, setResponseMessages] = useState(['', '', '', '']);
  const { userName } = useUserContext(); // Acesso ao contexto de usuário
  const { serverTime } = useServerTime();
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [delayedRunnerNumbers, setDelayedRunnerNumbers] = useState(['', '', '', '']);
  const [responseColors, setResponseColors] = useState([]);

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
  
    if (!runnerNumber.trim()) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Digite o número do corredor antes de salvar.';
        return newMessages;
      });
      setResponseColors((prevColors) => {
        const newColors = [...prevColors];
        newColors[index] = 'red';
        return newColors;
      });
      return;
    }
  
    if (isNaN(runnerNumber) || parseInt(runnerNumber) <= 0) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Digite um número válido.';
        return newMessages;
      });
      setResponseColors((prevColors) => {
        const newColors = [...prevColors];
        newColors[index] = 'red';
        return newColors;
      });
      return;
    }
  
    const { exists, corredor } = await checkRunnerStatus(parseInt(runnerNumber));
  
    if (exists && corredor) {
      if (!corredor.tempo_final) {
        try {
          await updateCorredor({
            numero_corredor: parseInt(runnerNumber),
            monitor: userName,
            tempo_final: formatTimeToDisplay(currentTime),
          });
  
          setResponseMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = 'Tempo final atualizado com sucesso!';
            return newMessages;
          });
          setResponseColors((prevColors) => {
            const newColors = [...prevColors];
            newColors[index] = 'blue';
            return newColors;
          });
        } catch (error) {
          console.error('Erro ao atualizar tempo final:', error);
          Alert.alert('Erro ao atualizar tempo final.');
        }
      } else {
        setResponseMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[index] = `O tempo final já foi registrado: ${corredor.tempo_final}`;
          return newMessages;
        });
        setResponseColors((prevColors) => {
          const newColors = [...prevColors];
          newColors[index] = 'red';
          return newColors;
        });
      }
    } else {
      try {
        await insertCorredor({
          numero_corredor: parseInt(runnerNumber),
          monitor: userName,
          tempo_final: formatTimeToDisplay(currentTime),
          tempo_de_atraso: 'N/A',
        });
  
        setResponseMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[index] = 'Tempo final registrado com sucesso!';
          return newMessages;
        });
        setResponseColors((prevColors) => {
          const newColors = [...prevColors];
          newColors[index] = 'blue';
          return newColors;
        });
      } catch (error) {
        console.error('Erro ao registrar tempo final:', error);
        Alert.alert('Erro ao registrar tempo final.');
      }
    }
  
    setRunnerNumbers((prevNumbers) => {
      const newNumbers = [...prevNumbers];
      newNumbers[index] = '';
      return newNumbers;
    });
  };  

  const saveDelayedRunners = async (index) => {
    const runnerNumber = delayedRunnerNumbers[index];

    // Verifica se o número do corredor foi informado
    if (!runnerNumber.trim()) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Digite o número do corredor antes de salvar.';
        return newMessages;
      });
      setResponseColors((prevColors) => {
        const newColors = [...prevColors];
        newColors[index] = 'red'; // Cor vermelha para erro
        return newColors;
      });
      return;
    }

    // Verifica se o número do corredor é válido
    if (isNaN(runnerNumber) || parseInt(runnerNumber) <= 0) {
        setResponseMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            newMessages[index] = 'Digite um número válido.';
            return newMessages;
        });
        setResponseColors((prevColors) => {
            const newColors = [...prevColors];
            newColors[index] = 'red'; // Cor vermelha para erro
            return newColors;
        });
        return;
    }

    const { exists, corredor } = await checkRunnerStatus(parseInt(runnerNumber));

    if (exists && corredor) { // Verifica se o corredor foi encontrado
        if (corredor.tempo_final) {
            setResponseMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[index] = `O tempo final já foi registrado: ${corredor.tempo_final}`;
                return newMessages;
            });
            setResponseColors((prevColors) => {
                const newColors = [...prevColors];
                newColors[index] = 'red'; // Cor vermelha para erro
                return newColors;
            });
        } else if (corredor.tempo_de_atraso) {
            setResponseMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[index] = `O tempo atrasado já foi registrado: ${corredor.tempo_de_atraso}`;
                return newMessages;
            });
            setResponseColors((prevColors) => {
                const newColors = [...prevColors];
                newColors[index] = 'red'; // Cor vermelha para erro
                return newColors;
            });
        }
    } else {
        try {
            // Salva o tempo de atraso se o tempo final não existir
            await insertCorredor({
                numero_corredor: parseInt(runnerNumber),
                monitor: userName,
                tempo_de_atraso: formatTimeToDisplay(currentTime),
            });

            setResponseMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[index] = 'Tempo de atraso atualizado com sucesso!';
                return newMessages;
            });
            setResponseColors((prevColors) => {
                const newColors = [...prevColors];
                newColors[index] = 'blue'; // Cor azul para sucesso
                return newColors;
            });
        } catch (error) {
            console.error('Erro ao atualizar tempo de atraso:', error);
            Alert.alert('Erro ao atualizar tempo de atraso.');
            setResponseMessages((prevMessages) => {
                const newMessages = [...prevMessages];
                newMessages[index] = 'Erro ao atualizar tempo de atraso.';
                return newMessages;
            });
            setResponseColors((prevColors) => {
                const newColors = [...prevColors];
                newColors[index] = 'red'; // Cor vermelha para erro
                return newColors;
            });
        }
    }

    // Limpa apenas o campo correspondente ao índice
    setDelayedRunnerNumbers((prevNumbers) => {
        const newNumbers = [...prevNumbers];
        newNumbers[index] = '';
        return newNumbers;
    });
};

  const openDelayedRunners = async () =>{
    setRunnerNumbers(['', '', '', '']); // Limpa os números dos corredores
    setResponseMessages(['', '', '', '']); // Limpa as mensagens de resposta  
    setModalVisible(true);// Abre o modal de Partida Atrasada
  };

  const exitDelayedRunners = async () =>{
    setRunnerNumbers(['', '', '', '']); // Limpa os números dos corredores
    setResponseMessages(['', '', '', '']); // Limpa as mensagens de resposta  
    setModalVisible(false);// Abre o modal de Partida Atrasada
    setDelayedRunnerNumbers(['', '', '', '']); // Limpa os números atrasados
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
                // Bloqueia o ponto (.) e a vírgula (,)
                const sanitizedText = text.replace(/[,.\-\s]/g, ''); // Remove qualquer ponto ou vírgula
                
                const newNumbers = [...runnerNumbers];
                newNumbers[index] = sanitizedText;
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
          {responseMessages[index] && (
            <Text
              style={[
                stylescronometro.mensagem,
                { color: responseColors[index] || 'black' }, // Cor definida no estado ou cor padrão
              ]}
            >
              {responseMessages[index]}
            </Text>
          )}
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
                        // Remove pontos e vírgulas
                        const sanitizedText = text.replace(/[,.\-\s]/g, ''); // Remove qualquer ponto ou vírgula
                        
                        const newNumbers = [...delayedRunnerNumbers];
                        newNumbers[index] = sanitizedText;
                        setDelayedRunnerNumbers(newNumbers);
                      }}
                      keyboardType="numeric"  // Usando teclado numérico, que não inclui ponto ou vírgula
                    />
                    <TouchableOpacity style={stylescronometro.saveButton} onPress={() => saveDelayedRunners(index)}>
                      <Text style={stylescronometro.saveButtonText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                  {responseMessages[index] && (
                    <Text
                      style={[
                        stylescronometro.mensagem,
                        { color: responseColors[index] || 'black' }, // A cor é definida pela variável de estado ou cor padrão
                      ]}
                    >
                      {responseMessages[index]}
                    </Text>
                  )}
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

const { width, height } = Dimensions.get('window');

const stylescronometro = StyleSheet.create({
  
  // Contêiner principal
  container: {
    flex: 1,
    padding: width * 0.05,
    backgroundColor: '#F0F8FF', // Fundo suave azul claro
  },
  
  // Estilo para o botão de voltar
  backButton: {
    marginBottom: width * 0.03, // Espaçamento abaixo do botão
    top: width * 0.01, // Espaçamento acima do botão
    left: height * 0.002, // Espaçamento à esquerda do botão
  },

  title: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 1,
  },

  // Estilo para o texto do temporizador
  timer: {
    fontSize: 45,
    fontWeight: 'bold',
    color: '#007BFF', 
    marginBottom: width * 0.01,
    textAlign: 'center',
  },

  // Estilo geral para os botões
  button: {
    width: '80%',
    backgroundColor: '#007BFF',
    padding: '5%',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: '2%',
    marginBottom: '2%',
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
    width: width * 0.4, // Cada botão ocupa 48% da largura do contêiner
    marginHorizontal: height * 0.1, // Ajusta a distância entre os botões (ajuste conforme necessário)
    marginBottom: width * 0.1, // Espaçamento entre os botões e o resto da tela
  },  
  // Estilo para o texto do botão
  buttonText: {
  color: '#FFFFFF', // Cor do texto (branco)
  fontSize: 20, // Tamanho da fonte do texto
  },
  saveButtonText: {
    color: '#FFFFFF', // Cor do texto (branco)
    fontSize: 20, // Tamanho da fonte do texto
  },
  // Estilo para os rótulos
  label: {
    fontSize: 20, // Tamanho da fonte do rótulo
    marginBottom: width * 0.01, // Espaçamento abaixo do rótulo
  },
  mensagem:{
    fontSize: 17, // Tamanho da fonte do rótulo
    color: 'red',
  },

  inputRow: {
    marginBottom: width * 0.02, // Espaçamento abaixo da linha de entrada
    width: width * 0.9, // Largura de 75% do contêiner pai
    alignSelf: 'center',
  },
  // Estilo para os campos de entrada
  input: {
    width: width * 0.65, // Largura de 75% do contêiner pai
    height: height * 0.066, // Altura fixa de 50 pixels
    fontSize:20,
    borderColor: '#ccc', // Cor da borda do campo de entrada
    backgroundColor: '#fff', // Cor de fundo branca
    borderWidth: 1, // Largura da borda de 1 pixel
    borderRadius: 5, // Bordas arredondadas
    paddingHorizontal: 10, // Espaçamento interno horizontal de 10 pixels
    marginBottom: width * 0.012, // Margem abaixo do input para espaçamento
  },
  // Estilo para o botão de salvar
  saveButton: {
    width: width * 0.25, // Largura de 20% do contêiner pai
    height: height * 0.068,
    padding: width * 0.031, // Espaçamento interno de 15 pixels
    borderRadius: 10, // Bordas arredondadas
    backgroundColor: '#007BFF', // Cor de fundo azul
    alignItems: 'center', // Centraliza o conteúdo do botão
    marginLeft: width * 0.02, // Espaçamento à esquerda do botão
    alignSelf: 'center',
    marginBottom: width * 0.012,
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
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10, // Aumentando o espaçamento inferior
    textAlign: 'center',
  },
  comment: {
    marginTop: 5,
    textAlign: 'center',
    fontSize:16,
    color: '#555',
  },
});