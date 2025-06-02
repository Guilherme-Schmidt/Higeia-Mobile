import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../api/api';
import { useIsFocused } from '@react-navigation/native';

const AnimalHistory = ({ route, navigation }) => {
  const { animalId, animalName } = route.params;
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  useEffect(() => {
    navigation.setOptions({ title: `Histórico de ${animalName}` });
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchAnimalHistory();
    }
  }, [isFocused]);

  const fetchAnimalHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clinic/hospitalization/animal/${animalId}`);
      setHistory(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o histórico');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Hospitalizacao', { // Navega para o drawer 'Hospitalizacao'
          screen: 'HospitalizationDetail',      // E dentro do stack hospitalizacao para esta tela
          params: {
            hospitalizationId: item.id,
            animalName,
          },
        })
      }
      style={styles.card}
    >
      <View style={styles.row}>
        <Icon name="calendar-check" size={16} color="#2196F3" />
        <Text style={styles.label}>Admissão:</Text>
        <Text style={styles.text}>
          {new Date(item.admission_date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.row}>
        <Icon name="calendar-times" size={16} color="#f44336" />
        <Text style={styles.label}>Alta:</Text>
        <Text style={styles.text}>
          {item.discharge ? new Date(item.updated_at).toLocaleDateString() : 'Ainda internado'}
        </Text>
      </View>

      <Text style={{ marginTop: 8, color: '#007bff' }}>Ver registros clínicos</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={history.length === 0 && styles.emptyContainer}
      data={history}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderItem}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Icon name="file-medical" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum histórico encontrado</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    marginLeft: 6,
    marginRight: 4,
  },
  text: {
    color: '#555',
  },
});

export default AnimalHistory;
