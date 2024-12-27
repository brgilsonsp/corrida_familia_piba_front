import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal, AppState, AppStateStatus, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          onPress={() => router.push(`/Cronometro?userName=${userName}`)}
        >
          <Icon name="timer" size={20} color="#fff" />
          <Text style={styles.buttonText}>Cronômetro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push(`/Checkin?monitor=${userName}`)}
        >
          <Icon name="check-circle" size={20} color="#fff" />
          <Text style={styles.buttonText}>Check in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/Classificacao')}
        >
          <Icon name="stars" size={20} color="#fff" />
          <Text style={styles.buttonText}>Classificação</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/ClassificacaoGeral')}
        >
          <Icon name="leaderboard" size={20} color="#fff" />
          <Text style={styles.buttonText}>Classificação Geral</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/')}
        >
          <Icon name="refresh" size={20} color="#fff" />
          <Text style={styles.buttonText}>Atualizar Dados</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.configButton}
        onPress={handleSettingsPress}
      >
        <Icon name="settings" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    width: '80%',
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  userName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  configButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 30,
    elevation: 10,
    zIndex: 1,
  },
  buttonRow: {
    top: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    width: '48%',
    backgroundColor: '#007BFF',
    padding: 35,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  modalButton: {
    width: '80%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#f7f7f7',
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
    alignSelf: 'center',
    marginTop: 50,
  },
});
