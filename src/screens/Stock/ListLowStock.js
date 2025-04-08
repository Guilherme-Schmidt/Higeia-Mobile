import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import api from '../../api/api';

export default function ListarEstoqueBaixo() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pharmacy/stock/low-list');
      if (Array.isArray(res.data)) {
        setProdutos(res.data);
      } else {
        console.warn('Resposta inesperada da API:', res.data);
        setProdutos([]);
      }

      setProdutos(res.data); // <--- GARANTA QUE RES.DATA É O ARRAY DIRETO
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Falha ao carregar o estoque baixo.');
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);
  const renderProduto = ({item}) => {
    if (!item) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>Qtd atual: {item.amount}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0f0" />
        <Text style={styles.loadingText}>Carregando estoque...</Text>
      </View>
    );
  }

  console.log('Produtos carregados:', JSON.stringify(produtos, null, 2));

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <Text style={styles.title}>Estoque Baixo</Text>
      <FlatList
        data={produtos}
        keyExtractor={(item, index) =>
          item?.id ? item.id.toString() : index.toString()
        }
        renderItem={renderProduto}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum item com estoque baixo.</Text>
        }
        contentContainerStyle={{paddingBottom: 20}}
      />
    </SafeAreaView>
  );
}

// ... (seu styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#ccc',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f0',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffcc00',
  },
  cardOut: {
    borderLeftColor: '#ff4444',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#ffcc00',
    color: '#000',
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  badgeOut: {
    backgroundColor: '#ff4444',
    color: '#fff',
  },
  details: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 2,
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
});