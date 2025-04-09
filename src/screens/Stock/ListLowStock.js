import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import api from '../../api/api';

export default function ListLowStock() {
  const [produtos, setProdutos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [temMais, setTemMais] = useState(true);

  useEffect(() => {
    carregarProdutos(1); // começa pela página 1
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
    <View style={styles.card}>
      <Text style={styles.nome}>{item.name}</Text>
      <Text style={styles.qtd}>Qtd: {item.amount}</Text>
      <Text style={styles.falta}>Faltam: {item.missing}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Estoque Baixo</Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onEndReached={() => carregarProdutos(pagina)}
        onEndReachedThreshold={0.2}
        ListEmptyComponent={
          !carregando && (
            <Text style={styles.vazio}>Nenhum item com estoque baixo.</Text>
          )
        }
        ListFooterComponent={
          carregando && <ActivityIndicator size="small" color="#0f0" />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  titulo: {
    color: '#0f0',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#333',
    borderWidth: 1,
  },
  nome: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtd: {
    color: '#ccc',
    fontSize: 14,
  },
  falta: {
    color: '#f55',
    fontSize: 14,
  },
  vazio: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
