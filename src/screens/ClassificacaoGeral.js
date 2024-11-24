import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system'; // Para salvar arquivos localmente
import * as Sharing from 'expo-sharing'; // Para compartilhar arquivos
import styles from './Styles';

export default function ClassificacaoGeral() {
  const navigation = useNavigation();

  const [sexo, setSexo] = useState('Todos');
  const [faixaEtaria, setFaixaEtaria] = useState('Todas');
  const [categoria, setCategoria] = useState('Todas');
  const [results, setResults] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [apiUrlBase, setApiUrlBase] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Modal de resultados
  
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

      <Text style={styles.label}>Categoria:</Text>
      <Picker selectedValue={categoria} style={styles.input} onValueChange={(itemValue) => setCategoria(itemValue)}>
        <Picker.Item label="Todas" value="Todas" />
        <Picker.Item label="Caminhada" value="Caminhada" />
        <Picker.Item label="Corrida" value="Corrida" />
      </Picker>

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
