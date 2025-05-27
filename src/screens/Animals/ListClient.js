import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert } from 'react-native';
import { Card, Button, Text } from 'react-native-paper';
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
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10 }}>
            <Card.Content>
              <Text style={{ fontWeight: 'bold' }}>{item.name}</Text>
              <Text>CPF: {item.cpf}</Text>
              <Text>Telefone: {item.telephone}</Text>
              <Text>Animais: {item.animals.length}</Text>
            </Card.Content>
          </Card>
        )}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('RegisterClient')}
        style={{ marginTop: 10 }}
      >
        Novo Cliente
      </Button>
    </View>
  );
};

export default ListClient;