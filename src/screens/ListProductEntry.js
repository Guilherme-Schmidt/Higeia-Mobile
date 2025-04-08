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
import api from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ListProductEntry({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });
    return unsubscribe;
  }, [navigation]);

  async function loadEntries(query = '') {
    setLoading(true);
    try {
      const response = await api.get('/pharmacy/entry', { params: { query } });
      setEntries(response.data.items || response.data.data || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar entradas:', error.message);
      Alert.alert('Erro', 'Não foi possível carregar as entradas.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadEntries(searchQuery);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#4e9bde" />
        <Text style={styles.loadingText}>Carregando entradas...</Text>
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
          placeholder="Buscar por fornecedor ou documento..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lista de entradas */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>Fornecedor: {item.supplier?.name || 'N/A'}</Text>
            <Text style={styles.details}>Documento: {item.document}</Text>
            <Text style={styles.details}>Data: {new Date(item.date).toLocaleDateString('pt-BR')}</Text>
            <Text style={[styles.details, styles.productTitle]}>Produtos:</Text>
            {item.items?.map((entryItem, idx) => (
              <Text key={idx} style={styles.details}>
                - {entryItem.product?.name || entryItem.product_id} | Qtd: {entryItem.quantity} | R$ {entryItem.unitPrice}
              </Text>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhuma entrada de produto encontrada.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 0,
  },
  searchButton: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 6,
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
  productTitle: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  empty: {
    marginTop: 30,
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});