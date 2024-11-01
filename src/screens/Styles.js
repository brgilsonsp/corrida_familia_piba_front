import { StyleSheet } from 'react-native';

// Criação de um objeto de estilos utilizando o StyleSheet do React Native
const styles = StyleSheet.create({
  // Contêiner principal que envolve toda a tela
  container: {
    flex: 1, // Permite que o contêiner ocupe toda a área disponível
    padding: 20, // Adiciona um espaçamento interno de 20 pixels
    backgroundColor: '#ADD8E6', // Cor de fundo azul claro
  },
  
  // Estilo para o texto do temporizador
  timer: {
    fontSize: 50, // Tamanho da fonte do temporizador
    fontWeight: 'bold', // Texto em negrito
    marginBottom: 50, // Espaçamento abaixo do temporizador
    marginTop: 20, // Espaçamento acima do temporizador
    textAlign: 'center', // Centraliza o texto horizontalmente
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
    marginBottom: 20,
  },

  // Estilo para o número em rolagem
  rollingNumber: {
    fontSize: 30, // Tamanho da fonte
    fontWeight: 'bold', // Texto em negrito
  },

  inputRow: {
    marginBottom: 10, // Espaçamento abaixo da linha de entrada
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
  // Estilo para o botão de salvar
  saveButton: {
    width: '20%', // Largura de 20% do contêiner pai
    padding: 15, // Espaçamento interno de 15 pixels
    borderRadius: 5, // Bordas arredondadas
    backgroundColor: '#007BFF', // Cor de fundo azul
    alignItems: 'center', // Centraliza o conteúdo do botão
    marginLeft: 10, // Espaçamento à esquerda do botão
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
    width: '70%', // Largura de 70% do contêiner pai
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
    flexDirection: 'row', // Alinha os filhos em uma linha
    backgroundColor: '#f0f0f0', // Cor de fundo do cabeçalho
    padding: 10, // Espaçamento interno do cabeçalho
  },

  // Estilo para as células do cabeçalho da tabela
  tableHeaderCell: {
    flex: 1, // Permite que a célula ocupe espaço igual
    fontWeight: 'bold', // Texto em negrito
    textAlign: 'center', // Centraliza o texto
  },

  // Estilo para as linhas da tabela
  tableRow: {
    flexDirection: 'row', // Alinha os filhos em uma linha
    padding: 10, // Espaçamento interno da linha
    borderBottomWidth: 1, // Largura da borda inferior
    borderBottomColor: '#ccc', // Cor da borda inferior
  },

  // Estilo para as células da tabela
  tableCell: {
    flex: 1, // Permite que a célula ocupe espaço igual
    textAlign: 'center', // Centraliza o texto
  },

  comment: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 220, // Altere este valor conforme necessário
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
});

// Exporta os estilos para uso em outros componentes
export default styles;
