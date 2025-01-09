
import React, { useState, useEffect,useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  ScrollView, Modal, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import useServerTime from './useServerTime'; // Certifique-se de que o hook está correto
import  { deleteCorredorByNumber, updateCorredoresNoBanco, clearDatabase, getAllCorredores, Cronometro } from './initializeDatabase';
import { useUserContext } from './UserContext';

export default function ConfiguracaoScreen () {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('editarUrl');  // Estado para controlar a aba ativa
  const defaultUrl = 'https://hufd66cq2i';
  const { userName } = useUserContext(); // Acesso ao contexto de usuário
  const [urlBase, setUrlBase] = useState(defaultUrl);
  const { serverTime } = useServerTime();
  const [currentTime, setCurrentTime] = useState(0);
  const [savedTime, setSavedTime] = useState(0);
  const [inputHoraEspecifica, setInputHoraEspecifica] = useState('');
  const animationFrameId = useRef<number | null>(null);  // Ref para armazenar o ID do requestAnimationFrame
  const lastTimeRef = useRef(0);  // Ref para armazenar o tempo do último quadro
  const startTimeRef = useRef(0);  // Ref para armazenar o tempo inicial do cronômetro
  const [modalVisible, setModalVisible] = useState(false);
  const [databaseTable, setDatabaseTable] = useState<Cronometro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
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

  const handleSaveCurrentTime = () => {
    Alert.alert(
      'Confirmação',
      'Deseja salvar o horário atual?',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => console.log('Ação cancelada pelo usuário.'),
        },
        {
          text: 'Sim',
          onPress: async () => {
            try {
              const formattedTime = formatTimeToDisplay(currentTime);
              setSavedTime(currentTime);
  
              const payload = {
                hora: formattedTime,
                monitor: userName,
              };
  
              const response = await fetch(`${urlBase}.execute-api.us-east-1.amazonaws.com/prd/cronometragem/largada_geral`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });
  
              if (response.ok) {
                Alert.alert('Cronômetro salvo com sucesso!', `Hora: ${formattedTime}`);
                console.log('Cronômetro salvo com sucesso!', `Hora: ${formattedTime}`);
              } else {
                const errorData = await response.json();
                Alert.alert('Erro ao salvar o cronômetro', errorData.message || 'Erro desconhecido');
                console.log('Erro ao salvar o cronômetro', errorData.message || 'Erro desconhecido');
              }
            } catch (error) {
              console.error('Erro ao salvar o cronômetro:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao tentar salvar o cronômetro.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  
  const handleEndRace = () => {
    Alert.alert(
      'Confirmação',
      'Deseja encerrar a corrida?',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => console.log('Ação cancelada pelo usuário.'),
        },
        {
          text: 'Sim',
          onPress: async () => {
            const payload = {
              monitor: userName,
            };
  
            try {
              const response = await fetch(`https://hufd66cq2i.execute-api.us-east-1.amazonaws.com/prd/classificacao/encerrar_corrida`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
              });
  
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
                const errorData = await response.text();
                Alert.alert('Erro ao encerrar corrida', errorData || 'Erro desconhecido');
                console.error('Erro no encerramento da corrida:', errorData);
              }
            } catch (error) {
              console.error('Erro ao realizar requisição:', error);
              Alert.alert('Erro', 'Falha ao se comunicar com o servidor.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };
  
  const handleSaveInputTime = () => {
    Alert.alert(
      'Confirmação',
      'Deseja salvar o horário inserido?',
      [
        {
          text: 'Não',
          style: 'cancel',
          onPress: () => console.log('Ação cancelada pelo usuário.'),
        },
        {
          text: 'Sim',
          onPress: () => {
            if (validateTimeFormat(inputHoraEspecifica)) {
              const timeInMs = convertTimeToMilliseconds(inputHoraEspecifica);
              setSavedTime(timeInMs);
              Alert.alert('Horário salvo com sucesso!', inputHoraEspecifica);
            } else {
              Alert.alert('Formato inválido', 'Digite no formato hh:mm:ss:ms');
            }
          },
        },
      ],
      { cancelable: false }
    );
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

  // Função para obter o caminho do banco de dados
  const getDatabasePath = () => `${FileSystem.documentDirectory}SQLite/cronometro`;

  // Função para validar se um arquivo é um banco SQLite
  const validateDatabase = async (filePath) => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        console.error('Arquivo não encontrado:', filePath);
        return false;
      }
      // Adicione validações adicionais, se necessário
      return true;
    } catch (error) {
      console.error('Erro ao validar banco de dados:', error);
      return false;
    }
  };

  // Função para exportar o banco de dados
  const handleExportDatabase = async () => {
    try {
      const dbPath = getDatabasePath(); // Caminho do banco de dados
      const exportPath = FileSystem.cacheDirectory + 'cronometro.db'; // Caminho temporário para exportação

      console.log(`Exportando banco de dados de: ${dbPath} para: ${exportPath}`);

      // Validação antes da exportação
      const isValid = await validateDatabase(dbPath);
      if (!isValid) {
        Alert.alert('Erro', 'Banco de dados não encontrado ou inválido.');
        return;
      }

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

  // Função para importar um banco de dados
  const handleImportDatabase = async () => {
    try {
      // Abre o seletor de documentos para escolher o banco de dados
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Permitir todos os tipos de arquivo (ajustável para SQLite específico)
      });

      // Verifica se o usuário cancelou a importação ou não selecionou nenhum arquivo
      if (result.type === 'cancel' || !result.uri) {
        console.log('Importação cancelada ou nenhum arquivo selecionado.');
        return;
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

  // Função para abrir o modal e carregar os dados do banco
  const openModal = async () => {
    const corredores = await getAllCorredores();  // Buscar dados do banco
    setDatabaseTable(corredores);  // Armazenar no estado
    setModalVisible(true);  // Abrir o modal
  };

  // Função para fechar o modal
  const closeModal = () => {
    setModalVisible(false);
  };

  // Função para atualizar os dados do corredor no estado
  const updateCorredor = (index: number, field: keyof Cronometro, value: string) => {
    const updatedTable = [...databaseTable];
    
    // Verifique se o campo é de tipo string ou número antes de atribuir
    if (field === "numero_corredor") {
      updatedTable[index][field] = parseInt(value, 10); // Converte para número
    } else {
      updatedTable[index][field] = value; // Deixa como string
    }
    
    setDatabaseTable(updatedTable); // Atualiza o estado com os novos valores
  };
  
  // Função para salvar as alterações
  const saveChanges = async () => {
    setIsLoading(true); // Ativa o loading
    const success = await updateCorredoresNoBanco(databaseTable); // Chama a função do arquivo databaseUtils
    setIsLoading(false); // Desativa o loading após salvar

    if (success) {
      Alert.alert('Alterações salvas com sucesso!');
      closeModal(); // Fechar o modal após salvar
    } else {
      Alert.alert('Erro ao salvar alterações');
    }
  };

  const deleteCorredor = async (index: number) => {
    const corredor = databaseTable[index]; // Obtenha o corredor baseado no índice
    const numeroCorredor = parseInt(corredor.numero_corredor, 10); // Garanta que o valor seja um número
  
    if (isNaN(numeroCorredor)) {
      Alert.alert('Erro', 'Número do corredor inválido');
      return; // Se o número do corredor não for válido, interrompe a exclusão
    }
  
    // Chama a função para excluir o corredor do banco de dados
    await deleteCorredorByNumber(numeroCorredor);
  
    // Após a exclusão no banco de dados, remove o corredor da lista no estado
    const updatedTable = [...databaseTable]; // Copia os dados atuais
    updatedTable.splice(index, 1); // Remove o corredor da lista
    setDatabaseTable(updatedTable); // Atualiza o estado
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
            <Text style={styles.label}>Alterar base de dados:</Text>

            {/* Botão para limpar banco de dados */}
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

            {/* Botão para abrir o modal de edição */}
            <TouchableOpacity style={styles.button} onPress={openModal}>
              <Text style={styles.buttonText}>Editar banco de dados</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal para editar tabela */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalOverlay2}>
            <View style={styles.modalContainer2}>
              <ScrollView horizontal>
                <View>
                  {/* Lista de dados do banco para edição */}
                  <FlatList
                    data={databaseTable}
                    keyExtractor={(item, index) => index.toString()}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={() => (
                      <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colNumber]}>Número Corredor</Text>
                        <Text style={[styles.tableHeaderCell, styles.colMonitor]}>Monitor</Text>
                        <Text style={[styles.tableHeaderCell, styles.colDelay]}>Tempo de Atraso</Text>
                        <Text style={[styles.tableHeaderCell, styles.colTime]}>Tempo Final</Text>
                        <Text style={[styles.tableHeaderCell, styles.colDelete]}>Excluir</Text>
                      </View>
                    )}
                    renderItem={({ item, index }) => (
                      <View style={styles.tableRow}>
                        {/* Campo para editar o número do corredor */}
                        <Text style={[styles.tableCell, styles.colNumber]}>
                          {item.numero_corredor}
                        </Text>
                        {/* Campo para editar o monitor */}
                        <TextInput
                          style={[styles.tableCell, styles.colMonitor]}
                          value={item.monitor || ""}
                          onChangeText={(text) => updateCorredor(index, 'monitor', text)}
                        />
                        {/* Campo para editar o tempo de atraso */}
                        <TextInput
                          style={[styles.tableCell, styles.colDelay]}
                          value={item.tempo_de_atraso || ""}
                          onChangeText={(text) => updateCorredor(index, 'tempo_de_atraso', text)}
                        />
                        {/* Campo para editar o tempo final */}
                        <TextInput
                          style={[styles.tableCell, styles.colTime]}
                          value={item.tempo_final || ""}
                          onChangeText={(text) => updateCorredor(index, 'tempo_final', text)}
                        />
                        {/* Botão para excluir o corredor com ícone */}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteCorredor(index)} // Chama a função para excluir
                        >
                          <Icon name="trash" size={20} color="Black" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
              </ScrollView>

              <View>
                {/* Botão para salvar alterações */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.buttonModal} onPress={saveChanges}>
                    <Text style={styles.buttonTextModal}>Salvar</Text>
                  </TouchableOpacity>

                  {/* Botão para cancelar alterações */}
                  <TouchableOpacity style={styles.buttonModal} onPress={closeModal}>
                    <Text style={styles.buttonTextModal}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Modal de Loading */}
          <Modal
            transparent={true}
            visible={isLoading} // Exibe o modal de loading apenas quando isLoading for true
            animationType="fade"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Salvando alterações...</Text>
              </View>
            </View>
          </Modal>
        </Modal>
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
          <Text style={[styles.tabText, activeTab === 'horaEspecifica' && styles.activeTabText]}>Hora Específica</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bancoDeDados' && styles.activeTab]}
          onPress={() => setActiveTab('bancoDeDados')}
        >
          <Icon name="database" size={20} color={activeTab === 'bancoDeDados' ? '#fff' : '#34495E'} />
          <Text style={[styles.tabText, activeTab === 'bancoDeDados' && styles.activeTabText]}>Banco de Dados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}  

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF',
    justifyContent: 'space-between',
    padding: width * 0.05,
  },
  backButton: {
    top: height * 0.01, // 1% da altura da tela
    left: width * 0.01, // 2% da largura da tela
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
  buttonContainer: {
    flexDirection: 'row',  // Alinha os botões na horizontal
    justifyContent: 'space-between',  // Espaça os botões igualmente
    marginTop: 10,  // Espaço superior para separação
  },
  button: {
    width: '80%',
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
  buttonModal: {
    width: '40%',
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
  buttonTextModal: {
    color: 'white',
    fontSize: 16,
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
  deleteButton: {
    left: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  colDelete: { width: 70 },// Largura da coluna de exclusão

  // Estilo para a coluna "Posição" com largura fixa
  colNumber: { width: 80 }, // Define largura fixa de 60 para a coluna "Posição"

  // Estilo para a coluna "Número" com largura fixa
  colMonitor: { width: 90 }, // Define largura fixa de 80 para a coluna "Número"

  colDelay: {width: 100 },

  // Estilo para a coluna "Tempo" com largura fixa
  colTime: { width: 100 }, // Define largura fixa de 100 para a coluna "Tempo"

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semitransparente
  },
  loadingContainer: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#000',
  },
});
