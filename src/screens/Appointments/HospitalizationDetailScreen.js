import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import api from '../../api/api';

const HospitalizationDetailScreen = ({ route }) => {
  const { animalId, animalName, hospitalizationId } = route.params;
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      // CORREÇÃO: Usando o endpoint correto para hospitalização específica
      const response = await api.get(`/clinic/hospitalizations/${hospitalizationId}/records`);
      
      console.log('Dados recebidos:', response.data); // Para debug
      
      const sortedRecords = response.data.sort((a, b) => {
        const dateA = new Date(`${a.record_date}T${a.record_time}`);
        const dateB = new Date(`${b.record_date}T${b.record_time}`);
        return dateB - dateA;
      });
      
      setRecords(sortedRecords);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      Alert.alert('Erro', 'Não foi possível carregar os registros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const renderRecordItem = ({ item }) => {
    const recordDate = new Date(`${item.record_date}T${item.record_time}`);
    const formattedDate = recordDate.toLocaleDateString('pt-BR');
    const formattedTime = recordDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <TouchableOpacity
        style={styles.recordCard}
        onPress={() => navigation.navigate('RecordDetail', { 
          record: item, 
          animalName 
        })}
      >
        <View style={styles.cardHeader}>
          <Icon name="calendar-alt" size={16} color="#666" />
          <Text style={styles.recordDate}>{formattedDate} às {formattedTime}</Text>
        </View>
        
        <View style={styles.vitalSignsContainer}>
          <View style={styles.vitalSign}>
            <Icon name="temperature-high" size={16} color="#e74c3c" />
            <Text style={styles.vitalText}>{item.temperature} °C</Text>
          </View>
          
          <View style={styles.vitalSign}>
            <Icon name="heartbeat" size={16} color="#e74c3c" />
            <Text style={styles.vitalText}>{item.heart_rate || '-'} bpm</Text>
          </View>
          
          <View style={styles.vitalSign}>
            <Icon name="wind" size={16} color="#e74c3c" />
            <Text style={styles.vitalText}>{item.respiratory_rate || '-'} rpm</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Registros Clínicos - {animalName}</Text>
      
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="file-medical-alt" size={50} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum registro clínico encontrado</Text>
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddHospitalizationRecord', {
              animalId,
              animalName,
              hospitalizationId
            })}
          >
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar Registro</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={records}
            renderItem={renderRecordItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#e74c3c']}
              />
            }
          />
          
          <TouchableOpacity
            style={styles.fab}
            onPress={() => navigation.navigate('AddHospitalizationRecord', {
              animalId,
              animalName,
              hospitalizationId
            })}
          >
            <Icon name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    marginTop: 15,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  vitalSignsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  vitalSign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalText: {
    marginLeft: 5,
    color: '#555',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#e74c3c',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default HospitalizationDetailScreen;