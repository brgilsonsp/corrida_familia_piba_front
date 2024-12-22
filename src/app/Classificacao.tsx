import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Para salvar arquivos localmente
import * as Sharing from 'expo-sharing'; // Para compartilhar arquivos

export default function ClassificacaoGeral() {
  const router = useRouter();
  const [sexo, setSexo] = useState('Todos');
  const [faixaEtaria, setFaixaEtaria] = useState('Todas');
  const [categoria, setCategoria] = useState('Todas');
  const [results, setResults] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [apiUrlBase, setApiUrlBase] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [nomeCorredor, setNomeCorredor] = useState(''); // Novo estado para o nome
  const [numeroCorredor, setNumeroCorredor] = useState(''); // Novo estado para o número
  
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) setApiUrlBase(savedUrlBase);
    };
    loadUrlBase();
  }, []);

  const buscarDados = async () => {
    if (!apiUrlBase) {
      console.error('URL base da API não foi definida');
      return;
    }

    const fullUrl = `${apiUrlBase}.execute-api.us-east-1.amazonaws.com/corre-familia/classificacoes`;

    try {
      const response = await axios.get(fullUrl, {
        params: {
          sexo: sexo,
          faixa_etaria: faixaEtaria,
          categoria: categoria,
          nome_corredor: nomeCorredor || undefined, // Apenas envia se o valor existir
          numero_corredor: numeroCorredor || undefined, // Apenas envia se o valor existir
        },
      });
      setResults(response.data.dados);
      await AsyncStorage.setItem('searchResults', JSON.stringify(response.data.dados)); // Armazenar resultados
      setModalVisible(true); // Abre o modal quando os dados forem carregados
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const generateCSV = () => {
    const header = 'Posição,Número,Nome,Idade,Sexo,Tempo\n';
    const rows = results.map(item => 
      `${item.position},${item.numero_atleta},${item.nome_completo_atleta},${item.idade},${item.sexo},${item.tempo_corrida}\n`
    ).join('');
    const csvContent = header + rows;
    const fileUri = FileSystem.documentDirectory + 'resultados.csv';
    
    FileSystem.writeAsStringAsync(fileUri, csvContent).then(() => {
      Sharing.shareAsync(fileUri);
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Classificação Geral</Text>

      <Text style={styles.label}>Selecione o Sexo:</Text>
      <View style={styles.pickerContainer}>  {/* Contêiner com borda */}
        <Picker selectedValue={sexo} style={styles.picker} onValueChange={(itemValue) => setSexo(itemValue)}>
          <Picker.Item label="Todos" value="Todos" />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Feminino" value="Feminino" />
        </Picker>
      </View>

      <Text style={styles.label}>Faixa Etária:</Text>
      <View style={styles.pickerContainer}>  {/* Contêiner com borda */}
        <Picker selectedValue={faixaEtaria} style={styles.picker} onValueChange={(itemValue) => setFaixaEtaria(itemValue)}>
          <Picker.Item label="Todas" value="Todas" />
          <Picker.Item label="6 - 7" value="6 - 7" />
          <Picker.Item label="8 - 12" value="8 - 12" />
          <Picker.Item label="13 - 15" value="13 - 15" />
          <Picker.Item label="16 - 20" value="16 - 20" />
          <Picker.Item label="21 - 30" value="21 - 30" />
          <Picker.Item label="31 - 40" value="31 - 40" />
          <Picker.Item label="41 - 50" value="41 - 50" />
          <Picker.Item label="51 - 60" value="51 - 60" />
          <Picker.Item label="61+" value="61+" />
        </Picker>
      </View>

      <Text style={styles.label}>Categoria:</Text>
      <View style={styles.pickerContainer}>  {/* Contêiner com borda */}
        <Picker selectedValue={categoria} style={styles.picker} onValueChange={(itemValue) => setCategoria(itemValue)}>
          <Picker.Item label="Todas" value="Todas" />
          <Picker.Item label="Caminhada" value="Caminhada" />
          <Picker.Item label="Corrida" value="Corrida" />
        </Picker>
      </View>

      <Text style={styles.label}>Nome do Corredor:</Text>
        <TextInput
          style={styles.input}
          value={nomeCorredor}
          onChangeText={(text) => setNomeCorredor(text)}
          placeholder="Digite o nome do corredor"
        />

      <Text style={styles.label}>Número do Corredor:</Text>
        <TextInput
          style={styles.input}
          value={numeroCorredor}
          onChangeText={(text) => setNumeroCorredor(text)}
          placeholder="Digite o número do corredor"
          keyboardType="numeric"
        />

      <TouchableOpacity style={styles.button} onPress={buscarDados}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>
      
      {/* Modal de Resultados */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay2}>
          <View style={styles.modalContainer2}>
            <ScrollView horizontal>
              <FlatList
                data={results}
                keyExtractor={(item, index) => index.toString()}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={() => (
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colPosition]}>Posição</Text>
                    <Text style={[styles.tableHeaderCell, styles.colNumber]}>Número</Text>
                    <Text style={[styles.tableHeaderCell, styles.colName]}>Nome</Text>
                    <Text style={[styles.tableHeaderCell, styles.colAge]}>Idade</Text>
                    <Text style={[styles.tableHeaderCell, styles.colGender]}>Sexo</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTime]}>Tempo</Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colPosition]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, styles.colNumber]}>{item.numero_atleta}</Text>
                    <Text style={[styles.tableCell, styles.colName]}>{item.nome_completo_atleta}</Text>
                    <Text style={[styles.tableCell, styles.colAge]}>{item.idade}</Text>
                    <Text style={[styles.tableCell, styles.colGender]}>{item.sexo}</Text>
                    <Text style={[styles.tableCell, styles.colTime]}>{item.tempo_corrida}</Text>
                  </View>
                )}
              />
            </ScrollView>

            {/* Botões dentro do modal de resultados */}
            <View>
              <TouchableOpacity style={styles.button} onPress={generateCSV}>
                <Text style={styles.buttonText}>Baixar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Definindo os estilos usando StyleSheet.create()
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F0F8FF', // Gradiente suave
  },
  // Estilo para o botão de voltar
  backButton: {
    marginBottom: 30, // Espaçamento abaixo do botão
    top: 10, // Espaçamento acima do botão
    left: 10, // Espaçamento à esquerda do botão
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 3,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007BFF', 
  },
  // Estilo para os campos de entrada
  pickerContainer: {
    width: '100%', // Garante que o contêiner ocupe a largura completa
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 5, // Espaçamento abaixo do contêiner
  },
  picker: {
    width: '100%',
    height: 50, // Ajuste a altura para que combine com o layout
    backgroundColor: '#f7f7f7', // Cor de fundo do Picker
  },
  // Estilo para os rótulos
  label: {
    fontSize: 16, // Tamanho da fonte do rótulo
    marginBottom: 5, // Espaçamento abaixo do rótulo
  },
  // Estilo geral para os botões
  button: {
    width: '50%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4, // Para Android
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  modalOverlay2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semitransparente
  },
  modalContainer2: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '80%',
  },
  // Estilo para o cabeçalho da tabela
  tableHeader: {
    flexDirection: 'row', // Coloca os elementos do cabeçalho em uma linha horizontal
    backgroundColor: '#f0f0f0', // Define a cor de fundo do cabeçalho
    paddingVertical: 15, // Adiciona espaçamento vertical no cabeçalho para deixar mais espaçado
    borderBottomWidth: 2, // Define a largura da borda inferior do cabeçalho
    borderBottomColor: '#007BFF', // Cor da borda inferior para dar destaque ao cabeçalho
  },

  // Estilo para as linhas de dados da tabela
  tableRow: {
    flexDirection: 'row', // Coloca as células das linhas de dados em uma linha horizontal
    paddingVertical: 10, // Adiciona espaçamento vertical para as linhas de dados
    borderBottomWidth: 1, // Define a largura da borda inferior das linhas de dados
    borderBottomColor: '#ccc', // Cor da borda inferior para separar visualmente as linhas
    backgroundColor: '#f0f0f0', // Define a cor de fundo
  },

  // Estilo para cada célula na linha de dados
  tableCell: {
    textAlign: 'center', // Centraliza o texto dentro da célula
    padding: 10, // Adiciona espaçamento interno na célula para afastar o texto das bordas
    borderRightWidth: 1, // Define a largura da borda direita para separar visualmente as células
    borderRightColor: '#ccc', // Cor da borda direita
  },

  // Estilo para cada célula do cabeçalho
  tableHeaderCell: {
    fontWeight: 'bold', // Torna o texto do cabeçalho em negrito para diferenciá-lo das células
    textAlign: 'center', // Centraliza o texto dentro da célula do cabeçalho
    padding: 10, // Adiciona espaçamento interno para as células do cabeçalho
    color: '#007BFF', // Define a cor do texto no cabeçalho para destacar
    borderRightWidth: 1, // Define a borda direita para separar visualmente cada célula do cabeçalho
    borderRightColor: '#ccc', // Cor da borda direita
  },

  // Estilo para a coluna "Posição" com largura fixa
  colPosition: { width: 75 }, // Define largura fixa de 60 para a coluna "Posição"

  // Estilo para a coluna "Número" com largura fixa
  colNumber: { width: 75 }, // Define largura fixa de 80 para a coluna "Número"

  // Estilo para a coluna "Nome" com largura fixa
  colName: { width: 85 }, // Define largura fixa de 150 para a coluna "Nome"

  // Estilo para a coluna "Idade" com largura fixa
  colAge: { width: 60 }, // Define largura fixa de 60 para a coluna "Idade"

  // Estilo para a coluna "Sexo" com largura fixa
  colGender: { width: 85 }, // Define largura fixa de 60 para a coluna "Sexo"

  // Estilo para a coluna "Tempo" com largura fixa
  colTime: { width: 100 }, // Define largura fixa de 100 para a coluna "Tempo"
});