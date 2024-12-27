import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

// Definição do tipo para um corredor
export type Cronometro = {
  numero_corredor: number;
  monitor: string;
  tempo_final?: string | null;
  tempo_de_atraso?: string | null;
};

// Função para abrir o banco de dados
async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('cronometro');
  return db;
}

// Função para criar a tabela no banco SQLite
export async function initializeDatabase() {
  const db = await openDatabase();
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS corredor ( 
        numero_corredor INTEGER PRIMARY KEY,
        monitor TEXT,
        tempo_final TEXT,
        tempo_de_atraso TEXT
      );
    `);
    Alert.alert('Tabela criada ou já existente com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
    Alert.alert('Erro ao criar tabela');
  } finally {
    db.closeAsync(); // Fechar o banco após a execução
  }
}

// Função para inserir dados no banco SQLite
export async function insertCorredor(data: Cronometro) {
  const db = await openDatabase();
  try {
    await db.withTransactionAsync(async () => {
      // Verificar se o corredor já existe
      const existingCorredor = await db.getAllAsync(
        `SELECT 1 FROM corredor WHERE numero_corredor = ?`,
        [data.numero_corredor]
      );
    
      if (existingCorredor.length > 0) {
        Alert.alert('Erro ao inserir dados', 'Número de corredor já existe');
      } else {
        // Inserir dados do corredor
        await db.runAsync(
          `INSERT INTO corredor (numero_corredor, monitor, tempo_final, tempo_de_atraso)
           VALUES (?, ?, ?, ?)`,
          [
            data.numero_corredor,
            data.monitor,
            data.tempo_final ?? null,
            data.tempo_de_atraso ?? null,
          ]
        );
        Alert.alert('Dados inseridos com sucesso');
      }
    });
  } catch (error) {
    console.error('Erro ao inserir dados:', error);
    Alert.alert('Erro ao inserir dados');
  } finally {
    db.closeAsync(); // Fechar o banco após a execução
  }
}

// Função para buscar todos os corredores no banco SQLite
export async function getAllCorredores(): Promise<Cronometro[]> {
  const db = await openDatabase();
  try {
    const allRows = await db.getAllAsync('SELECT * FROM corredor');
    console.log('Corredores:', allRows);
    return allRows as Cronometro[]; // Casting para o tipo esperado
  } catch (error) {
    console.error('Erro ao buscar corredores:', error);
    return [];
  } finally {
    db.closeAsync(); // Fechar o banco após a execução
  }
}

// Função para buscar corredor pelo número no banco SQLite
export async function getCorredorByNumber(numero_corredor: number): Promise<Cronometro | null> {
  const db = await openDatabase();
  try {
    const result = await db.getAllAsync(
      'SELECT * FROM corredor WHERE numero_corredor = ?',
      [numero_corredor]
    );
    return result.length > 0 ? result[0] as Cronometro : null; // Casting para o tipo esperado
  } catch (error) {
    console.error('Erro ao buscar corredor:', error);
    return null;
  } finally {
    db.closeAsync(); // Fechar o banco após a execução
  }
}

// Função para atualizar dados no banco SQLite
export async function updateCorredor(data: Cronometro) {
  const db = await openDatabase();
  try {
    await db.withTransactionAsync(async () => {
      // Verificar se o corredor já existe
      const existingCorredor = await db.getAllAsync(
        'SELECT tempo_final, tempo_de_atraso FROM corredor WHERE numero_corredor = ?',
        [data.numero_corredor]
      );
    
      if (existingCorredor.length > 0) {
        const corredor = existingCorredor[0];
        if (corredor.tempo_final && corredor.tempo_de_atraso) {
          Alert.alert('Erro ao atualizar dados', 'Tempos já preenchidos');
        } else {
          // Atualizar dados do corredor
          await db.runAsync(
            `UPDATE corredor 
             SET monitor = ?, 
                 tempo_final = CASE WHEN tempo_final IS NULL THEN ? ELSE tempo_final END,
                 tempo_de_atraso = CASE WHEN tempo_de_atraso IS NULL THEN ? ELSE tempo_de_atraso END
             WHERE numero_corredor = ?`,
            [
              data.monitor,
              data.tempo_final ?? null,
              data.tempo_de_atraso ?? null,
              data.numero_corredor
            ]
          );
          Alert.alert('Dados atualizados com sucesso');
        }
      } else {
        Alert.alert('Erro ao atualizar dados', 'Corredor não encontrado');
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    Alert.alert('Erro ao atualizar dados');
  } finally {
    db.closeAsync(); // Fechar o banco após a execução
  }
}

export default async function searchCorredores(
  numero_corredor?: number // Parâmetro opcional para filtrar por número de corredor
): Promise<(Cronometro & { posicao: number })[]> {
  const db = await openDatabase(); // Abertura da conexão com o banco de dados
  try {
    let query = 'SELECT * FROM corredor';
    const results = await db.getAllAsync(query); // Executa a query no banco de dados sem filtros para pegar todos os corredores

    // Função para converter tempo no formato 'HH:MM:SS.MS' para milissegundos
    const timeToMilliseconds = (time: string | null) => {
      if (!time) return Infinity; // Se não houver tempo, considera um tempo "infinito" (como não válido)
      const [hours, minutes, seconds] = time.split(':').map(Number);
      const [secs, ms] = seconds.toString().split('.').map(Number);
      return (hours * 3600 + minutes * 60 + secs) * 1000 + (ms || 0);
    };

    // Ordenar os resultados com base no tempo convertido para milissegundos
    const sortedResults = results.sort((a: Cronometro, b: Cronometro) => {
      const timeA = timeToMilliseconds(a.tempo_final ?? '');
      const timeB = timeToMilliseconds(b.tempo_final ?? '');
      return timeA - timeB; // Ordena de menor (melhor tempo) para maior (pior tempo)
    });

    // Atribuir posições com base na ordenação
    sortedResults.forEach((corredor, index) => {
      corredor.posicao = index + 1; // A posição começa de 1
    });

    // Se um número de corredor foi fornecido, encontrar o corredor específico
    if (numero_corredor !== undefined) {
      const corredorSelecionado = sortedResults.find(corredor => corredor.numero_corredor === numero_corredor);
      return corredorSelecionado ? [corredorSelecionado] : []; // Retorna o corredor com a posição correta
    }

    // Caso contrário, retornamos todos os corredores com suas posições
    return sortedResults as (Cronometro & { posicao: number })[]; // Retorna os corredores com a posição
  } catch (error) {
    console.error('Erro ao buscar corredores ordenados:', error);
    return [];
  } finally {
    db.closeAsync(); // Fechar o banco após a execução
  }
}
