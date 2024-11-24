// src/screens/ConfiguracaoScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './Styles';

const ConfiguracaoScreen = ({ navigation }) => {
  const defaultUrl = 'https://08mhx79l32'; // URL padrão
  const [urlBase, setUrlBase] = useState(defaultUrl);

  // Carrega a URL salva do AsyncStorage ou usa a padrão se não houver uma salva
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase); // Define a URL salva, se existir
      } else {
        await AsyncStorage.setItem('apiUrlBase', defaultUrl); // Salva a URL padrão se não houver uma salva
      }
    };
    loadUrlBase();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('apiUrlBase', urlBase); // Salva a URL base no AsyncStorage
      alert(`URL base salva: ${urlBase}`);
    } catch (error) {
      console.error('Erro ao salvar a URL base:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.label}>Editar URL base:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite a URL base (ex: https://192.168.0.5:9111)"
        value={urlBase}
        onChangeText={setUrlBase}
      />

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConfiguracaoScreen;
