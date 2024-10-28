import React, { useState } from 'react'; 
// Importa a biblioteca React e o hook useState para gerenciar o estado.

import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Picker } from 'react-native';
// Importa componentes do React Native, como View, Text, TextInput, e outros para criar a interface.

import { useNavigation } from '@react-navigation/native'; 
// Importa o hook useNavigation para possibilitar a navegação entre as telas.

import Icon from 'react-native-vector-icons/Ionicons'; 
// Importa um ícone da biblioteca de ícones Ionicons para ser utilizado na interface.

import styles from './Styles'; 
// Importa um arquivo de estilos externo para aplicar as estilizações nos componentes. Certifique-se de que o caminho esteja correto.

export default function ClassificacaoGeral() {
  const navigation = useNavigation(); 
  // Hook para usar a navegação entre telas no React Navigation.

  const [sexo, setSexo] = useState(''); 
  // Estado para armazenar o valor do sexo selecionado.

  const [idade, setIdade] = useState(''); 
  // Estado para armazenar o valor da idade inserida.

  const [Categoria, setCategoria] = useState('Corrida'); 
  // Estado para armazenar a categoria selecionada, com "Corrida" como valor inicial.

  const [results, setResults] = useState([]); 
  // Estado para armazenar os resultados da busca, inicialmente uma lista vazia.

  // Função para buscar os dados no backend
  const buscarDados = async () => {
    try {
      const response = await fetch(`http://?sexo=${sexo}&idade=${idade}&tipo=${tipo}`);
      // Faz uma requisição para a API, utilizando sexo, idade e tipo como parâmetros de busca.

      const data = await response.json(); 
      // Converte a resposta da API em um formato JSON.

      setResults(data); 
      // Atualiza o estado de "results" com os dados recebidos da API.
    } catch (error) {
      console.error('Erro ao buscar dados:', error); 
      // Exibe um erro no console caso a requisição falhe.
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão de Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        {/* Botão que, ao ser pressionado, retorna para a tela anterior */}
        <Icon name="arrow-back" size={24} color="#000" />
        {/* Ícone de seta para a esquerda, representando o botão de voltar */}
      </TouchableOpacity>

      {/* Título da tela */}
      <Text style={styles.title}>Classificação Geral</Text> {/* Título para a tela de Classificação */}

      <Text style={styles.label}>Selecione o Sexo:</Text>
      <Picker
        selectedValue={sexo}
        style={styles.input}
        onValueChange={(itemValue) => setSexo(itemValue)}
      >
        {/* Componente Picker para selecionar o sexo */}
        <Picker.Item label="Masculino" value="masculino" />
        <Picker.Item label="Feminino" value="feminino" />
        {/* Opções do Picker para masculino e feminino */}
      </Picker>

      <Text style={styles.label}>Idade:</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={idade}
        onChangeText={setIdade}
        placeholder="Digite a idade"
      />
      {/* Campo de entrada de texto para a idade, apenas números são permitidos */}

      <Text style={styles.label}>Categoria:</Text>
      <Picker
        selectedValue={Categoria}
        style={styles.input}
        onValueChange={(itemValue) => setCategoria(itemValue)}
      >
        {/* Componente Picker para selecionar a categoria */}
        <Picker.Item label="Caminhada" value="Caminhada" />
        <Picker.Item label="Corrida" value="Corrida" />
        {/* Opções do Picker para "Caminhada" e "Corrida" */}
      </Picker>

      <TouchableOpacity style={styles.button} onPress={buscarDados}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>
      {/* Botão que, ao ser pressionado, chama a função "buscarDados" para buscar os dados do backend */}

      {/* Exibe os resultados em uma tabela */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        // Define uma chave única para cada item da lista, convertendo o ID para string.
        
        renderItem={({ item, index }) => (
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>{index + 1}</Text> 
            {/* Exibe a posição do participante (baseada no índice da lista) */}
            <Text style={styles.tableCell}>{item.numero}</Text> 
            {/* Exibe o número do participante */}
            <Text style={styles.tableCell}>{item.nome}</Text> 
            {/* Exibe o nome do participante */}
            <Text style={styles.tableCell}>{item.idade}</Text> 
            {/* Exibe a idade do participante */}
            <Text style={styles.tableCell}>{item.sexo}</Text> 
            {/* Exibe o sexo do participante */}
            <Text style={styles.tableCell}>{item.tempo}</Text> 
            {/* Exibe o tempo do participante */}
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
        // Renderiza um cabeçalho para a tabela, mostrando os nomes das colunas.
      />
    </View>
  );
}
