import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, StyleSheet, ActivityIndicator, Alert, StatusBar, TextInput, TouchableOpacity } from 'react-native';
import api from '../../api/api';

export default function ListarProdutos() {
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
      console.log('Resposta da API:', response.data);

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
        <Text style={{marginTop:8,fontSize:16}}>Carregando produtos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e9bde" barStyle="light-content" />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar produto pelo nome"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Buscar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              item.amount < 200 && styles.lowStockCard,  // Aplica um estilo diferente se a quantidade for menor que 200
            ]}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>Quantidade: {item.amount}</Text>
            <Text style={styles.details}>Código de barras: {item.bar_code}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // (mantém o seu style anterior e adiciona essas novas partes)
  searchContainer: {
    flexDirection: 'row',
    margin: 16,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#008000',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#008000',
    paddingVertical: 16,            // diminui de 24 para 16
    paddingHorizontal: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,                   // diminui de 24 para 20
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,                   // diminui de 20 para 8
    marginBottom: 4,
  },
  card: {
    padding: 12,                    // diminui de 18 para 12
    marginBottom: 10,               // diminui de 16 para 10
    marginHorizontal: 10,           // diminui de 12 para 10
    borderRadius: 10,               // diminui de 14 para 10
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  lowStockCard: {
    backgroundColor: '#ffdddd', // Cor para destacar quando o estoque estiver baixo
  },
  name: {
    fontSize: 16,                   // diminui de 20 para 16
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  details: {
    fontSize: 13,                   // diminui de 15 para 13
    color: '#555',
    marginBottom: 1,
  },
  empty: {
    marginTop: 30,                  // um pouco menor
    textAlign: 'center',
    color: '#777',
    fontSize: 14,                   // menor
  },
});
