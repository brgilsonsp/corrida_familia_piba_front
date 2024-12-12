import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, AppState, AppStateStatus } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './Styles';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState(''); // Armazena o nome do usuário
  const [isModalVisible, setModalVisible] = useState(false); // Modal para capturar o nome
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false); // Modal para senha
  const [password, setPassword] = useState(''); // Armazena a senha digitada
  const correctPassword = 'corrida123'; // Senha correta definida

  // Gerencia estado AsyncStorage e limpa dados no AppState
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        try {
          await AsyncStorage.removeItem('userName');
          console.log('Username removido com sucesso!');
        } catch (error) {
          console.error('Erro ao limpar username', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const loadStoredUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName);
        } else {
          setModalVisible(true); // Exibe modal se não tiver usuário salvo
        }
      } catch (error) {
        console.error('Erro ao carregar AsyncStorage', error);
      }
    };

    loadStoredUserName();
  }, []);

  // Função para salvar o nome no AsyncStorage
  const handleNameSubmit = async () => {
    if (userName.trim()) {
      try {
        await AsyncStorage.setItem('userName', userName);
        console.log('Nome salvo com sucesso!');
        setModalVisible(false);
      } catch (error) {
        console.error('Erro ao salvar nome no AsyncStorage', error);
      }
    }
  };

  // Lógica para exibir modal de senha
  const handleSettingsPress = () => {
    setPasswordModalVisible(true);
  };

  // Função para verificar a senha e redirecionar
  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setPasswordModalVisible(false);
      router.push('/ConfiguracaoScreen');
    } else {
      alert('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      {userName ? <Text style={styles.userName}>Olá, {userName}!</Text> : null}

      {/* Modal para capturar o nome caso não esteja configurado */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Por favor, insira seu nome:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={userName}
              onChangeText={setUserName}
            />
            <TouchableOpacity style={styles.button} onPress={handleNameSubmit}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para senha */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPasswordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Digite sua senha para acessar configurações:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Image source={require('../../assets/cronometro.png')} style={styles.image} />

      {/* Botões de navegação */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/Cronometro?userName=${userName}`)}
      >
        <Text style={styles.buttonText}>Cronômetro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push(`/Checkin?monitor=${userName}`)}
      >
        <Text style={styles.buttonText}>Check in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/Classificacao')}
      >
        <Text style={styles.buttonText}>Classificação</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/ClassificacaoGeral')}
      >
        <Text style={styles.buttonText}>Classificação Geral</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/')}
      >
        <Text style={styles.buttonText}>Atualizar Dados</Text>
      </TouchableOpacity>

      {/* Botão para abrir o modal de senha */}
      <TouchableOpacity
        style={styles.configButton}
        onPress={handleSettingsPress}
      >
        <Icon name="settings" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
