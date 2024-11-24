import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import styles from './Styles';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function Home({ navigation }) {
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const correctPassword = 'corrida123'; // Defina a senha correta aqui

  const handleNameSubmit = () => {
    if (userName.trim()) {
      setIsNameSet(true);
      setModalVisible(false);
    }
  };

  const handleSettingsPress = () => {
    setPasswordModalVisible(true); // Abre o modal de senha
  };

  const handlePasswordSubmit = () => {
    if (password === correctPassword) {
      setPasswordModalVisible(false); // Fecha o modal de senha
      navigation.navigate('Configuração'); // Navega para a tela de configurações
    } else {
      alert('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      {isNameSet && <Text style={styles.userName}>Olá, {userName}!</Text>}

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

      {/* Modal de senha para acessar configurações */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPasswordModalVisible}
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalText}>Digite a senha para acessar as configurações:</Text>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={true} // Oculta o texto para o campo de senha
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
              <Text style={styles.buttonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Image source={require('../../assets/cronometro.png')} style={styles.image} />

      {/* Botões de navegação */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Cronometro', { userName })}
      >
        <Text style={styles.buttonText}>Cronômetro</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AtualizarDados')}
      >
        <Text style={styles.buttonText}>Atualizar Dados</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Checkin')}
      >
        <Text style={styles.buttonText}>Check in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Classificacao')}
      >
        <Text style={styles.buttonText}>Classificação</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ClassificacaoGeral')}
      >
        <Text style={styles.buttonText}>Classificação Geral</Text>
      </TouchableOpacity>

      {/* Botão de configuração com ícone de engrenagem */}
      <TouchableOpacity
        style={styles.configButton}
        onPress={handleSettingsPress} // Abre o modal de senha
      >
        <Icon name="settings" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
