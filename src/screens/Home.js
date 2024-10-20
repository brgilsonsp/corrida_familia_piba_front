import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import styles from './Styles'; // Importa os estilos definidos em um arquivo separado

export default function Home({ navigation }) {
  return (
    <View style={styles.container}> {/* Container principal que envolve todos os elementos */}
      <Image
        source={require('../../assets/cronometro.png')} // Caminho da imagem do cronômetro
        style={styles.image} // Estilo aplicado à imagem
      />
      
      {/* Botão para navegar para a tela de Cronômetro */}
      <TouchableOpacity
        style={styles.button} // Estilo do botão
        onPress={() => navigation.navigate('Cronometro')} // Navega para a tela de Cronômetro ao ser pressionado
      >
        <Text style={styles.buttonText}>Cronômetro</Text> {/* Texto do botão */}
      </TouchableOpacity>

      {/* Botão para navegar para a tela de Atualizar Dados */}
      <TouchableOpacity
        style={styles.button} // Estilo do botão
        onPress={() => navigation.navigate('AtualizarDados')} // Navega para a tela de Atualizar Dados ao ser pressionado
      >
        <Text style={styles.buttonText}>Atualizar Dados</Text> {/* Texto do botão */}
      </TouchableOpacity>

      {/* Botão para navegar para a tela de Check in */}
      <TouchableOpacity
        style={styles.button} // Estilo do botão
        onPress={() => navigation.navigate('Checkin')} // Navega para a tela de Check in ao ser pressionado
      >
        <Text style={styles.buttonText}>Check in</Text> {/* Texto do botão */}
      </TouchableOpacity>

      {/* Botão para navegar para a tela de Classificação */}
      <TouchableOpacity
        style={styles.button} // Estilo do botão
        onPress={() => navigation.navigate('Classificacao')} // Navega para a tela de Classificação ao ser pressionado
      >
        <Text style={styles.buttonText}>Classificação</Text> {/* Texto do botão */}
      </TouchableOpacity>

      {/* Botão para navegar para a tela de Classificação Geral */}
      <TouchableOpacity
        style={styles.button} // Estilo do botão
        onPress={() => navigation.navigate('ClassificacaoGeral')} // Navega para a tela de Classificação Geral ao ser pressionado
      >
        <Text style={styles.buttonText}>Classificação Geral</Text> {/* Texto do botão */}
      </TouchableOpacity>
    </View>
  );
}
