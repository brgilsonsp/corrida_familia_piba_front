import React, { useState, useEffect,useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import useServerTime from './useServerTime'; // Certifique-se de que o hook está correto
import  { clearDatabase } from './initializeDatabase';
import useHandleAppState from './ApagaUserName';

export default function ConfiguracaoScreen () {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('editarUrl');  // Estado para controlar a aba ativa
  const defaultUrl = 'https://hufd66cq2i';
  const [userName, setUserName] = useState('');
  const [urlBase, setUrlBase] = useState(defaultUrl);
  const { serverTime } = useServerTime();
  const [currentTime, setCurrentTime] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [inputHoraEspecifica, setInputHoraEspecifica] = useState('');
  const animationFrameId = useRef<number | null>(null);  // Ref para armazenar o ID do requestAnimationFrame
  const lastTimeRef = useRef(0);  // Ref para armazenar o tempo do último quadro
  const startTimeRef = useRef(0);  // Ref para armazenar o tempo inicial do cronômetro
  
  useHandleAppState()

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const storedUserName = await AsyncStorage.getItem('userName');
        if (storedUserName) {
          setUserName(storedUserName);
        }
      } catch (error) {
        console.error('Erro ao carregar userName do AsyncStorage', error);
      }
    };

    fetchUserName();
  }, []);

  // Carregar URL base salvo do AsyncStorage
  useEffect(() => {
    const loadUrlBase = async () => {
      const savedUrlBase = await AsyncStorage.getItem('apiUrlBase');
      if (savedUrlBase) {
        setUrlBase(savedUrlBase);  // Atualiza o estado com a URL salva
      } else {
        await AsyncStorage.setItem('apiUrlBase', defaultUrl);  // Salva o valor default
        setUrlBase(defaultUrl);  // Atualiza o estado para o valor default
      }
    };
  
    loadUrlBase();
  }, []);
  
  const handleSaveUrlBase = async () => {
    try {
      await AsyncStorage.setItem('apiUrlBase', urlBase);
      Alert.alert('URL base salva com sucesso!', urlBase);
    } catch (error) {
      console.error('Erro ao salvar a URL base:', error);
    }
  };

  const handleSaveCurrentTime = async () => {
    try {
      const formattedTime = formatTimeToDisplay(currentTime);
      setSavedTime(currentTime);
  
      // Criando o corpo do JSON
      const payload = {
        hora: formattedTime,
        monitor: userName,
      };
  
      // Realizando a requisição POST
      const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/cronometragem/largada_geral`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      // Verificando o status da resposta
      if (response.ok) {
        Alert.alert('Cronômetro salvo com sucesso!', `Hora: ${formattedTime}`);
        console.log('Cronômetro salvo com sucesso!', `Hora: ${formattedTime}`)
      } else {
        const errorData = await response.json();
        Alert.alert('Erro ao salvar o cronômetro', errorData.message || 'Erro desconhecido');
        console.log('Erro ao salvar o cronômetro', errorData.message || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar o cronômetro:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar salvar o cronômetro.');
    }
  }; 

  const handleEndRace = async () => {
    const payload = {
      monitor: userName, // Envia o nome do monitor para a API
    };
  
    try {
      const response = await fetch(`https://hufd66cq2i.execute-api.us-east-1.amazonaws.com/prd/classificacao/encerrar_corrida`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      // Verifique se a resposta foi bem-sucedida
      if (response.ok) {
        try {
          const responseData = await response.json();
          Alert.alert('Corrida encerrada com sucesso');
          console.log('Corrida encerrada:', responseData);
        } catch (jsonError) {
          console.error('Erro ao processar o JSON da resposta:', jsonError);
          Alert.alert('Erro ao encerrar corrida', 'Falha ao processar a resposta da API.');
        }
      } else {
        // Verifique se há um corpo na resposta para capturar os detalhes do erro
        const errorData = await response.text();
        Alert.alert('Erro ao encerrar corrida', errorData || 'Erro desconhecido');
        console.error('Erro no encerramento da corrida:', errorData);
      }
    } catch (error) {
      console.error('Erro ao realizar requisição:', error);
      Alert.alert('Erro', 'Falha ao se comunicar com o servidor.');
    }
  };  

  const handleSaveInputTime = () => {
    if (validateTimeFormat(inputHoraEspecifica)) {
      const timeInMs = convertTimeToMilliseconds(inputHoraEspecifica);
      setSavedTime(timeInMs);
      Alert.alert('Horário salvo com sucesso!', inputHoraEspecifica);
    } else {
      Alert.alert('Formato inválido', 'Digite no formato hh:mm:ss:ms');
    }
  };

  // Converte tempo para milissegundos
  const convertTimeToMilliseconds = (timeStr) => {
    const [hours, minutes, seconds, milliseconds] = timeStr.split(':').map(Number);
    return ((hours * 3600 + minutes * 60 + seconds) * 1000) + milliseconds;
  };

  // Formatar o tempo em "hh:mm:ss:ms"
    const formatTimeToDisplay = useCallback((time: number) => {
      const totalSeconds = Math.floor(time / 1000);
      const milliseconds = Math.floor((time % 1000) / 10);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      const msString = String(milliseconds).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}.${msString}`;
    }, []);
  
    // Configuração de cronômetro baseado no serverTime
    useEffect(() => {
      if (serverTime) {
        const [hours, minutes, seconds] = serverTime.split(':').map(Number);
        const serverStartTime = (hours * 3600 + minutes * 60 + seconds) * 1000;
        setCurrentTime(serverStartTime); // Define o tempo inicial
        startTimeRef.current = serverStartTime;  // Armazenar o tempo inicial
      }
    }, [serverTime]);
  
    const updateTime = useCallback(() => {
      const now = performance.now();  // Obtém o tempo atual em milissegundos (preciso)
      const delta = now - lastTimeRef.current;  // Calcula o tempo passado desde a última atualização
  
      // Atualiza o tempo com base na diferença real
      setCurrentTime((prevTime) => prevTime + delta);
  
      // Armazena o tempo atual para a próxima atualização
      lastTimeRef.current = now;
  
      // Solicita o próximo quadro com requestAnimationFrame
      animationFrameId.current = requestAnimationFrame(updateTime);
    }, []);
  
    useEffect(() => {
      if (serverTime) {
        const start = performance.now();
        lastTimeRef.current = start; // Inicializa o último tempo registrado
        animationFrameId.current = requestAnimationFrame(updateTime);
      }
  
      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [updateTime, serverTime]);
  
    useEffect(() => {
      // Inicia a animação com requestAnimationFrame
      animationFrameId.current = requestAnimationFrame(updateTime);
  
      // Limpeza ao desmontar o componente
      return () => {
        if (animationFrameId.current !== null) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }, [updateTime]);

  // Valida se a hora inserida está no formato correto
  const validateTimeFormat = (timeStr) => {
    const regex = /^\d{2}:\d{2}:\d{2}:\d{2}$/; // Regex para validar o formato hh:mm:ss:ms
    return regex.test(timeStr);
  };

  const handleClearDatabase = async () => {
    // Exibir alerta de confirmação
    Alert.alert(
      'Confirmação',
      'Tem certeza que deseja limpar o banco de dados?',
      [
        {
          text: 'Não',
          onPress: () => console.log('Banco de dados não foi limpo'),
          style: 'cancel', // Estilo para o botão "Não" (como botão de cancelamento)
        },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              await clearDatabase();  // Limpar o banco de dados
              Alert.alert('Sucesso', 'Banco de dados limpo com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar a base de dados.');
            }
          },
        },
      ],
      { cancelable: true }  // Permitir que o alerta seja fechado ao clicar fora
    );
  };

  const validateDatabase = async (dbPath: string): Promise<boolean> => {
    try {
      // Verifica se o caminho do banco de dados é válido
      if (!dbPath || dbPath.trim() === '') {
        Alert.alert('Erro', 'Caminho do banco de dados inválido.');
        return false;
      }
  
      // Verificando a existência do banco de dados
      const dbExists = await FileSystem.getInfoAsync(dbPath);
      console.log(`Verificando banco de dados em: ${dbPath}`);
  
      if (!dbExists.exists) {
        Alert.alert('Erro', 'Banco de dados não encontrado.');
        console.log('Banco de dados não encontrado no caminho:', dbPath);
        return false;
      }
  
      const dbSize = dbExists.size || 0;
      if (dbSize === 0) {
        Alert.alert('Erro', 'Banco de dados está vazio ou corrompido.');
        console.log('Banco de dados vazio ou corrompido em:', dbPath);
        return false;
      }
  
      return true; // O banco de dados parece válido
    } catch (error) {
      Alert.alert('Erro', `NOBRIDGE ERROR: Erro ao validar o banco de dados.\n${error.message}`);
      console.error('Erro ao validar o banco de dados:', error);
      return false;
    }
  };
  
  const getDatabasePath = () => {
    return FileSystem.documentDirectory + 'cronometro.db'; // Caminho do banco de dados
  };
  
  const handleExportDatabase = async () => {
    try {
      const dbPath = getDatabasePath(); // Caminho do banco de dados
      const exportPath = FileSystem.cacheDirectory + 'cronometro_exportado.db'; // Caminho temporário para exportação
  
      console.log(`Exportando banco de dados de: ${dbPath} para: ${exportPath}`);
  
      // Validação antes da exportação
      const isValid = await validateDatabase(dbPath);
      if (!isValid) return;
  
      // Copia o banco de dados para o local de exportação
      await FileSystem.copyAsync({
        from: dbPath,
        to: exportPath,
      });
  
      // Compartilha o arquivo exportado
      await Sharing.shareAsync(exportPath);
      Alert.alert('Sucesso', 'Banco de dados exportado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao exportar o banco de dados.');
      console.error('Erro ao exportar o banco de dados:', error);
    }
  };
  
  const handleImportDatabase = async () => {
    try {
      // Abre o seletor de documentos para escolher o banco de dados
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/octet-stream', // Tipo de arquivo SQLite
      });
  
      // Verifica se o usuário cancelou a importação ou não selecionou nenhum arquivo
      if (result.type === 'cancel' || !result.uri) {
        console.log('Importação cancelada ou nenhum arquivo selecionado.');
        return; // Não exibe mensagem se nada for importado
      }
  
      console.log('Arquivo selecionado para importação:', result.uri);
  
      // Validação do arquivo selecionado antes da importação
      const isValidImport = await validateDatabase(result.uri);
      if (!isValidImport) {
        Alert.alert('Erro', 'Arquivo selecionado não é um banco de dados válido.');
        return;
      }
  
      const dbPath = getDatabasePath(); // Caminho do banco de dados
  
      // Copia o arquivo selecionado para o local do banco de dados
      await FileSystem.copyAsync({
        from: result.uri,
        to: dbPath,
      });
  
      Alert.alert('Sucesso', 'Banco de dados importado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao importar o banco de dados.');
      console.error('Erro ao importar o banco de dados:', error);
    }
  };  
  
  return (
    <View style={styles.container}>
      {/* Botão para voltar */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      {/* Conteúdo da página */}
      <View style={styles.content}>
        {activeTab === 'editarUrl' && (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Editar URL base:</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite a URL base (ex: https://192.168.0.5:9111)"
              value={urlBase}
              onChangeText={setUrlBase}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveUrlBase}>
              <Text style={styles.buttonText}>Salvar URL</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'cronometro' && (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Cronômetro atual:</Text>
            <Text style={styles.timer}>
              {serverTime ? formatTimeToDisplay(currentTime) : '00:00:00.00'}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleSaveCurrentTime}>
              <Text style={styles.buttonText}>Salvar Cronômetro</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Horário salvo: {formatTimeToDisplay(savedTime)}</Text>
            <TouchableOpacity style={styles.button} onPress={handleEndRace}>
              <Text style={styles.buttonText}>Encerrar corrida</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'horaEspecifica' && (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Digite um horário específico:</Text>
            <TextInput
              style={styles.input}
              placeholder="Formato: hh:mm:ss:ms"
              value={inputHoraEspecifica}
              onChangeText={setInputHoraEspecifica}
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveInputTime}>
              <Text style={styles.buttonText}>Salvar Horário</Text>
            </TouchableOpacity>
            <Text style={styles.label}>Horário salvo: {formatTimeToDisplay(savedTime)}</Text>
          </View>
        )}
        {activeTab === 'bancoDeDados' && (
          <View style={styles.tabContent}>
            <Text style={styles.label}>Alterar base de dados: </Text>
            <TouchableOpacity style={styles.button} onPress={handleClearDatabase}>
              <Text style={styles.buttonText}>Limpar banco de dados</Text>
            </TouchableOpacity>

            {/* Botão para importar banco de dados */}
            <TouchableOpacity style={styles.button} onPress={handleImportDatabase}>
              <Text style={styles.buttonText}>Importar banco de dados</Text>
            </TouchableOpacity>

            {/* Botão para exportar banco de dados */}
            <TouchableOpacity style={styles.button} onPress={handleExportDatabase}>
              <Text style={styles.buttonText}>Exportar banco de dados</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Menu de abas na parte inferior */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'editarUrl' && styles.activeTab]}
          onPress={() => setActiveTab('editarUrl')}
        >
          <Icon name="edit" size={20} color={activeTab === 'editarUrl' ? '#fff' : '#34495E'} />
          <Text style={[styles.tabText, activeTab === 'editarUrl' && styles.activeTabText]}>Editar URL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cronometro' && styles.activeTab]}
          onPress={() => setActiveTab('cronometro')}
        >
          <Icon2 name="timer" size={20} color={activeTab === 'cronometro' ? '#fff' : '#34495E'} />
          <Text style={[styles.tabText, activeTab === 'cronometro' && styles.activeTabText]}>Cronômetro</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'horaEspecifica' && styles.activeTab]}
          onPress={() => setActiveTab('horaEspecifica')}
        >
          <Icon name="clock-o" size={20} color={activeTab === 'horaEspecifica' ? '#fff' : '#34495E'} />
          <Text style={[styles.tabText, activeTab === 'horaEspecifica' && styles.activeTabText]}>Hora</Text>
          <Text style={[styles.tabText, activeTab === 'horaEspecifica' && styles.activeTabText]}>Específica</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bancoDeDados' && styles.activeTab]}
          onPress={() => setActiveTab('bancoDeDados')}>
          <Icon name="database" size={20} color={activeTab === 'bancoDeDados' ? '#fff' : '#34495E'} />
          <Text style={[styles.tabText, activeTab === 'bancoDeDados' && styles.activeTabText]}>Banco de dados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 1, // Bordas arredondadas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 0.2, // Borda ao redor da aba
    borderColor: '#DDE6ED',
  },
  activeTab: {
    backgroundColor: '#007BFF', // Cor de fundo quando a aba está ativa
    elevation: 5, // Sombra para dar um efeito de profundidade
  },
  activeTabText: {
    color: '#fff', // Texto branco quando a aba está ativa
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34495E',
    textAlign: 'center', // Centraliza o texto
  },
  tabContent: {
    marginTop: 60,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE6ED',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#34495E',
  },
  timer: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 20,
    textAlign: 'center',
  },
});
