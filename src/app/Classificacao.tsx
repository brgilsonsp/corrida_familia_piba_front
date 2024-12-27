import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Modal, TextInput, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system'; // Para salvar arquivos localmente
import * as Sharing from 'expo-sharing'; // Para compartilhar arquivos
import searchCorredores from './database/initializeDatabase'; // Importar a função searchCorredores

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
      const corredores = await searchCorredores(); // Sem parâmetro, buscando todos
      setResults(corredores);
      setModalVisible(true);
    } catch (error) {
      console.error('Erro ao buscar todos os corredores:', error);
    }
  };

  // Gerar arquivo CSV para exportação
  const generateCSV = () => {
    const header = 'Posição,Número,Nome,Tempo Final\n';
    const rows = results.map((item, index) =>
      `${item.posicao},${item.numero_corredor},${item.nome},${item.tempo_final}\n`
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

      <Text style={styles.title}>Classificação</Text>

      <Text style={styles.label}>Número do Corredor:</Text>
      <TextInput
        style={styles.input}
        value={numeroCorredor}
        onChangeText={(text) => setNumeroCorredor(text)}
        placeholder="Digite o número do corredor"
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={buscarCorredorPorNumero}>
        <Text style={styles.buttonText}>Pesquisar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={buscarTodosCorredores}>
        <Text style={styles.buttonText}>Listar Todos os Corredores</Text>
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
                    <Text style={[styles.tableHeaderCell, styles.colTime]}>Tempo Final</Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.colPosition]}>{item.posicao}</Text>
                    <Text style={[styles.tableCell, styles.colNumber]}>{item.numero_corredor}</Text>
                    <Text style={[styles.tableCell, styles.colName]}>{item.nome}</Text>
                    <Text style={[styles.tableCell, styles.colTime]}>{item.tempo_final}</Text>
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