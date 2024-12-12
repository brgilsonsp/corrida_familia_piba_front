import { StyleSheet } from 'react-native';

// Criação de um objeto de estilos utilizando o StyleSheet do React Native
const styles = StyleSheet.create({
  // Contêiner principal que envolve toda a tela
  container: {
    flex: 1, // Permite que o contêiner ocupe toda a área disponível
    padding: 20, // Adiciona um espaçamento interno de 20 pixels
    backgroundColor: '#ADD8E6', // Cor de fundo azul claro
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

  // Estilo para o botão de voltar
  backButton: {
    marginBottom: 50, // Espaçamento abaixo do botão
    top: 10, // Espaçamento acima do botão
    left: 10, // Espaçamento à esquerda do botão
  },

  title: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },

  // Estilo para o número em rolagem
  rollingNumber: {
    fontSize: 30, // Tamanho da fonte
    fontWeight: 'bold', // Texto em negrito
  },

  inputRow: {
    marginBottom: 5, // Espaçamento abaixo da linha de entrada
    width: '75%', // Largura de 75% do contêiner pai
    
  },

  margem:{
    marginBottom: 10,
  },  
  // Estilo para o botão de salvar
  saveButton: {
    width: '30%', // Largura de 20% do contêiner pai
    height: 50,
    padding: 15, // Espaçamento interno de 15 pixels
    borderRadius: 5, // Bordas arredondadas
    backgroundColor: '#007BFF', // Cor de fundo azul
    alignItems: 'center', // Centraliza o conteúdo do botão
    justifyContent: 'center', // Alinha o conteúdo verticalmente no centro
    marginLeft: 10, // Espaçamento à esquerda do botão
    alignSelf: 'center',
    marginBottom: 5,
  },

  // Container para alinhar o input e o botão
  rowContainer: {
    flexDirection: 'row', // Alinha os filhos em uma linha
    alignItems: 'center', // Centraliza os itens verticalmente
  },
  
  // Estilo para os campos de entrada
  input: {
    width: '100%', // Largura de 75% do contêiner pai
    height: 50, // Altura fixa de 50 pixels
    borderColor: '#ccc', // Cor da borda do campo de entrada
    backgroundColor: '#fff', // Cor de fundo branca
    borderWidth: 1, // Largura da borda de 1 pixel
    borderRadius: 5, // Bordas arredondadas
    paddingHorizontal: 10, // Espaçamento interno horizontal de 10 pixels
    marginBottom: 5, // Margem abaixo do input para espaçamento
  },
  
  dataplaceholder: {
    lineHeight: 50, // Alinha o texto verticalmente ao campo
    fontSize: 16,
    color: '#333',
  },
  
  responseMessage: {
    marginTop: 8, // Margem acima para espaçamento
    fontSize: 14, // Tamanho da fonte
    color: 'red', // Cor do texto
    textAlign: 'left', // Alinhamento do texto
  },

  // Estilo para o texto do botão
  buttonText: {
    color: '#FFFFFF', // Cor do texto (branco)
    fontSize: 16, // Tamanho da fonte do texto
  },

  // Estilo para o botão fixo
  fixedButton: {
    width: '70%', // Largura de 70% do contêiner pai
    padding: 15, // Espaçamento interno de 15 pixels
    borderRadius: 5, // Bordas arredondadas
    marginHorizontal: 5, // Margem horizontal de 5 pixels
    backgroundColor: '#007BFF', // Cor de fundo azul
    alignItems: 'center', // Centraliza o conteúdo do botão
    marginTop: 20, // Espaçamento acima do botão
  },

  // Estilo geral para os botões
  button: {
    width: '45%', // Largura de 70% do contêiner pai
    backgroundColor: '#007BFF', // Cor de fundo azul
    padding: 15, // Espaçamento interno de 15 pixels
    borderRadius: 5, // Bordas arredondadas
    alignItems: 'center', // Centraliza o conteúdo do botão
    marginTop: 10, // Espaçamento acima do botão
    marginBottom: 20, // Espaçamento abaixo do botão
    alignSelf: 'center', // Centraliza o botão horizontalmente na tela
  },

  // Estilo para imagens
  image: {
    width: 150, // Largura fixa de 150 pixels
    height: 150, // Altura fixa de 150 pixels
    marginBottom: 20, // Espaçamento abaixo da imagem
    marginTop: 80, // Espaçamento acima da imagem
    alignSelf: 'center', // Centraliza a imagem na tela
  },

  // Estilo para os rótulos
  label: {
    fontSize: 16, // Tamanho da fonte do rótulo
    marginBottom: 5, // Espaçamento abaixo do rótulo
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

  comment: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
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
  // Adicione ao arquivo Styles.js
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Adicione ao arquivo Styles.js
  userName: {
    position: 'absolute',
    top: 20, // Ajuste conforme necessário para seu layout
    left: 20, // Distância da borda esquerda
    fontSize: 25,
    fontWeight: 'bold',
  },

  configButton: {
    position: 'absolute',
    top: 20,            // Posição 20px do topo da tela
    right: 20,          // Posição 20px da borda direita
    padding: 10,        // Espaçamento interno do botão
    borderRadius: 30,   // Tornando o botão arredondado
    zIndex: 1,          // Garantir que o botão apareça acima dos outros componentes
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
  closeButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalOverlay3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semi-transparente
  },
  modalContainer3: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  }, 
    buttonText: {
    color: 'white',
    fontSize: 16,
  },
  // Modal Styles
  modalContainer4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  
  modalContent4: {
    width: '100%', // Definindo uma largura fixa para o modal
    backgroundColor: '#fff',
    padding: 20, // Ajuste de padding para afastar os itens das bordas
    borderRadius: 10,
    
    marginHorizontal: 20, // Garantindo que haja algum espaço nas bordas laterais
  },
  
  modalTitle4: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20, // Aumentando o espaçamento inferior
  },
  // Estilo para o texto do temporizador
  timer: {
    fontSize: 50, // Tamanho da fonte do temporizador
    fontWeight: 'bold', // Texto em negrito
    marginBottom: 10, // Espaçamento abaixo do temporizador
    marginTop: 10, // Espaçamento acima do temporizador
    textAlign: 'center', // Centraliza o texto horizontalmente
  },

});

// Exporta os estilos para uso em outros componentes
export default styles;
