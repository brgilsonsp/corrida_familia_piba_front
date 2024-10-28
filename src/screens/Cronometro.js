import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native'; 
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios'; // Importa o axios para requisições HTTP
import styles from './Styles'; // Importa o estilo definido em outro arquivo

// Componente principal Cronometro
export default function Cronometro() {
  const navigation = useNavigation(); // Hook para navegação entre telas
  const route = useRoute(); // Para acessar os parâmetros passados na navegação
  const { userName } = route.params; // Recebe o nome do usuário da tela Home
  const [runnerNumbers, setRunnerNumbers] = useState(['', '', '', '']); // Estado para armazenar os números dos corredores (4 campos)
  const [currentTime, setCurrentTime] = useState(''); // Estado para armazenar o tempo atual do cronômetro
  const [responseMessages, setResponseMessages] = useState(['', '', '', '']); // Estado para armazenar mensagens de resposta para cada corredor
  const intervalRef = useRef(null); // Referência para armazenar o intervalo do cronômetro

  // Função que atualiza o tempo atual
  const updateCurrentTime = () => {
    const now = new Date(); // Cria um objeto de data e hora atual
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(Math.floor(now.getMilliseconds() / 10)).padStart(2, '0')}`; 
    // Formata a hora, minuto, segundo e centésimos de segundo
    setCurrentTime(formattedTime); // Atualiza o estado com o tempo formatado
  };

  // Hook useEffect para iniciar e limpar o intervalo de atualização do tempo
  useEffect(() => {
    intervalRef.current = setInterval(updateCurrentTime, 10); // Atualiza o tempo a cada 10 milissegundos
    return () => clearInterval(intervalRef.current); // Limpa o intervalo ao desmontar o componente
  }, []);

  // Função para salvar os dados de um corredor
  const saveData = async (index) => {
    const runnerNumber = runnerNumbers[index]; // Obtém o número do corredor do índice correspondente

    if (runnerNumber.trim() === '') {
      Alert.alert('Erro', 'Digite o número do corredor antes de salvar.'); // Exibe alerta se o campo estiver vazio
      return; // Interrompe a função caso o número não seja preenchido
    }

    // Verifica se o número do corredor é válido (por exemplo, deve ser um número positivo)
    if (isNaN(runnerNumber) || parseInt(runnerNumber) <= 0) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Número do corredor deve ser um número válido.'; // Mensagem de erro
        return newMessages;
      });
      return; // Interrompe a função se o número não for válido
    }

    const data = {
      dados: [
        {
          operador: userName, // Inclui o nome do usuário
          numero_atleta: parseInt(runnerNumber), // Converte o número do corredor para inteiro
          momento_chegada: currentTime, // Tempo atual no momento do salvamento
        }
      ]
    };

    try {
      // Realiza a requisição POST para a API
      await axios.post('http://localhost:9090/timing', data, {
        headers: {
          'Content-Type': 'application/json' // Define o cabeçalho para JSON
        }
      });

      setRunnerNumbers((prevNumbers) => {
        const newNumbers = [...prevNumbers];
        newNumbers[index] = ''; // Limpa o campo de número do corredor após salvar
        return newNumbers;
      });

      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Tempo registrado com sucesso!'; // Mensagem de sucesso
        return newMessages;
      }); 
    } catch (error) {
      setResponseMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[index] = 'Número do corredor não encontrado.'; // Mensagem de erro em caso de falha
        return newMessages;
      });
      console.error(error); // Loga o erro no console para debug
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" /> {/* Ícone de seta para voltar */}
      </TouchableOpacity>

      {/* Título do Cronômetro */}
      <Text style={styles.title}>Cronômetro</Text>

      <Text style={styles.timer}>{currentTime}</Text> {/* Exibe o tempo do cronômetro */}

      {runnerNumbers.map((number, index) => (
        <View key={index} style={styles.inputRow}>
          {/* Container para o Input e o Botão */}
          <View style={styles.rowContainer}>
            <TextInput
              style={styles.input}
              placeholder={`Número do Corredor`} // Placeholder do input
              value={number} // Valor do input (número do corredor)
              onChangeText={(text) => {
                const newNumbers = [...runnerNumbers];
                newNumbers[index] = text; // Atualiza o valor do número do corredor
                setRunnerNumbers(newNumbers); // Atualiza o estado
                // Limpa a mensagem de resposta ao alterar o input
                setResponseMessages((prevMessages) => {
                  const newMessages = [...prevMessages];
                  newMessages[index] = ''; // Limpa a mensagem correspondente
                  return newMessages;
                });
              }}
              keyboardType="numeric" // Define o tipo do teclado para numérico
            />
            {/* Botão para salvar o tempo */}
            <TouchableOpacity style={styles.saveButton} onPress={() => saveData(index)}>
              <Text style={styles.buttonText}>Salvar</Text> 
            </TouchableOpacity>
          </View>
          {/* Mensagem de retorno abaixo do input e do botão */}
          <Text style={styles.responseMessage}>{responseMessages[index]}</Text>
        </View>
      ))}

      <Text style={styles.comment}>
        Este cronômetro permite que você registre o tempo de até 4 corredores. 
        Digite o número do corredor e clique em "Salvar" para armazenar o tempo registrado.
      </Text>
    </View>
  );
}