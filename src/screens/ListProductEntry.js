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
  RefreshControl,
} from 'react-native';
import api from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ListProductEntry({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadEntries(searchQuery).then(() => setRefreshing(false));
  };

  async function loadEntries(query = '') {
    try {
      setLoading(true);
      const response = await api.get('/pharmacy/entry', { 
        params: { 
          query,
          per_page: 100 // Added pagination parameter
        } 
      });
      
      // Handle different response formats
      const items = response.data?.items || response.data?.data || response.data || [];
      setEntries(items);
    } catch (error) {
      console.error('Erro ao carregar entradas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as entradas. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    loadEntries(searchQuery);
  }

  function handleClearSearch() {
    setSearchQuery('');
    loadEntries('');
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('EntryDetails', { entryId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.supplier?.name || 'Fornecedor não informado'}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
      </View>
      
      <Text style={styles.details}>Documento: {item.document || 'N/A'}</Text>
      
      <View style={styles.productsContainer}>
        <Text style={styles.productTitle}>Produtos:</Text>
        {item.items?.slice(0, 2).map((entryItem, idx) => (
          <Text key={idx} style={styles.productItem}>
            • {entryItem.product?.name || `Produto ${entryItem.product_id}`} 
            - {entryItem.quantity}x R$ {parseFloat(entryItem.unitPrice).toFixed(2)}
          </Text>
        ))}
        {item.items?.length > 2 && (
          <Text style={styles.moreItems}>+ {item.items.length - 2} itens...</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading && entries.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4e9bde" />
        <Text style={styles.loadingText}>Carregando entradas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e9bde" barStyle="light-content" />

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por fornecedor ou documento..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
      </View>

      {/* Entries List */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma entrada encontrada</Text>
            {searchQuery ? (
              <TouchableOpacity onPress={handleClearSearch}>
                <Text style={styles.clearSearchText}>Limpar busca</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4e9bde']}
            tintColor="#4e9bde"
          />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#4e9bde',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productsContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  productItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 4,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  clearSearchText: {
    marginTop: 8,
    color: '#4e9bde',
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingVertical: 16,
  },
  separator: {
    height: 12,
  },
});