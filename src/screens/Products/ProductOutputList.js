import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import api from '../../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ProductOutputList = ({ navigation }) => {
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pharmacy/output');
      setOutputs(response.data.items || []);
    } catch (error) {
      console.error('Erro ao buscar saídas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutputs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOutputs();
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Concluído</Text>
        </View>
      </View>
      
      <View style={styles.responsibleContainer}>
        <Ionicons name="person-outline" size={16} color="#555" />
        <Text style={styles.employee}>
          Veterinário: {item.withdrawn_by?.name || 'Não informado'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Produtos Retirados</Text>
      
      {item.products && item.products.length > 0 ? (
        item.products.map((product) => (
          <View key={product.id} style={styles.productItem}>
            <View style={styles.productInfo}>
              <Ionicons name="pricetag-outline" size={14} color="#3498db" />
              <Text style={styles.productName}> {product.product?.name || 'Produto não especificado'}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailText}>Quantidade: {product.amount}</Text>
              {product.animal && (
                <View style={styles.animalInfo}>
                  <Ionicons name="paw-outline" size={14} color="#e74c3c" />
                  <Text style={styles.animalName}> {product.animal?.name}</Text>
                </View>
              )}
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Nenhum produto listado</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registro de Saídas</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('RegisterProductOutput')}
          style={styles.addButton}
        >
          <Ionicons name="add-circle" size={28} color="#3498db" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : (
        <FlatList
          data={outputs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#3498db']}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#95a5a6" />
              <Text style={styles.emptyMessage}>Nenhuma saída registrada</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  statusBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  responsibleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  employee: {
    fontSize: 15,
    color: '#555',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  productItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2c3e50',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailText: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  animalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  animalName: {
    fontSize: 13,
    color: '#e74c3c',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#95a5a6',
    fontStyle: 'italic',
  },
});

export default ProductOutputList;