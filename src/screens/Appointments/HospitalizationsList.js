import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../api/api';

const HospitalizationsList = ({ navigation }) => {
  const [hospitalizations, setHospitalizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHospitalizations = async () => {
    try {
      const response = await api.get('/clinic/hospitalization?discharge=false');
      setHospitalizations(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as internações');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchHospitalizations);
    return unsubscribe;
  }, [navigation]);

  const handleDischarge = async (id) => {
    Alert.alert('Liberar animal', 'Deseja liberar este animal?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Liberar', 
        onPress: async () => {
          try {
            await api.put(`/clinic/hospitalizations/${id}/discharge`);
            fetchHospitalizations();
            Alert.alert('Sucesso', 'Animal liberado com sucesso');
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível liberar o animal');
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('AnimalHospitalizationHistory', { 
        animalId: item.animal.id,
        animalName: item.animal.name 
      })}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.animalName}>{item.animal.name}</Text>
        <Text style={styles.animalSpecies}>{item.animal.species}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Icon name="calendar-alt" size={14} color="#666" />
        <Text style={styles.infoText}>
          Internado em: {new Date(item.admission_date).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => navigation.navigate('AnimalHospitalizationHistory', { 
            animalId: item.animal.id,
            animalName: item.animal.name 
          })}
        >
          <Icon name="history" size={16} color="#fff" />
          <Text style={styles.buttonText}>Histórico</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.dischargeButton}
          onPress={() => handleDischarge(item.id)}
        >
          <Icon name="sign-out-alt" size={16} color="#fff" />
          <Text style={styles.buttonText}>Liberar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={hospitalizations}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="hospital" size={50} color="#ccc" />
            <Text style={styles.emptyText}>Nenhum animal internado</Text>
          </View>
        }
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          fetchHospitalizations();
        }}
        contentContainerStyle={hospitalizations.length === 0 && styles.emptyList}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('HospitalizationForm')}
      >
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyList: {
    flex: 1,
  },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  animalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  animalSpecies: {
    fontSize: 14,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dischargeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#2196F3',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
});

export default HospitalizationsList;