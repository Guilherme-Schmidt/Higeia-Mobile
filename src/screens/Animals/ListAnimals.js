import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../api/api';

export default function ListAnimals({ navigation }) {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const carregarAnimais = async () => {
    try {
      const response = await api.get('/reg/animal');
      setAnimais(response.data.items || response.data || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os animais.');
      console.error('Erro:', error.response?.data || error);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  const toggleInternacao = async (animalId, deveInternar) => {
    setProcessando(animalId);

    try {
      if (deveInternar) {
        const response = await api.post('/clinic/hospitalization', {
          animal_id: animalId,
          weight: 0,
          temperature: 0,
          blood_pressure: '',
          observations: ''
        });

        setAnimais(prev => prev.map(animal =>
          animal.id === animalId
            ? { ...animal, hospitalization: response.data }
            : animal
        ));
      } else {
        await api.put(`/clinic/hospitalization/animal/${animalId}/discharge`, {
          discharged: true
        });

        setAnimais(prev => prev.map(animal =>
          animal.id === animalId
            ? { ...animal, hospitalization: null }
            : animal
        ));
      }
    } catch (error) {
      console.error('Erro:', error.response?.data || error);
      Alert.alert('Erro', error.response?.data?.message || 'Operação falhou');
    } finally {
      setProcessando(null);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    carregarAnimais();
  };

  useEffect(() => { 
    carregarAnimais(); 
  }, []);

  const renderItem = ({ item }) => {
    const estaInternado = item.hospitalization && !item.hospitalization.discharged;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.nome}>{item.name || 'Sem nome'}</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.info}>
              <Icon name="type" size={14} color="#555" /> {item.species || '-'}
            </Text>
            <Text style={styles.info}>
              <Icon name="git-branch" size={14} color="#555" /> {item.breed || '-'}
            </Text>
          </View>
          
          {estaInternado && (
            <View style={styles.statusContainer}>
              <Icon name="activity" size={14} color="#2ecc71" />
              <Text style={styles.status}>Status: Internado</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.titulo}>Animais Cadastrados</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Icon 
            name="refresh-cw" 
            size={22} 
            color={refreshing ? '#ccc' : '#e74c3c'} 
          />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      ) : (
        <FlatList
          data={animais}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="alert-circle" size={40} color="#ddd" />
              <Text style={styles.vazio}>Nenhum animal encontrado</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SafeAreaView>
  );
}

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
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  vazio: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  infoContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginRight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  status: {
    color: '#2ecc71',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
});