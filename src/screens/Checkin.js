import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './Styles';

// Componente funcional Checkin
export default function Checkin() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedName, setSelectedName] = useState(null); // Mudei para null para melhor verificação
  const [number, setNumber] = useState('');

  // Função para buscar nomes da API com base no texto digitado
  const fetchNames = async (text) => {
    setQuery(text);
    if (text.length > 0) {
      try {
        const response = await fetch(`http://localhost:9090/athlete?start_name=${text}`);
        const data = await response.json();

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
    setSelectedName(name); // Armazena o objeto completo, incluindo o ID
    setQuery(name.nome_completo); // Atualiza o campo de busca com o nome completo
    setSuggestions([]); // Limpa as sugestões após selecionar um nome
  };

  // Função para tratar o processo de checkout
  const handleCheckout = async () => {
    if (!selectedName || !number) {
      alert('Por favor, selecione um nome e insira um número.');
      return;
    }

    // Dados que serão enviados para a atualização do atleta
    const athleteNumberData = {
      id: selectedName.id, // ID do atleta selecionado
      numero_atleta: parseInt(number), // Número digitado convertido para inteiro
    };

    try {
      const response = await fetch('http://localhost:9090/athlete', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(athleteNumberData), // Envia o objeto atualizado
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar o número do atleta');
      }

      const result = await response.json();
      console.log('Número do atleta atualizado com sucesso:', result);
      alert('Número atualizado com sucesso!');

      // Reseta os estados após o checkout
      setSelectedName(null); // Reseta para null após o checkout
      setNumber('');
      setQuery('');
      setSuggestions([]);
    } catch (error) {
      console.error('Erro ao atualizar o número do atleta:', error);
      alert('Erro ao atualizar o número do atleta. Tente novamente.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Check-in</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={fetchNames}
          placeholder="Digite o nome"
        />
      </View>

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectName(item)}>
                <Text style={styles.suggestionItem}>{item.nome_completo}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={number}
          onChangeText={setNumber}
          placeholder="Digite o número"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <Text style={styles.buttonText}>Check in</Text>
      </TouchableOpacity>

      <Text style={styles.comment}>
        Selecione um nome da lista de sugestões ou digite um novo nome, e em seguida, insira um número para concluir o check-in.
      </Text>
    </View>
  );
}
