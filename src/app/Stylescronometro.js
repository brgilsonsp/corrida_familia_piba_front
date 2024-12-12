import { StyleSheet } from 'react-native';

const stylescronometro = StyleSheet.create({

    // Contêiner principal que envolve toda a tela
    container: {
      flex: 1, // Permite que o contêiner ocupe toda a área disponível
      padding: 20, // Adiciona um espaçamento interno de 20 pixels
      backgroundColor: '#ADD8E6', // Cor de fundo azul claro
    },
  
    // Estilo para o botão de voltar
    backButton: {
      marginBottom: 30, // Espaçamento abaixo do botão
      top: 10, // Espaçamento acima do botão
      left: 10, // Espaçamento à esquerda do botão
    },
  
    title: {
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 1,
    },
  
    // Estilo para o texto do temporizador
    timer: {
      fontSize: 50, // Tamanho da fonte do temporizador
      fontWeight: 'bold', // Texto em negrito
      marginBottom: 10, // Espaçamento abaixo do temporizador
      marginTop: 10, // Espaçamento acima do temporizador
      textAlign: 'center', // Centraliza o texto horizontalmente
    },
  
    // Estilo geral para os botões
    button: {
      width: '70%', // Largura de 70% do contêiner pai
      backgroundColor: '#007BFF', // Cor de fundo azul
      padding: 15, // Espaçamento interno de 15 pixels
      borderRadius: 5, // Bordas arredondadas
      alignItems: 'center', // Centraliza o conteúdo do botão
      marginTop: 10, // Espaçamento acima do botão
      marginBottom: 10, // Espaçamento abaixo do botão
      alignSelf: 'center', // Centraliza o botão horizontalmente na tela
    },
    rowContainer: {
      flexDirection: 'row', // Alinha os filhos horizontalmente
      justifyContent: 'center', // Centraliza os botões dentro do contêiner
      alignItems: 'center', // Centraliza os botões verticalmente dentro do contêiner
      width: '100%', // Garante que o container ocupe a largura total
    },
    
    buttonContainer: {
      width: '48%', // Cada botão ocupa 48% da largura do contêiner
      marginHorizontal: 5, // Ajusta a distância entre os botões (ajuste conforme necessário)
      marginBottom: 10, // Espaçamento entre os botões e o resto da tela
    },
    
     // Estilo para o texto do botão
     buttonText: {
      color: '#FFFFFF', // Cor do texto (branco)
      fontSize: 16, // Tamanho da fonte do texto
    },
    saveButtonText: {
      color: '#FFFFFF', // Cor do texto (branco)
      fontSize: 15, // Tamanho da fonte do texto
    },
    // Estilo para os rótulos
    label: {
      fontSize: 16, // Tamanho da fonte do rótulo
      marginBottom: 5, // Espaçamento abaixo do rótulo
    },
  
    inputRow: {
      marginBottom: 5, // Espaçamento abaixo da linha de entrada
      width: '75%', // Largura de 75% do contêiner pai
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
    closeButton: {
      marginTop: 10,
      backgroundColor: '#007bff',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
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
      textAlign: 'center',
    },
    comment: {
      marginTop: 20,
      textAlign: 'center',
      color: '#555',
    },
    
  });

  // Exporta os estilos para uso em outros componentes
export default stylescronometro;
