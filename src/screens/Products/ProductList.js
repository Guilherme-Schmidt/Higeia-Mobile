import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet, ActivityIndicator, Alert, StatusBar, TextInput, TouchableOpacity } from 'react-native';
import api from '../../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

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
        <ActivityIndicator size="large" color="#4e9bde" />
        <Text style={{ marginTop: 8, fontSize: 16 }}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e9bde" barStyle="light-content" />
      
      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto..."
          value={searchQuery}
          onChangeText={setSearchQuery}
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
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 20,
  },
  searchButton: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 6,
    marginLeft:5,
  },
  card: {
    padding: 14,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#ff4d4d',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
    fontWeight: 'bold',
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ff4d4d',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
