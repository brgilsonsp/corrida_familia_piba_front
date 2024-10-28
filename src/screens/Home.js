import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import styles from './Styles';

export default function Home({ navigation }) {
  const [userName, setUserName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [isModalVisible, setModalVisible] = useState(true);

  const handleNameSubmit = () => {
    if (userName.trim()) {
      setIsNameSet(true);
      setModalVisible(false);
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

      <Image source={require('../../assets/cronometro.png')} style={styles.image} />

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Cronometro', { userName })} // Passa o nome do usuário
      >
        <Text style={styles.buttonText}>Cronômetro</Text>
      </TouchableOpacity>

      {/* Outros botões de navegação */}
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
    </View>
  );
}
