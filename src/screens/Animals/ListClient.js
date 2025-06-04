import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Card, Button, Text, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../api/api';

const ListClient = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const response = await api.get('reg/client');
      setClients(response.data.items || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a lista de clientes');
      console.error('Erro ao buscar clientes:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
            
              
              <View style={styles.infoRow}>
                <Icon name="person-outline" size={18} color="#555" style={styles.icon} />
                <Text style={styles.infoText}>{item.name || 'CPF não informado'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Icon name="phone" size={18} color="#555" style={styles.icon} />
                <Text style={styles.infoText}>{item.telephone || 'Telefone não informado'}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="people-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>Nenhum cliente cadastrado</Text>
          </View>
        }
      />

      <Button
        mode="contained"
        onPress={() => navigation.navigate('RegisterClient')}
        style={styles.addButton}
        labelStyle={styles.buttonLabel}
        icon={() => <Icon name="add" size={24} color="#FFF" />}
      >
        Cadastrar Cliente
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  icon: {
    marginRight: 10,
    width: 24,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#555',
  },
  addButton: {
    margin: 16,
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: '#e74c3c',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ListClient;