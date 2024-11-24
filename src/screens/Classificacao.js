import React, { useState } from 'react'; // Importa React e o hook useState para gerenciar o estado do componente
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Picker } from 'react-native'; // Importa componentes do React Native para criar a interface
import { useNavigation } from '@react-navigation/native'; // Importa o hook useNavigation para controlar a navegação entre telas
import Icon from 'react-native-vector-icons/Ionicons'; // Importa um ícone específico da biblioteca Ionicons para ser usado como botão de voltar
import styles from './Styles'; // Importa os estilos de um arquivo externo chamado Styles.js

// Componente para exibir a tela de Classificação
export default function Classificacao() {
  const navigation = useNavigation(); // Cria uma referência para a navegação, permitindo voltar para a tela anterior
  const [sexo, setSexo] = useState(''); // Estado para armazenar o sexo selecionado pelo usuário
  const [idade, setIdade] = useState(''); // Estado para armazenar a idade digitada pelo usuário
  const [Categoria, setCategoria] = useState('Corrida'); // Estado para armazenar a categoria selecionada (Caminhada ou Corrida)
  const [results, setResults] = useState([]); // Estado para armazenar os resultados recebidos da busca

  // Função assíncrona para buscar os dados do backend
  const buscarDados = async () => {
    try {
      // Faz uma requisição para a API usando fetch e passa os parâmetros sexo, idade e tipo de categoria
      const response = await fetch(`https://seu-backend.com/api/ranking?sexo=${sexo}&idade=${idade}&tipo=${Categoria}`);
      const data = await response.json(); // Converte a resposta da API em formato JSON
      setResults(data); // Atualiza o estado results com os dados recebidos
    } catch (error) {
      console.error('Erro ao buscar dados:', error); // Exibe uma mensagem de erro no console se algo der errado na requisição
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" /> {/* Ícone de seta para voltar */}
      </TouchableOpacity>

      {/* Título da tela */}
      <Text style={styles.title}>Classificação</Text> {/* Título para a tela de Classificação */}

      {/* Picker para selecionar o sexo */}
      <Text style={styles.label}>Selecione o Sexo:</Text>
      <Picker
        selectedValue={sexo}
        style={styles.input}
        onValueChange={(itemValue) => setSexo(itemValue)} // Atualiza o estado sexo quando o usuário seleciona um valor
      >
        <Picker.Item label="Masculino" value="masculino" /> {/* Opção Masculino */}
        <Picker.Item label="Feminino" value="feminino" /> {/* Opção Feminino */}
      </Picker>

      {/* Campo de entrada para a idade */}
      <Text style={styles.label}>Idade:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric" // Define que o teclado será numérico
        value={idade} // Valor atual do campo de idade
        onChangeText={setIdade} // Atualiza o estado idade quando o usuário digita
        placeholder="Digite a idade" // Texto que aparece como dica no campo de entrada
      />

      {/* Picker para selecionar a categoria */}
      <Text style={styles.label}>Categoria:</Text>
      <Picker
        selectedValue={Categoria}
        style={styles.input}
        onValueChange={(itemValue) => setCategoria(itemValue)} // Atualiza o estado Categoria quando o usuário seleciona um valor
      >
        <Picker.Item label="Caminhada" value="Caminhada" /> {/* Opção Caminhada */}
        <Picker.Item label="Corrida" value="Corrida" /> {/* Opção Corrida */}
      </Picker>

      {/* Botão para iniciar a busca dos dados */}
      <TouchableOpacity style={styles.button} onPress={buscarDados}>
        <Text style={styles.buttonText}>Pesquisar</Text> {/* Texto do botão */}
      </TouchableOpacity>

      {/* Exibe os resultados em uma tabela usando FlatList */}
      <FlatList
        data={results} // Dados a serem renderizados na lista
        keyExtractor={(item) => item.id.toString()} // Extrai a chave única de cada item (assumindo que cada item tem um 'id')
        renderItem={({ item, index }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text> {/* Posição na lista */}
            <Text style={styles.tableCell}>{item.numero}</Text> {/* Número do participante */}
            <Text style={styles.tableCell}>{item.nome}</Text> {/* Nome do participante */}
            <Text style={styles.tableCell}>{item.idade}</Text> {/* Idade do participante */}
            <Text style={styles.tableCell}>{item.sexo}</Text> {/* Sexo do participante */}
            <Text style={styles.tableCell}>{item.tempo}</Text> {/* Tempo do participante */}
          </View>
        )}
        ListHeaderComponent={() => (
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Posição</Text>
            <Text style={styles.tableHeaderCell}>Número</Text>
            <Text style={styles.tableHeaderCell}>Nome</Text>
            <Text style={styles.tableHeaderCell}>Idade</Text>
            <Text style={styles.tableHeaderCell}>Sexo</Text>
            <Text style={styles.tableHeaderCell}>Tempo</Text>
          </View>
        )}
      />
    </View>
  );
}
