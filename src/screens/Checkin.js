import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Importando o Picker
import styles from './Styles';

export default function Checkin() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [number, setNumber] = useState('');
  const [urlBase, setUrlBase] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [isDobEditable, setIsDobEditable] = useState(false);
  const [isNumberEditable, setIsNumberEditable] = useState(false);
  const [isNameEditable, setIsNameEditable] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Carrega a URL base do AsyncStorage
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase);
      }
    };
    loadUrlBase();
  }, []);

  // Função para buscar nomes da API com base no texto digitado
  const fetchNames = async (text) => {
    setQuery(text);
    if (text.length > 0 && urlBase) {
      try {
        const response = await axios.get(`${urlBase}.execute-api.us-east-1.amazonaws.com/corre-familia/atletas`, {
          params: { start_name: text }
        });
        const data = response.data;

        if (data.dados && data.dados.length > 0) {
          setSuggestions(data.dados);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Erro ao buscar nomes:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  // Função para tratar a seleção de um nome a partir da lista de sugestões
  const handleSelectName = (name) => {
    setSelectedName(name);
    setQuery(name.nome_completo);
    setDob(name.data_nascimento);
    setGender(name.sexo);
    setSuggestions([]);
    setIsDobEditable(false);
    setIsNameEditable(false);
    setIsNumberEditable(false);
  };

  // Função para tratar o processo de checkout
  const handleCheckout = async () => {
    if (!selectedName || !number) {
      alert('Por favor, selecione um nome e insira um número.');
      return;
    }

    // Definindo os dados a serem enviados no PUT
    const athleteNumberData = {
      id: selectedName.id, // ID do atleta selecionado
      numero_atleta: parseInt(number), // Número do atleta
    };

    try {
      // Requisição PUT para atualizar o número do atleta
      const response = await axios.put(`${urlBase}/corre-familia/atletas`, athleteNumberData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Exibindo a resposta da API
      console.log('Número do atleta atualizado com sucesso:', response.data);
      alert('Número atualizado com sucesso!');

      // Resetando os campos após sucesso
      setSelectedName(null);
      setNumber('');
      setQuery('');
      setDob('');
      setGender('');
      setSuggestions([]);
    } catch (error) {
      console.error('Erro ao atualizar o número do atleta:', error);
      alert('Erro ao atualizar o número do atleta. Tente novamente.');
    }
  };

  // Função para lidar com o botão de voltar
  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home'); // Substitua 'Home' pelo nome da tela que você quer
    }
  };

  // Função para abrir o calendário
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // Função para lidar com a data escolhida
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDob(selectedDate.toLocaleDateString());
    }
    setShowDatePicker(false);
  };

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Check-in</Text>

      {/* Campo de busca de nome */}
      <View style={styles.margem}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={fetchNames}
          placeholder="Digite o nome"
          editable={!query || isNameEditable} // Permite editar apenas se o campo estiver vazio ou se estiver no modo de edição
        />
        {/* Caneta de edição sempre visível */}
        <TouchableOpacity onPress={() => setIsNameEditable(true)}>
          <Icon name="pencil" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Exibe sugestões de nomes */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectName(item)}>
                <Text style={styles.suggestionItem}>{item.nome_completo}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Campo para digitar o número */}
      <View style={styles.margem}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={number}
          onChangeText={setNumber}
          placeholder="Digite o número"
          editable={!number || isNumberEditable} // Permite editar apenas se o campo estiver vazio ou se estiver no modo de edição
        />
        {/* Caneta de edição sempre visível */}
        <TouchableOpacity onPress={() => setIsNumberEditable(true)}>
          <Icon name="pencil" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Campo de Data de Nascimento */}
      <View style={styles.margem}>
        <TextInput
          style={styles.input}
          value={dob}
          editable={isDobEditable}
          onChangeText={setDob}
          placeholder="Data de Nascimento"
        />
        <TouchableOpacity onPress={() => openDatePicker()}>
          <Icon name="calendar" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Data Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date(dob)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      {/* Campo de Sexo - Usando Picker para selecionar o sexo */}
      <View style={styles.margem}>
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.input} // Estilo personalizado para o Picker
        >
          <Picker.Item label="Selecione o Sexo" value="" />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Feminino" value="Feminino" />
        </Picker>
      </View>

      {/* Botão de checkout */}
      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <Text style={styles.buttonText}>Check in</Text>
      </TouchableOpacity>

      {/* Instruções para o usuário */}
      <Text style={styles.comment}>
        Selecione um nome da lista de sugestões ou digite um novo nome, e em seguida, insira um número para concluir o check-in.
      </Text>
    </View>
  );
}
