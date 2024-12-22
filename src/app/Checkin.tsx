import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Alert, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import { initializeDatabase, insertCorredor, getAllCorredores } from './database/initializeDatabase';

interface Corredor {
  id_atleta: string;
  nome: string;
  documento: string;
  sexo: string;
  data_nascimento: string;
  modalidade: string;
  numero_peito: number;
  monitor: string;
}

export default function Checkin() {
  const router = useRouter();
  const [urlBase, setUrlBase] = useState<string>(''); // Estado para armazenar a URL base
  const [query, setQuery] = useState('');
  const [number, setNumber] = useState('');
  const [cpfOrRne, setCpfOrRne] = useState('');
  const [dob, setDob] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [modalidade, setModalidade] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<Corredor[]>([]);
  const [cpfSuggestions, setCpfSuggestions] = useState<Corredor[]>([]);
  const [isNameEditable, setIsNameEditable] = useState(true);
  const [isNumberEditable, setIsNumberEditable] = useState(true);
  const [isCpfOrRneEditable, setIsCpfOrRneEditable] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  useEffect(() => {
    // Inicializa o banco de dados ao iniciar o app
    initializeDatabase();
  }, []);

  const fetchCorredores = async () => {
    const corredores = await getAllCorredores();
    console.log('Dados do banco de dados:', corredores);
  };

  useEffect(() => {
    fetchCorredores();
  }, []);

  // Função para remover formatação do CPF (pontos, hífen)
  const removeCpfFormatting = (cpf: string) => {
    return cpf.replace(/[^\d]+/g, '');  // Remove tudo que não for número
  };

  // Função para formatar o CPF (caso queira exibir o CPF formatado)
  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função de busca que trata nome e CPF (documento)
  const searchForCorredores = async (text: string, field: 'nome' | 'documento') => {
    if (text.trim() === '') {
      // Limpa as sugestões se o texto estiver vazio
      if (field === 'nome') {
        setNameSuggestions([]);
      } else {
        setCpfSuggestions([]);
      }
      return;
    }

    try {
      // Cria a URL com base no campo de pesquisa
      const url = `${urlBase}.execute-api.us-east-1.amazonaws.com/prd/atletas?${field}=${text}`;
      const response = await fetch(url);
      const data: Corredor[] = await response.json();

      // Verificação: Log da resposta da API para verificar se está retornando os dados corretamente
      console.log('Dados recebidos da API:', data);

      // Filtra os dados com base no campo nome ou documento
      const filteredData = data.filter(item => {
        if (field === 'nome') {
          // Comparação para nome (insensível a maiúsculas/minúsculas)
          return item.nome.toLowerCase().startsWith(text.toLowerCase());
        } else if (field === 'documento') {
          // Remove formatação dos CPFs (tanto o digitado quanto o da API)
          const cpfFormatted = removeCpfFormatting(item.documento);
          const searchCpf = removeCpfFormatting(text);

          // Verifica se o CPF da API começa com o CPF digitado (sem formatação)
          return cpfFormatted.startsWith(searchCpf);
        }
        return false;
      });

      // Verificação: Log dos dados filtrados
      console.log('Dados filtrados:', filteredData);

      // Atualiza as sugestões com base nos dados filtrados
      if (field === 'nome') {
        setNameSuggestions(filteredData);  // Atualiza sugestões de nome
      } else {
        setCpfSuggestions(filteredData);  // Atualiza sugestões de CPF
      }
    } catch (error) {
      console.error('Erro ao buscar dados na API:', error);
      if (field === 'nome') {
        setNameSuggestions([]);  // Limpa as sugestões de nome em caso de erro
      } else {
        setCpfSuggestions([]);  // Limpa as sugestões de CPF em caso de erro
      }
    }
  };

  // Função para manipular a seleção de um item da lista de sugestões
  const handleSelectItem = (item: Corredor) => {
    setQuery(item.nome);
    setCpfOrRne(formatCpf(item.documento));  // Formata o CPF para exibição
    setNumber(item.numero_peito ? item.numero_peito.toString() : '');
    setDob(new Date(item.data_nascimento.split('/').reverse().join('-')));
    setGender(item.sexo);
    setModalidade(item.modalidade);
    setSelectedId(item.id_atleta);

    setIsNameEditable(false);
    setIsCpfOrRneEditable(false);
    setIsNumberEditable(false);
    setNameSuggestions([]);
    setCpfSuggestions([]);
  };

  const formatDate = (date: Date) => {
    // Corrigir mês para ser no formato correto
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Corrigindo o mês
    const year = date.getUTCFullYear(); // Usando o ano UTC
    return `${day}/${month}/${year}`;
};

const handleDateChange = (event: any, date?: Date) => {
  setShowDatePicker(false);
  if (date) {
      // Garantir que estamos tratando a data com o mesmo fuso horário
      const correctedDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      setDob(correctedDate);  // Usar a data corrigida
  }
};

  const handlePostNewCorredor = async () => {
    if (!query || !cpfOrRne || !number || !gender || !modalidade || !dob) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const corredor = {
      nome: query,
      documento: cpfOrRne,
      numero_peito: parseInt(number, 10),
      sexo: gender,
      data_nascimento: formatDate(dob),
      modalidade,
      monitor: 'default'
    };

    try {
      const response = await fetch('${urlBase}.execute-api.us-east-1.amazonaws.com/prd/atletas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(corredor)
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Novo atleta cadastrado com sucesso!');
        // Adiciona a lógica para inserir no SQLite
        await insertCorredor({
          numero_corredor: corredor.numero_peito,
          monitor: corredor.monitor,
          tempo_final: null,
          tempo_de_atraso: null
        });

        // Recupera e exibe os dados do banco no console
        fetchCorredores();
      } else {
        Alert.alert('Erro', data.message || 'Não foi possível cadastrar o atleta.');
      }
    } catch (error) {
      console.error('Erro ao cadastrar novo atleta:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar o atleta.');
    }
  };

  const handlePutCorredor = async () => {
    if (!query || !cpfOrRne || !number || !gender || !modalidade || !dob) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (!selectedId) {
      Alert.alert('Erro', 'Nenhum atleta selecionado.');
      return;
    }

    const corredor = {
      nome: query,
      documento: cpfOrRne,
      numero_peito: parseInt(number, 10),
      sexo: gender,
      data_nascimento: formatDate(dob),
      modalidade,
      monitor: 'default'
    };

    try {
      const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/atletas/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(corredor)
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Check-in realizado com sucesso!');
        // Adiciona a lógica para inserir no SQLite
        await insertCorredor({
          numero_corredor: corredor.numero_peito,
          monitor: corredor.monitor,
          tempo_final: null,
          tempo_de_atraso: null
        });

        // Recupera e exibe os dados do banco no console
        fetchCorredores();
      } else {
        Alert.alert('Erro', data.message || 'Não foi possível realizar o check-in.');
      }
    } catch (error) {
      console.error('Erro ao realizar check-in:', error);
      Alert.alert('Erro', 'Não foi possível realizar o check-in.');
    }
  };
  const openDatePicker = () => {
    setShowDatePicker(true);
  };
 
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.title}>Check-in</Text>

      {/* Campo Nome */}
      <View style={styles.margem}>
        <Text style={styles.label}>Nome do Corredor</Text>
        <View>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={(text) => {
              if (isNameEditable) {
                setQuery(text);
                searchForCorredores(text, 'nome');
              }
            }}
            placeholder="Digite o nome"
            editable={isNameEditable}
          />
          <TouchableOpacity onPress={() => setIsNameEditable(true)}>
            <Icon name="pencil" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        {nameSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={nameSuggestions}
              keyExtractor={(item) => item.id_atleta}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectItem(item)}>
                  <Text style={styles.suggestionItem}>{item.nome} - {item.documento}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Campo CPF ou RNE */}
      <View style={styles.margem}>
        <Text style={styles.label}>CPF ou RNE</Text>
        <View>
          <TextInput
            style={styles.input}
            value={cpfOrRne}
            onChangeText={(text) => {
              if (isCpfOrRneEditable) {
                setCpfOrRne(text);
                searchForCorredores(text, 'documento');
              }
            }}
            placeholder="Digite o CPF ou RNE"
            editable={isCpfOrRneEditable}
          />
          <TouchableOpacity onPress={() => setIsCpfOrRneEditable(true)}>
            <Icon name="pencil" size={20} color="#000" />
          </TouchableOpacity>
        </View>
        {cpfSuggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={cpfSuggestions}
              keyExtractor={(item) => item.id_atleta}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelectItem(item)}>
                  <Text style={styles.suggestionItem}>{item.nome} - {item.documento}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* Campo Número do Corredor */}
      <View style={styles.margem}>
        <Text style={styles.label}>Número do Corredor</Text>
        <View>
          <TextInput
            style={styles.input}
            value={number}
            onChangeText={(text) => {
              if (isNumberEditable) {
                setNumber(text);
                searchForCorredores(text, 'numero_peito');
              }
            }}
            placeholder="Digite o número do corredor"
            editable={isNumberEditable}
          />
          <TouchableOpacity onPress={() => setIsNumberEditable(true)}>
            <Icon name="pencil" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.margem}>
        <Text style={styles.label}>Data de Nascimento</Text>
        <TouchableOpacity onPress={openDatePicker}>
          <View style={styles.input}>
            <Text style={styles.dataplaceholder}>{dob ? formatDate(dob) : 'Selecione a Data'}</Text>
          </View>
          <Icon name="calendar" size={20} color="#000" />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Campo Gênero */}
      <View style={styles.margem}>
        <Text style={styles.label}>Sexo</Text>
        <View style={styles.pickerContainer}>  {/* Contêiner com borda */}
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}  // Estilo do Picker
          >
            <Picker.Item label="Selecione o Sexo" value="" />
            <Picker.Item label="Masculino" value="Masculino" />
            <Picker.Item label="Feminino" value="Feminino" />
          </Picker>
        </View>
      </View>

      {/* Campo Modalidade */}
      <View style={styles.margem}>
        <Text style={styles.label}>Modalidade</Text>
        <View style={styles.pickerContainer}>  {/* Contêiner com borda */}
          <Picker
            selectedValue={modalidade}
            onValueChange={(itemValue) => setModalidade(itemValue)}
            style={styles.picker}  // Estilo do Picker
          >
            <Picker.Item label="Selecione a modalidade" value="" />
            <Picker.Item label="Corrida" value="Corrida" />
            <Picker.Item label="Caminhada" value="Caminhada" />
          </Picker>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handlePutCorredor} style={styles.button}>
          <Text style={styles.buttonText}>Check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePostNewCorredor} style={styles.button}>
          <Text style={styles.buttonText}>Novo Cadastro</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 1, // Espaçamento abaixo do botão
    top: 5, // Espaçamento acima do botão
    left: 1, // Espaçamento à esquerda do botão
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#007BFF', 
  },

  margem:{
    marginBottom: 0,
  },  
  // Estilo para o contêiner do ícone
  iconContainer: {
    width: 200, // Largura fixa de 200 pixels
    height: 100, // Altura fixa de 100 pixels
    borderColor: '#ccc', // Cor da borda
    borderWidth: 1, // Largura da borda de 1 pixel
    justifyContent: 'center', // Centraliza os itens verticalmente
    alignItems: 'center', // Centraliza os itens horizontalmente
    overflow: 'hidden', // Oculta partes do conteúdo que ultrapassam os limites do contêiner
    marginBottom: 20, // Espaçamento abaixo do contêiner do ícone
  },
  dataplaceholder: {
    lineHeight: 50, // Alinha o texto verticalmente ao campo
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  }, 
  suggestionsContainer: {
    position: 'absolute',
    top: 75, // Altere este valor conforme necessário
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5, // Sombra para dar efeito de "modal"
    zIndex: 1, // Garante que este container esteja acima dos outros elementos
    maxHeight: 200, // Limita a altura da lista de sugestões
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  label: {
    fontSize: 16, // Tamanho da fonte do rótulo
    marginBottom: 5, // Espaçamento abaixo do rótulo
  },
  button: {
    width: '40%',
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 1,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4, // Para Android
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
});