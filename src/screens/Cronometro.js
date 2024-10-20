import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import Icon from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import styles from './Styles'; // Importa o estilo definido em outro arquivo

// Componente principal Cronometro
export default function Cronometro() {
  const navigation = useNavigation(); // Hook para navegação entre telas
  const [runnerNumbers, setRunnerNumbers] = useState(['', '', '', '']); // Estado para armazenar os números dos corredores (4 campos)
  const [currentTime, setCurrentTime] = useState(''); // Estado para armazenar o tempo atual do cronômetro
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

    const data = {
      number: runnerNumber, // Número do corredor
      time: currentTime, // Tempo atual no momento do salvamento
    };

    const fileUri = `${FileSystem.documentDirectory}relatorio.json`; // Caminho do arquivo para armazenar os dados

    try {
      let jsonData = [];
      const fileExists = await FileSystem.getInfoAsync(fileUri); // Verifica se o arquivo já existe

      if (fileExists.exists) {
        const existingData = await FileSystem.readAsStringAsync(fileUri); // Lê os dados existentes
        jsonData = JSON.parse(existingData); // Converte os dados para um array
      }

      jsonData.push(data); // Adiciona o novo dado ao array
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(jsonData, null, 2), {
        encoding: FileSystem.EncodingType.UTF8, // Salva os dados no arquivo no formato JSON
      });

      setRunnerNumbers((prevNumbers) => {
        const newNumbers = [...prevNumbers];
        newNumbers[index] = ''; // Limpa o campo de número do corredor após salvar
        return newNumbers;
      });

      Alert.alert('Sucesso', 'Tempo registrado com sucesso!'); // Exibe uma mensagem de sucesso
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar os dados.'); // Alerta em caso de erro ao salvar
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
      <Text style={styles.title}>
        Cronômetro
      </Text>

      <Text style={styles.timer}>{currentTime}</Text> {/* Exibe o tempo do cronômetro */}

      {runnerNumbers.map((number, index) => (
        <View key={index} style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={`Número do Corredor`} // Placeholder do input
            value={number} // Valor do input (número do corredor)
            onChangeText={(text) => {
              const newNumbers = [...runnerNumbers];
              newNumbers[index] = text; // Atualiza o valor do número do corredor
              setRunnerNumbers(newNumbers); // Atualiza o estado
            }}
            keyboardType="numeric" // Define o tipo do teclado para numérico
          />
          <TouchableOpacity style={styles.saveButton} onPress={() => saveData(index)}>
            <Text style={styles.buttonText}>Salvar</Text> {/* Botão para salvar o tempo */}
          </TouchableOpacity>
        </View>
      ))}

      {/* Comentário explicativo na parte inferior */}
      <Text style={styles.comment}>
        Este cronômetro permite que você registre o tempo de até 4 corredores. 
        Digite o número do corredor e clique em "Salvar" para armazenar o tempo atual.
      </Text>
    </View>
  );
}
