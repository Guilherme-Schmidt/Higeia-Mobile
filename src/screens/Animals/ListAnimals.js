import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../../api/api';

export default function ListAnimals() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(null);

  const carregarAnimais = async () => {
    try {
      const response = await api.get('/reg/animal');
      setAnimais(response.data.items || response.data || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os animais.');
      console.error('Erro:', error.response?.data || error);
    } finally {
      setCarregando(false);
    }
  };

  const toggleInternacao = async (animalId, deveInternar) => {
    setProcessando(animalId);
    
    try {
      if (deveInternar) {
        // Internar animal
        const response = await api.post('/clinic/hospitalization', {
          animal_id: animalId,
          weight: 0, // Valor inicial
          temperature: 0, // Valor inicial
          blood_pressure: '',
          observations: ''
        });
        
        // Atualiza estado local
        setAnimais(prev => prev.map(animal => 
          animal.id === animalId 
            ? { ...animal, hospitalization: response.data } 
            : animal
        ));
      } else {
        // Dar alta
        await api.put(`/clinic/hospitalization/animal/${animalId}/discharge`, {
          discharged: true
        });
        
        // Atualiza estado local
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

  useEffect(() => { carregarAnimais(); }, []);

  const renderItem = ({ item }) => {
    const estaInternado = item.hospitalization && !item.hospitalization.discharged;
    
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.name || 'Sem nome'}</Text>
          <Text style={styles.info}>Espécie: {item.species} - Raça: {item.breed}</Text>
          {estaInternado && <Text style={styles.status}>Status: Internado</Text>}
        </View>
        
        {processando === item.id ? (
          <ActivityIndicator size="small" color="#4CAF50" />
        ) : (
          <Switch
            value={estaInternado}
            onValueChange={(value) => toggleInternacao(item.id, value)}
            thumbColor={estaInternado ? '#4CAF50' : '#f4f3f4'}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Controle de Internação</Text>
      
      {carregando ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={animais}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum animal</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2
  },
  nome: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  info: { fontSize: 14, color: '#666' },
  status: { color: '#4CAF50', fontWeight: 'bold', marginTop: 4 },
  vazio: { textAlign: 'center', marginTop: 20, color: '#888' }
});