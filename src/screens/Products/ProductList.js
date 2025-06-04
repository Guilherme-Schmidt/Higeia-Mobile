import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../api/api';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts(query = '') {
    setLoading(true);
    try {
      const response = await api.get('/pharmacy/product', { params: { query } });
      if (response.data.items) {
        setProducts(response.data.items);
      } else if (response.data.data) {
        setProducts(response.data.data);
      } else {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadProducts(searchQuery);
  }

  if (loading) {
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

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de produtos */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.card, item.amount < 200 && styles.lowStockCard]}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              {item.amount < 200 && <Text style={styles.badge}>Estoque Baixo</Text>}
            </View>
            <Text style={styles.details}>Quantidade: {item.amount}</Text>
            <Text style={styles.details}>Código de barras: {item.bar_code}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
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
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
  empty: {
    marginTop: 30,
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
  },
});
