import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import api from '../../api/api';

export default function ListHospitalizedAnimals() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [alterando, setAlterando] = useState(null); // ID do item em atualização

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      const response = await api.get('clinic/hospitalization/hospitalized');
      console.log('Animais internados:', response.data.hospitalizations); // Verifique o formato dos dados
      setAnimais(response.data.hospitalizations || []);
    } catch (error) {
      console.error('Erro ao buscar animais internados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const darAlta = async id => {
    setAlterando(id);
    try {
      await api.put(`clinic/hospitalization/${id}/status`, {
        internado: false, // Definindo "false" para dar alta
      }); 
      Alert.alert('Sucesso', 'O animal teve alta com sucesso!');
      // Atualiza a lista de animais após dar alta
      setAnimais(prev =>
        prev.map(item =>
          item.id === id ? {...item, discharged: true} : item
        ),
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível dar alta no animal.');
      console.error('Erro ao dar alta:', error);
    } finally {
      setAlterando(null);
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.nome}>
          {item.animal?.name || 'Animal sem nome'}
        </Text>
        <Switch
          value={!item.discharged}
          onValueChange={val => {
            if (!val) darAlta(item.id);
          }}
          thumbColor={!item.discharged ? '#0f0' : '#888'}
          trackColor={{false: '#555', true: '#0f05'}}
          disabled={alterando === item.id}
        />
      </View>
      <Text style={styles.info}>Espécie: {item.animal?.species}</Text>
      <Text style={styles.info}>Raça: {item.animal?.breed}</Text>
      <Text style={styles.info}>Peso: {item.weight ?? 'N/A'} kg</Text>
      <Text style={styles.info}>Temp: {item.temperature ?? 'N/A'} ºC</Text>
      <Text style={styles.info}>Pressão: {item.blood_pressure ?? 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Animais Internados</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#0f0" />
      ) : (
        <FlatList
          data={animais}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum animal internado.</Text>
          }
          contentContainerStyle={{paddingBottom: 20}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  titulo: {
    color: '#0f0',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  card: {
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#333',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nome: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    color: '#ccc',
    fontSize: 14,
  },
  vazio: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
  },
});
