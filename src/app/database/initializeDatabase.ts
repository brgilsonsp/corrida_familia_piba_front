import * as SQLite from 'expo-sqlite';
import { Alert } from "react-native";

// Definição do tipo para um corredor
export type Cronometro = {
  numero_corredor: number;
  monitor: string;
  tempo_final?: string | null;
  tempo_de_atraso?: string | null;
};

// Função para criar a tabela no banco SQLite
export async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync('cronometro');
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS corredor ( 
        numero_corredor INTEGER PRIMARY KEY AUTOINCREMENT,
        data_nascimento INTEGER,
        monitor TEXT,
        tempo_final TEXT,
        tempo_de_atraso TEXT
      );
    `);
    Alert.alert('Tabela criada ou já existente com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    Alert.alert('Erro ao criar tabela');
  }
}

// Função para inserir dados no banco SQLite
export async function insertCorredor(data: Cronometro) {
  const db = await SQLite.openDatabaseAsync('cronometro');
  try {
    const result = await db.runAsync(
      `INSERT INTO corredor 
      (numero_corredor, monitor, tempo_final, tempo_de_atraso)
      VALUES (?, ?, ?, ?)`,
      [
        data.numero_corredor,
        data.monitor,
        data.tempo_final ?? null,
        data.tempo_de_atraso ?? null,
      ]
    );

    Alert.alert('Dados inseridos com sucesso');
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    Alert.alert('Erro ao inserir dados');
  }
}

// Função para buscar todos os corredores no banco SQLite
export async function getAllCorredores(): Promise<Cronometro[]> {
  const db = await SQLite.openDatabaseAsync('cronometro');
  try {
    const allRows = await db.getAllAsync('SELECT * FROM corredor');
    console.log('Corredores:', allRows);
    return allRows as Cronometro[]; // Casting para o tipo esperado
  } catch (error) {
    console.error('Erro ao buscar corredores:', error);
    return [];
  }
}

// Função para buscar corredor pelo número no banco SQLite
export async function getCorredorByNumber(numero_corredor: number): Promise<Cronometro | null> {
  const db = await SQLite.openDatabaseAsync('cronometro');
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM corredor WHERE numero_corredor = ?',
      [numero_corredor]
    );
    return result.length > 0 ? result[0] as Cronometro : null; // Casting para o tipo esperado
  } catch (error) {
    console.error('Erro ao buscar corredor:', error);
    return null;
  }
}

// Função para atualizar dados no banco SQLite
export async function updateCorredor(data: Cronometro) {
  const db = await SQLite.openDatabaseAsync('cronometro');
  try {
    const result = await db.runAsync(
      `UPDATE corredor 
      SET monitor = ?, tempo_final = ?, tempo_de_atraso = ?
      WHERE numero_corredor = ?`,
      [
        data.monitor,
        data.tempo_final ?? null,
        data.tempo_de_atraso ?? null,
        data.numero_corredor
      ]
    );

    Alert.alert('Dados atualizados com sucesso');
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    Alert.alert('Erro ao atualizar dados');
  }
}
