import React, { useEffect, useState } from 'react';
import {
  View,
  Alert,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import api from '../../api/api';

export default function ListarEstoqueBaixo() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const res = await api.get('/pharmacy/stock/low-list');

       Alert.alert(' Dados recebidos:', res);

      setProdutos(Array.isArray(res) ? res : []);
    } catch (err) {
        Alert.alert('Erro ao buscar estoque baixo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const renderItem = ({ item }) => (
    <View style={[styles.card, item.amount === 0 && styles.cardOut]}>
      <Text style={styles.nome}>{item.name}</Text>
      <Text style={styles.info}>Qtd atual: {item.amount}</Text>
      <Text style={styles.info}>Mínimo: {item.min}</Text>
      <Text style={styles.info}>Faltando: {item.missing}</Text>

      {/* Campos extras */}
      {item.unit && <Text style={styles.info}>Unidade: {item.unit}</Text>}
      {item.category && <Text style={styles.info}>Categoria: {item.category}</Text>}
      {item.laboratory && <Text style={styles.info}>Laboratório: {item.laboratory}</Text>}
      {item.use && <Text style={styles.info}>Uso: {item.use}</Text>}

      {item.amount === 0 && <Text style={styles.out}>Fora de estoque</Text>}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0f0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Itens com Estoque Baixo</Text>
      {produtos.length > 0 ? (
        <FlatList
          data={produtos}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
        />
      ) : (
        <Text style={styles.vazio}>Nenhum item com estoque baixo.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212',
    flex: 1,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f0',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#ffcc00',
  },
  cardOut: {
    borderLeftColor: '#ff4444',
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    color: '#ccc',
  },
  out: {
    marginTop: 6,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  vazio: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});
