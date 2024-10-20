import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Importa o hook useNavigation para navegação entre telas
import Icon from 'react-native-vector-icons/Ionicons'; // Importa ícones da biblioteca Ionicons
import styles from './Styles'; // Importa os estilos definidos em um arquivo separado

export default function Checkin() {
  const navigation = useNavigation(); // Inicializa o hook para navegação
  const [query, setQuery] = useState(''); // Estado para armazenar a entrada do usuário
  const [suggestions, setSuggestions] = useState([]); // Estado para armazenar sugestões de nomes
  const [selectedName, setSelectedName] = useState(''); // Estado para armazenar o nome selecionado
  const [number, setNumber] = useState(''); // Estado para armazenar um número digitado

  // Função para buscar nomes no backend quando o texto é alterado
  const fetchNames = async (text) => {
    setQuery(text); // Atualiza o estado com o texto atual
    if (text.length > 2) { // Verifica se o texto possui mais de 2 caracteres
      try {
        // Faz uma requisição ao backend para buscar nomes que correspondem ao texto
        const response = await fetch(`https://seu-backend.com/api/names?query=${text}`);
        const data = await response.json(); // Converte a resposta para JSON
        setSuggestions(data); // Atualiza o estado com os dados recebidos
      } catch (error) {
        console.error('Erro ao buscar nomes:', error); // Registra erros no console
      }
    } else {
      setSuggestions([]); // Limpa as sugestões se o texto tiver 2 caracteres ou menos
    }
  };

  // Função chamada ao selecionar um nome da lista de sugestões
  const handleSelectName = (name) => {
    setSelectedName(name); // Atualiza o estado com o nome selecionado
    setQuery(name); // Atualiza o campo de entrada com o nome selecionado
    setSuggestions([]); // Limpa a lista de sugestões
  };

  // Função chamada ao clicar no botão de check-in
  const handleCheckout = () => {
    console.log('Nome selecionado:', selectedName); // Exibe o nome selecionado no console
    console.log('Número:', number); // Exibe o número digitado no console
  };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" /> {/* Ícone de voltar */}
      </TouchableOpacity>

      {/* Título do Check-in */}
      <Text style={styles.title}>Check-in</Text> {/* Título */}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input} // Estilo para o campo de entrada
          value={query} // Valor do campo de entrada
          onChangeText={fetchNames} // Chama a função ao alterar o texto
          placeholder="Digite o nome" // Texto de placeholder
        />
      </View>

      {/* Exibe as sugestões em uma lista */}
      {suggestions.length > 0 && (
        <FlatList
          data={suggestions} // Dados a serem exibidos
          keyExtractor={(item) => item.id.toString()} // Extrai a chave de cada item
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSelectName(item.name)}> {/* Chama a função ao selecionar um nome */}
              <Text style={styles.suggestionItem}>{item.name}</Text> {/* Exibe o nome */}
            </TouchableOpacity>
          )}
          style={styles.suggestionsContainer} // Estilo para o container das sugestões
        />
      )}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input} // Usando o mesmo estilo para manter o tamanho
          keyboardType="numeric" // Permite apenas entrada numérica
          value={number} // Valor do campo de entrada
          onChangeText={setNumber} // Atualiza o estado ao alterar o texto
          placeholder="Digite o número" // Texto de placeholder
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleCheckout}> {/* Botão de check-in */}
        <Text style={styles.buttonText}>Check in</Text> {/* Texto do botão */}
      </TouchableOpacity>
      {/* Comentário explicativo */}
      <Text style={styles.comment}>
        Selecione um nome da lista de sugestões ou digite um novo nome, e em seguida, insira um número para concluir o check-in.
      </Text>
    </View>
  );
}
