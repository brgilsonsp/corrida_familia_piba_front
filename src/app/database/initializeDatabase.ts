import { type SQLiteDatabase } from "expo-sqlite";
import { Alert } from "react-native";

// Definição do tipo para um corredor
export type Cronometro = {
  numero_corredor: number;
  monitor: string;
  tempo_final?: number | null;
  tempo_de_atraso?: number | null;
};

// Função para criar a tabela no banco SQLite
export default async function initializeDatabase(database: SQLiteDatabase) {
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS corredor ( 
        numero_corredor INTEGER PRIMARY KEY AUTOINCREMENT,
        data_nascimento INTEGER,
        monitor TEXT,
        tempo_final INTEGER,
        tempo_de_atraso INTEGER
      );
    `);
    Alert.alert('Tabela criada ou já existente com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    Alert.alert('Erro ao criar tabela');
  }
}

// Função para inserir dados no banco SQLite
export async function insertCorredor(database: SQLiteDatabase, data: Omit<Cronometro, 'id'>) {
  try {
    await database.runAsync(
      `INSERT INTO corredor 
      ( numero_corredor, monitor, tempo_final, tempo_de_atraso)
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

