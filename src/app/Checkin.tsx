import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Alert, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import useHandleAppState from './ApagaUserName';

interface Corredor {
  id_atleta: string;
  nome: string;
  documento: string;
  sexo: string;
  data_nascimento: string;
  modalidade: string;
  numero_peito: string;
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

  useHandleAppState()

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
  // Verificar se todos os campos estão preenchidos
  if (!query || !cpfOrRne || !number || !gender || !modalidade || !dob) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    return;
  }

  // Criar o objeto com os dados do corredor
  const corredor = {
    nome: query,
    documento: cpfOrRne,
    numero_peito: parseInt(number, 10),  // Garantir que o número do peito seja uma string
    sexo: gender,
    data_nascimento: formatDate(dob),  // A data será convertida para string
    modalidade,
    monitor: 'default'
  };

  try {
    // Enviar os dados para a API via POST
    const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/atletas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(corredor)
    });

    const data = await response.json();

    // Se o cadastro for bem-sucedido
    if (response.ok) {
      Alert.alert('Sucesso', 'Novo atleta cadastrado com sucesso!');

      // Limpar os campos de entrada após o cadastro
      setQuery('');  // Limpar o nome
      setCpfOrRne('');  // Limpar o CPF/RNE
      setNumber('');  // Limpar o número do peito
      setDob(new Date());  // Limpar a data de nascimento (definir como valor padrão ou vazio)
      setGender('');  // Limpar o sexo
      setModalidade('');  // Limpar a modalidade

      // Tornar os campos editáveis novamente, caso necessário
      setIsNameEditable(true);
      setIsCpfOrRneEditable(true);
      setIsNumberEditable(true);
      setSelectedId(null);  // Limpar a seleção de ID, se houver
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
    data_nascimento: formatDate(dob),  // A data será convertida para string
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
      

      // Limpar os campos de entrada após o cadastro
      setQuery('');  // Limpar o nome
      setCpfOrRne('');  // Limpar o CPF/RNE
      setNumber('');  // Limpar o número do peito
      setDob(new Date());  // Limpar a data de nascimento (definir como valor padrão ou vazio)
      setGender('');  // Limpar o sexo
      setModalidade('');  // Limpar a modalidade

      // Tornar os campos editáveis novamente, caso necessário
      setIsNameEditable(true);
      setIsCpfOrRneEditable(true);
      setIsNumberEditable(true);
      setSelectedId(null);  // Limpar a seleção de ID, se houver
    } else {
      Alert.alert('Erro', data.message || 'Não foi possível atualizar dados do atleta.');
    }
  } catch (error) {
    console.error('Erro ao atualizar dados do atleta:', error);
    Alert.alert('Erro', 'Não foi possível atualizar dados do atleta.');
  }
};

  const openDatePicker = () => {
    setShowDatePicker(true);
  };
 
  return (
    <View style={styles.container}>
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={styles.title}>Check-in</Text>
      </TouchableOpacity>
    </View>

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
            <Text style={styles.dataplaceholder}>
              {dob ? formatDate(dob) : 'Selecione a Data'}
            </Text>
          </View>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dob || new Date()} // Valor inicial
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()} // Bloqueia datas futuras
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

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: width * 0.05, // 5% da largura da tela
    backgroundColor: '#F0F8FF',
    justifyContent: 'flex-start', // Garante que o conteúdo comece do topo
  },
  backButton: {
    top: height * 0.01, // 1% da altura da tela
    left: width * 0.02, // 2% da largura da tela
  },
  title: {
    fontSize: width * 0.09, // 8% da largura da tela
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: height * 0.005, // 2% da altura da tela
    color: '#007BFF',
  },
  iconContainer: {
    width: width * 0.5, // 50% da largura da tela
    height: height * 0.2, // 20% da altura da tela
    borderColor: '#ccc',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: height * 0.02, // 2% da altura da tela
  },
  input: {
    width: '100%',
    height: height * 0.07, // 7% da altura da tela
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03, // 3% da largura da tela
    backgroundColor: '#ffffff',
    marginBottom: height * 0.01, // 1% da altura da tela
  },
  buttonContainer: {
    flexDirection: 'row', // Coloca os botões lado a lado
    justifyContent: 'space-between', // Espaçamento uniforme entre os botões
    marginTop: height * 0.02, // 2% da altura da tela
  },
  button: {
    flex: 1, // Faz os botões terem tamanhos iguais
    backgroundColor: '#007BFF',
    padding: height * 0.02, // 1.5% da altura da tela
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: width * 0.02, // 2% da largura da tela entre os botões
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.04, // 4% da largura da tela
  },
  dataplaceholder: {
    fontSize: width * 0.04, // 4% da largura da tela
    lineHeight: height * 0.07, // Centraliza o texto verticalmente, ajustando a altura da linha para igualar à altura do campo
    width: '100%', // Garante que o texto ocupe toda a largura disponível
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
  pickerContainer: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: width * 0.03, // 3% da largura da tela
    backgroundColor: '#ffffff',
    marginBottom: height * 0.01, // 1% da altura da tela
  },
  picker: {
    width: '100%',
    height: height * 0.075, // 6% da altura da tela, igual ao TextInput
    backgroundColor: '#ffffff',
  },
});
