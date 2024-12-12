import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import styles from './Styles';

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

  const searchForCorredores = async (text: string, field: 'nome' | 'documento') => {
    if (text.trim() === '') {
      if (field === 'nome') {
        setNameSuggestions([]);
      } else {
        setCpfSuggestions([]);
      }
      return;
    }

    try {
      const response = await fetch(`https://lvwdj.wiremockapi.cloud/v1/atletas?${field}_like=${text}`);
      const data: Corredor[] = await response.json();

      // Filtrar para retornar apenas os dados que começam com o texto digitado
      const filteredData = data.filter(item => 
        field === 'nome' ? item.nome.toLowerCase().startsWith(text.toLowerCase()) : item.documento.startsWith(text)
      );

      if (field === 'nome') {
        setNameSuggestions(filteredData);
      } else {
        setCpfSuggestions(filteredData);
      }
    } catch (error) {
      console.error('Erro ao buscar dados na API:', error);
      if (field === 'nome') {
        setNameSuggestions([]);
      } else {
        setCpfSuggestions([]);
      }
    }
  };

  const handleSelectItem = (item: Corredor) => {
    setQuery(item.nome);
    setCpfOrRne(item.documento);
    setNumber(item.numero_peito ? item.numero_peito.toString() : '');
    setDob(new Date(item.data_nascimento.split('/').reverse().join('-'))); // Corrigido para a data correta
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setDob(date);
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
      const response = await fetch('https://lvwdj.wiremockapi.cloud/v1/atletas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(corredor)
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Novo atleta cadastrado com sucesso!');
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
      const response = await fetch(`https://lvwdj.wiremockapi.cloud/v1/atletas/${selectedId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(corredor)
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso', 'Check-in realizado com sucesso!');
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
        <View style={styles.inputContainer}>
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
        <View style={styles.inputContainer}>
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
        <View style={styles.inputContainer}>
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
        <Picker
          selectedValue={gender}
          onValueChange={(itemValue) => setGender(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Selecione o Sexo" value="" />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Feminino" value="Feminino" />
        </Picker>
      </View>

      {/* Campo Modalidade */}
      <View style={styles.margem}>
        <Text style={styles.label}>Modalidade</Text>
        <Picker
          selectedValue={modalidade}
          onValueChange={(itemValue) => setModalidade(itemValue)}
          style={styles.input}
        >
          <Picker.Item label="Selecione a modalidade" value="" />
          <Picker.Item label="Corrida" value="Corrida" />
          <Picker.Item label="Caminhada" value="Caminhada" />
        </Picker>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handlePutCorredor} style={styles.button}>
          <Text style={styles.buttonText}>Realizar Check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePostNewCorredor} style={styles.button}>
          <Text style={styles.buttonText}>Novo Cadastro</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
