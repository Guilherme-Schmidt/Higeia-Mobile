import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import api from '../../api/api';

export default function ListLowStock() {
  const [produtos, setProdutos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [temMais, setTemMais] = useState(true);

  useEffect(() => {
    carregarProdutos(1);
  }, [carregarProdutos]);

  const carregarProdutos = useCallback(async (paginaCarregar = 1) => {
    if (carregando || !temMais) return;

    setCarregando(true);

    try {
      const response = await api.get('/pharmacy/stock/low-list', {
        params: { page: paginaCarregar },
      });

      const novosProdutos = response.data.data || [];
      const ultimaPagina = response.data.last_page || 1;

      setProdutos((prev) => {
        const idsExistentes = new Set(prev.map((p) => p.id));
        const novosUnicos = novosProdutos.filter((p) => !idsExistentes.has(p.id));
        return [...prev, ...novosUnicos];
      });

      setPagina(paginaCarregar + 1);
      setTemMais(paginaCarregar < ultimaPagina);
    } catch (error) {
      console.error('Erro ao buscar estoque baixo:', error);
    } finally {
      setCarregando(false);
    }
  }, [carregando, temMais]);

  const renderItem = ({ item }) => (
    <View style={[styles.card, styles.lowStockCard]}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.badge}>Estoque Baixo</Text>
      </View>
      <Text style={styles.details}>Quantidade: {item.amount}</Text>
      <Text style={[styles.details, styles.missingText]}>Faltam: {item.missing}</Text>
    </View>
  );

  if (carregando && produtos.length === 0) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />

      <Text style={styles.titulo}>Estoque Baixo</Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => carregarProdutos(pagina)}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={
          !carregando && <Text style={styles.empty}>Nenhum item com estoque baixo.</Text>
        }
        ListFooterComponent={
          carregando && <ActivityIndicator size="small" color="#e74c3c" />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    margin: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  missingText: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
  },
});