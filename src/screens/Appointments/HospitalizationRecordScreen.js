import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../api/api';

const HospitalizationRecordsScreen = ({ route }) => {
  const { hospitalizationId, animalName } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      fetchRecords();
    }
  }, [isFocused]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/clinic/hospitalizations/${hospitalizationId}/records`);
      
      const sortedRecords = response.data.sort((a, b) => {
        const dateA = new Date(`${a.record_date}T${a.record_time}`);
        const dateB = new Date(`${b.record_date}T${b.record_time}`);
        return dateB - dateA;
      });
      
      setRecords(sortedRecords);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      Alert.alert('Erro', 'Falha ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const recordDate = new Date(`${item.record_date}T${item.record_time}`);
    const formattedDate = recordDate.toLocaleDateString('pt-BR');
    const formattedTime = recordDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity 
        style={styles.recordCard}
        onPress={() => navigation.navigate('RecordDetail', { record: item, animalName })}
      >
        <Text style={styles.recordDate}>{formattedDate} às {formattedTime}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Temp:</Text>
          <Text>{item.temperature} °C</Text>
          <Text style={styles.label}>FC:</Text>
          <Text>{item.heart_rate || '-'} bpm</Text>
          <Text style={styles.label}>FR:</Text>
          <Text>{item.respiratory_rate || '-'} rpm</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registros de {animalName}</Text>
      
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  recordCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2
  },
  recordDate: {
    fontWeight: 'bold',
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  label: {
    fontWeight: '600'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  },
  listContent: {
    paddingBottom: 20
  }
});

export default HospitalizationRecordsScreen;