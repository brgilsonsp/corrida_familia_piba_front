import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Para salvar arquivos localmente
import * as Sharing from 'expo-sharing'; // Para compartilhar arquivos
import styles from './Styles';

export default function Classificacao() {
  const navigation = useNavigation();

  const [sexo, setSexo] = useState('Todos');
  const [faixaEtaria, setFaixaEtaria] = useState('Todas');
  const [categoria, setCategoria] = useState('Todas');
  const [results, setResults] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [apiUrlBase, setApiUrlBase] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Modal de resultados
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal de edição
  const [searchInput, setSearchInput] = useState(''); // Input de busca no modal de edição
  const [selectedRunner, setSelectedRunner] = useState(null); // Corredor selecionado para edição
  const [newTime, setNewTime] = useState(''); // Novo tempo do corredor

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
        },
      });
      setResults(response.data.dados);
      await AsyncStorage.setItem('searchResults', JSON.stringify(response.data.dados)); // Armazenar resultados
      setModalVisible(true); // Abre o modal quando os dados forem carregados
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  };

  const buscarCorredor = async () => {
    const corredor = results.find(
      (item) =>
        item.nome_completo_atleta.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.numero_atleta.toString() === searchInput
    );
    setSelectedRunner(corredor || null);
  };

  const atualizarTempo = async () => {
    if (!selectedRunner || !newTime) return;
    // Atualizar localmente o tempo do corredor
    setResults((prevResults) =>
      prevResults.map((item) =>
        item.numero_atleta === selectedRunner.numero_atleta
          ? { ...item, tempo_corrida: newTime }
          : item
      )
    );
    setNewTime('');
    setSelectedRunner(null);
    setEditModalVisible(false);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const generateCSV = () => {
    const header = 'Posição,Número,Nome,Idade,Sexo,Tempo\n';
    const rows = results.map((item) =>
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text style={styles.title}>Classificação Geral</Text>

      <Text style={styles.label}>Selecione o Sexo:</Text>
      <Picker selectedValue={sexo} style={styles.input} onValueChange={(itemValue) => setSexo(itemValue)}>
        <Picker.Item label="Todos" value="Todos" />
        <Picker.Item label="Masculino" value="Masculino" />
        <Picker.Item label="Feminino" value="Feminino" />
      </Picker>

      <Text style={styles.label}>Faixa Etária:</Text>
      <Picker selectedValue={faixaEtaria} style={styles.input} onValueChange={(itemValue) => setFaixaEtaria(itemValue)}>
        <Picker.Item label="Todas" value="Todas" />
        {/* Outras opções */}
      </Picker>

      <Text style={styles.label}>Categoria:</Text>
      <Picker selectedValue={categoria} style={styles.input} onValueChange={(itemValue) => setCategoria(itemValue)}>
        <Picker.Item label="Todas" value="Todas" />
        {/* Outras opções */}
      </Picker>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={buscarDados}>
          <Text style={styles.buttonText}>Pesquisar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de edição */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible}>
        <View style={styles.modalOverlay2}>
          <View style={styles.modalContainer2}>
            <Text style={styles.label}>Buscar por Nome ou Número:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome ou número"
              value={searchInput}
              onChangeText={setSearchInput}
            />
            <TouchableOpacity style={styles.button} onPress={buscarCorredor}>
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>

            {selectedRunner && (
              <View>
                <Text style={styles.label}>Corredor Selecionado:</Text>
                <Text>{selectedRunner.nome_completo_atleta}</Text>
                <Text>Tempo Atual: {selectedRunner.tempo_corrida}</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Novo Tempo"
                  value={newTime}
                  onChangeText={setNewTime}
                />
                <TouchableOpacity style={styles.button} onPress={atualizarTempo}>
                  <Text style={styles.buttonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
