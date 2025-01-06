import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Para salvar arquivos localmente
import * as Sharing from 'expo-sharing'; // Para compartilhar arquivos
import { useHandleAppStateCsv } from './ApagaUserName';


export default function ClassificacaoGeral() {
  const router = useRouter();
  const [sexo, setSexo] = useState('Todos');
  const [faixaEtaria, setFaixaEtaria] = useState('Todas');
  const [results, setResults] = useState([]);
  const [urlBase, setUrlBase] = useState<string>(''); // Estado para armazenar a URL base
  const [segmentacao, setSegmentacao] = useState({ sexo: [], range_idade: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [isSharing, setIsSharing] = useState(false); // Controle para compartilhamento

  useHandleAppStateCsv(isSharing);

  // Carregar a URL base salva
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase);
      } else {
        // Defina um valor padrão se não houver URL salva
        setUrlBase('https://hufd66cq2i');
      }
    };
    loadUrlBase();
  }, []);

  // Buscar segmentação da API
  useEffect(() => {
    const fetchSegmentacao = async () => {
      if (urlBase) { // Verifica se a URL base foi carregada
        try {
          const response = await axios.get(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/segmentacao`);
          if (response.data) {
            setSegmentacao(response.data); // Atualiza com os dados da segmentação
          }
        } catch (error) {
          console.error('Erro ao buscar dados de segmentação:', error);
        }
      }
    };

    fetchSegmentacao();
  }, [urlBase]); // O efeito depende da base URL da API

  const buscarDados = async () => {
    if (!urlBase) {
      console.error('URL base da API não foi definida');
      return;
    }
  
    let url = `${urlBase}.execute-api.us-east-1.amazonaws.com/prd/classificacao`;
  
    // Adiciona os parâmetros de acordo com os filtros selecionados
    let params = {};
  
    if (sexo !== 'Todos') params.sexo = sexo;
    if (faixaEtaria !== 'Todas') params.faixa_etaria = faixaEtaria;
  
    // Converte os parâmetros para uma string de query
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
  
    // Log para depuração
    console.log('Parâmetros de consulta:', queryParams);
    console.log('URL completa:', url);
  
    try {
      const response = await axios.get(url);
  
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        setResults(response.data);  // Atualiza com os dados retornados
        console.log('Dados recebidos:', response.data); // Log para verificar a estrutura dos dados
        await AsyncStorage.setItem('searchResults', JSON.stringify(response.data)); // Armazenar resultados
        setModalVisible(true); // Abre o modal quando os dados forem carregados
      } else {
        setResults([]);  // Garante que os resultados estarão vazios se não houver dados
        setModalVisible(true); // Abre o modal, mas vazio
        console.log('Nenhum dado válido encontrado');
        await AsyncStorage.removeItem('searchResults');
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  // Gerar arquivo CSV para exportação
  const generateCSV = async () => {
    const header = 'Posição,Número,Nome,Idade,Sexo,Tempo Atraso,Tempo Final\n';
    const rows = results.map((item, index) => {
      // Verifica se os campos necessários estão presentes e válidos
      const position = item.position || index + 1; // Usa o índice caso 'position' não esteja presente
      const numero = item.numero_peito || 'N/A';
      const nome = item.nome_atleta || 'N/A';
      const idade = item.idade || 'N/A';
      const sexo = item.sexo || 'N/A';
      const tempo_atrasado = item.tempo_atrasado || 'N/A';
      const tempo = item.tempo_corrida || 'N/A';

      return `${position},${numero},${nome},${idade},${sexo},${tempo_atrasado},${tempo}\n`;
    }).join('');

    const csvContent = header + rows;
    const fileUri = FileSystem.documentDirectory + 'resultados.csv';

    try {
      setIsSharing(true); // Define que o compartilhamento está ativo
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Erro ao gerar ou compartilhar o CSV:', error);
    } finally {
      setIsSharing(false); // Redefine o estado após o compartilhamento
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Classificação geral</Text>

      <Text style={styles.label}>Selecione o Sexo:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={sexo} style={styles.picker} onValueChange={(itemValue) => setSexo(itemValue)}>
          <Picker.Item label="Todos" value="Todos" />
          {segmentacao.sexo.map((sex, index) => (
            <Picker.Item key={index} label={sex} value={sex} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Faixa Etária:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={faixaEtaria} style={styles.picker} onValueChange={(itemValue) => setFaixaEtaria(itemValue)}>
          <Picker.Item label="Todas" value="Todas" />
          {segmentacao.range_idade.map((ageRange, index) => (
            <Picker.Item key={index} label={ageRange} value={ageRange} />
          ))}
        </Picker>
      </View>

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
                    <Text style={[styles.tableHeaderCell, styles.colDelay]}>Tempo Atrasado</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTime]}>Tempo Final</Text>
                  </View>
                )}
                renderItem={({ item, index }) => (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colPosition]}>{index + 1}</Text>
                    <Text style={[styles.tableCell, styles.colNumber]}>{item.numero_peito}</Text>
                    <Text style={[styles.tableCell, styles.colName]}>{item.nome_atleta}</Text>
                    <Text style={[styles.tableCell, styles.colAge]}>{item.idade}</Text>
                    <Text style={[styles.tableCell, styles.colGender]}>{item.sexo}</Text>
                    <Text style={[styles.tableCell, styles.colDelay]}>
                      {item.tempo_atraso ? item.tempo_atraso : 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTime]}>{item.tempo_corrida}</Text>
                  </View>
                )}
              />
            </ScrollView>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={generateCSV}>
              <Text style={styles.buttonText}>Gerar CSV</Text>
            </TouchableOpacity>
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
    fontSize: 30,
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
    borderLeftWidth: 1,
    borderRightColor: '#ccc', // Cor da borda direita
    borderLeftColor: '#ccc'
  },

  // Estilo para cada célula do cabeçalho
  tableHeaderCell: {
    fontWeight: 'bold', // Torna o texto do cabeçalho em negrito para diferenciá-lo das células
    textAlign: 'center', // Centraliza o texto dentro da célula do cabeçalho
    padding: 10, // Adiciona espaçamento interno para as células do cabeçalho
    color: '#007BFF', // Define a cor do texto no cabeçalho para destacar
    borderRightWidth: 1, // Define a largura da borda direita para separar visualmente as células
    borderLeftWidth: 1,
    borderRightColor: '#ccc', // Cor da borda direita
    borderLeftColor: '#ccc'
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
  colGender: { width: 90 }, // Define largura fixa de 60 para a coluna "Sexo"

  colDelay: {width: 100 },

  // Estilo para a coluna "Tempo" com largura fixa
  colTime: { width: 100 }, // Define largura fixa de 100 para a coluna "Tempo"
});