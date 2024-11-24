import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; 
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack'; 
import Home from './src/screens/Home'; 
import Cronometro from './src/screens/Cronometro'; 
import Checkin from './src/screens/Checkin'; 
import Classificacao from './src/screens/Classificacao';
import ClassificacaoGeral from './src/screens/ClassificacaoGeral';
import ConfiguracaoScreen from './src/screens/ConfiguracaoScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Cronometro" component={Cronometro} />
        <Stack.Screen name="Checkin" component={Checkin} />
        <Stack.Screen name="Classificacao" component={Classificacao} />
        <Stack.Screen name="ClassificacaoGeral" component={ClassificacaoGeral} />
        <Stack.Screen name="Configuração" component={ConfiguracaoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}