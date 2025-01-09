import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, Image, Modal, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import usePostCorredores from './AtualizarDados';
import { initializeDatabase } from './initializeDatabase';
import {useUserContext} from './UserContext'

export default function Home() {
  const router = useRouter();
  const { userName, setUserName } = useUserContext(); // Acessa o contexto
  const [isModalVisible, setModalVisible] = useState(false); // Modal para capturar o nome
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false); // Modal para senha
  const [password, setPassword] = useState(''); // Armazena a senha digitada
  const correctPassword = 'Corrida123'; // Senha correta definida
  const { postLargadas, postChegadas } = usePostCorredores();
  
  // Usar o useEffect para chamar a função apenas quando o app for aberto pela primeira vez
  useEffect(() => {
    const checkDatabaseInitialization = async () => {
      const hasInitialized = await AsyncStorage.getItem('database_initialized');

      if (!hasInitialized) {
        // Chama a função para inicializar o banco de dados
        await initializeDatabase();

        // Marca o banco como inicializado
        await AsyncStorage.setItem('database_initialized', 'true');
      }
    };

    checkDatabaseInitialization();
  }, []);

  // Usar o useEffect para verificar se o nome do usuário já foi salvo
  useEffect(() => {
    if (!userName) {
      setModalVisible(true); // Se o nome não estiver preenchido, abre o modal
    }
  }, [userName]);

  // Função para salvar o nome no estado
  const handleNameSubmit = () => {
    if (userName.trim()) {
      setModalVisible(false);
    } else {
      alert('Nome inválido. Por favor, insira um nome.');
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

  // Função para Enviar os dados para a API que faz a pesistência no banco de dados
  const handleEnviarDados = async () => {
    try {
      // Agora, você pode chamar as funções postLargadas e postChegadas diretamente
      await postLargadas();  // Envia as largadas
      await postChegadas();  // Envia as chegadas

      Alert.alert('Sucesso', 'Dados enviados para as APIs!');
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao enviar os dados.');
    }
  };

  return (
    <View style={styles.container}>
      {userName ? <Text style={styles.userName}>Olá, {userName}!</Text> : null}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Por favor, insira seu nome:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              value={userName}
              onChangeText={setUserName}/>
            <TouchableOpacity style={styles.modalButton} onPress={handleNameSubmit}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPasswordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Digite sua senha para acessar configurações:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}/>
            <TouchableOpacity style={styles.modalButton} onPress={handlePasswordSubmit}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Image source={require('../../assets/cronometro.png')} style={styles.image} />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/Cronometro`)}>
          <Icon name="timer" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cronômetro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/Checkin`)}>
          <Icon name="check-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>Check in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/Classificacao')}>
          <Icon name="leaderboard" size={20} color="#fff" />
          <Text style={styles.buttonText}>Classificação offline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/ClassificacaoGeral')}>
          <Icon name="leaderboard" size={20} color="#fff" />
          <Text style={styles.buttonText}>Classificação geral online</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleEnviarDados}>
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Atualizar Dados</Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé com a versão */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>V. 1.0.0 - TESTE</Text>
      </View>
      
      <TouchableOpacity
        style={styles.configButton}
        onPress={handleSettingsPress}
      >
        <Icon name="settings" size={25} color="#fff" />
      </TouchableOpacity>

    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05, 
    backgroundColor: '#F0F8FF',
    justifyContent: 'flex-start',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.8, 
    height: height * 0.25,  
    padding: width * 0.07,  
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center', 
  },
  modalText: {
    fontSize: 16, 
    color: '#333',
    marginBottom: width * 0.04, 
    textAlign: 'center',
  },
  modalButton: {
    width: width * 0.5, 
    backgroundColor: '#007BFF',
    paddingVertical: width * 0.03, 
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  input: {
    width: width * 0.7, 
    height: height * 0.06, 
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03, 
    marginBottom: height * 0.025, 
    backgroundColor: '#f7f7f7',
  },
  userName: {
    fontSize:25, 
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    top: width * 0.06,
    left: height * 0.02,
  },
  configButton: {
    position: 'absolute',
    top: height * 0.025, 
    right: width * 0.04, 
    backgroundColor: '#007BFF',
    padding: width * 0.025, 
    borderRadius: 30,
    elevation: 10,
    zIndex: 1,
  },
  buttonRow: {
    top: height * 0.03, 
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: height * 0.005, 
    marginHorizontal: width * 0.05
  },
  button: {
    width: width * 0.388, 
    height: '100%', 
    backgroundColor: '#007BFF',
    padding: width * 0.065,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15, 
    textAlign: 'center'
  },
  image: {
    width: 150, 
    height: 150, 
    marginBottom: width * 0.01, 
    alignSelf: 'center',
    marginTop: width * 0.2, 
  },
  footer: {
    position: 'fixed',
    top: width * 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 15,
    color: '#555',
  },
});