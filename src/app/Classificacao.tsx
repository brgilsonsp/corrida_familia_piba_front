import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system'; // Para salvar arquivos localmente
import * as Sharing from 'expo-sharing'; // Para compartilhar arquivos
import  searchCorredores  from './initializeDatabase'; // Importar a função searchCorredores

export default function Classificacao() {
  const router = useRouter();
  const [numeroCorredor, setNumeroCorredor] = useState('');
  const [results, setResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  // Função para buscar corredor por número
  const buscarCorredorPorNumero = async () => {
    try {
      const numero = parseInt(numeroCorredor, 10);
      if (isNaN(numero)) {
        console.error('Número do corredor inválido');
        return;
      }

      const corredores = await searchCorredores(numero); // Passando o número do corredor
      if (corredores.length === 0) {
        console.log('Nenhum corredor encontrado com o número informado');
      }
      setResults(corredores);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao buscar corredor:', error);
    }
  };

  // Função para buscar todos os corredores
  const buscarTodosCorredores = async () => {
    try {
      const corredores = await searchCorredores() || [];
      setResults(corredores);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao buscar todos os corredores:', error);
    }
  };

  const generateCSV = async () => {
    const header = 'Posição,Número,Tempo Atrasado,Tempo Final\n';
    const rows = results.map((item) =>
      `${item.posicao},${item.numero_corredor},${item.tempo_atraso || 'N/A'},${item.tempo_final || "N/A"}\n`
    ).join('');

    const csvContent = header + rows;
    const fileUri = FileSystem.documentDirectory + 'resultados.csv';

    try {
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Erro ao compartilhar CSV:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Classificação</Text>

      <Text style={styles.label}>Número do Corredor:</Text>
      <TextInput
        style={styles.input}
        value={numeroCorredor}
        onChangeText={(text) => {
          // Remover as vírgulas e pontos
          const sanitizedText = text.replace(/[,.\-\s]/g, '');
          setNumeroCorredor(sanitizedText);
        }}
        placeholder="Digite o número do corredor"
        keyboardType="numeric"  // Usando teclado numérico
      />

      <TouchableOpacity style={styles.button} onPress={buscarCorredorPorNumero}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={buscarTodosCorredores}>
        <Text style={styles.buttonText}>Listar todos os corredores</Text>
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
                keyExtractor={(item, index) => (index !== undefined ? index.toString() : '')}
                stickyHeaderIndices={[0]}
                ListHeaderComponent={() => (
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colPosition]}>Posição</Text>
                    <Text style={[styles.tableHeaderCell, styles.colNumber]}>Número</Text>
                    <Text style={[styles.tableHeaderCell, styles.colDelay]}>Tempo Atrasado</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTime]}>Tempo Final</Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colPosition]}>{item.posicao}</Text>
                    <Text style={[styles.tableCell, styles.colNumber]}>{item.numero_corredor}</Text>
                    <Text style={[styles.tableCell, styles.colDelay]}>
                      {item.tempo_atraso ? item.tempo_atraso : 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.colTime]}>
                      {item.tempo_final ? item.tempo_final : 'N/A'}
                    </Text>
                  </View>
                )}
              />
            </ScrollView>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.buttonModal} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonModal} onPress={generateCSV}>
                  <Text style={styles.buttonText}>Gerar CSV</Text>
                </TouchableOpacity>
              </View>
          </View>
        </View>
      </Modal>
      <Text style={styles.comment}>
          Classificação que busca as informações da base de dados do seu celular.
      </Text>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

// Definindo os estilos usando StyleSheet.create()
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05,
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
    fontSize:20,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f7f7f7',
    marginBottom: 20,
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
    fontSize: 20, // Tamanho da fonte do rótulo
    marginBottom: 5, // Espaçamento abaixo do rótulo
  },
  buttonContainer: {
    flexDirection: 'row',  // Alinha os botões na horizontal
    justifyContent: 'space-between',  // Espaça os botões igualmente
    marginTop: 10,  // Espaço superior para separação
  },
  // Estilo geral para os botões
  button: {
    width: '85%',
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
  buttonModal: {
    width: '45%',
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
    fontSize: 20,
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
    fontSize:17,
    paddingVertical: 10, // Adiciona espaçamento interno na célula para afastar o texto das bordas
    borderRightWidth: 1, // Define a largura da borda direita para separar visualmente as células
    borderLeftWidth: 1,
    borderRightColor: '#ccc', // Cor da borda direita
    borderLeftColor: '#ccc'
  },

  // Estilo para cada célula do cabeçalho
  tableHeaderCell: {
    fontWeight: 'bold', // Torna o texto do cabeçalho em negrito para diferenciá-lo das células
    textAlign: 'center', // Centraliza o texto dentro da célula do cabeçalho
    fontSize:17,
    paddingVertical: 10, // Adiciona espaçamento interno para as células do cabeçalho
    paddingHorizontal: 3,
    color: '#007BFF', // Define a cor do texto no cabeçalho para destacar
    borderRightWidth: 1, // Define a largura da borda direita para separar visualmente as células
    borderLeftWidth: 1,
    borderRightColor: '#ccc', // Cor da borda direita
    borderLeftColor: '#ccc'
  },

  // Estilo para a coluna "Posição" com largura fixa
  colPosition: { width: width * 0.19 }, // Define largura fixa de 60 para a coluna "Posição"

  // Estilo para a coluna "Número" com largura fixa
  colNumber: { width: width * 0.19 }, // Define largura fixa de 80 para a coluna "Número"

  colDelay: { width: width * 0.25 },  

  // Estilo para a coluna "Tempo" com largura fixa
  colTime: {  width: width * 0.25 }, // Define largura fixa de 100 para a coluna "Tempo"

  comment: {
    marginTop: 5,
    textAlign: 'center',
    fontSize:16,
    color: '#555',
  },
});