import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import api from '../../api/api';

export default function ListHospitalizedAnimals() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const carregarAnimais = async () => {
    try {
      setErro(null);
      const response = await api.get('/clinic/hospitalization');
      
      if (response.data && response.data.data) {
        setAnimais(response.data.data);
      } else {
        setAnimais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar animais:', error.response?.data || error);
      setErro(error.response?.data?.error || 'Falha ao carregar animais internados');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarAnimais();
  };

  useEffect(() => {
    carregarAnimais();
  }, []);

  if (carregando && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.erroTexto}>{erro}</Text>
        <TouchableOpacity 
          style={styles.botaoTentarNovamente}
          onPress={carregarAnimais}
        >
          <Text style={styles.botaoTexto}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (animais.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.textoVazio}>Nenhum animal internado no momento</Text>
        <TouchableOpacity 
          style={styles.botaoAtualizar}
          onPress={carregarAnimais}
        >
          <Text style={styles.botaoTexto}>Atualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Animais Internados</Text>
      
      <FlatList
        data={animais}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nomeAnimal}>{item.animal?.name || 'Animal sem nome'}</Text>
            <Text>Espécie: {item.animal?.species || 'Não informado'}</Text>
            <Text>Raça: {item.animal?.breed || 'Não informada'}</Text>
            <Text>Peso: {item.weight || 'N/A'} kg</Text>
            <Text>Temperatura: {item.temperature || 'N/A'} °C</Text>
            <Text>Pressão: {item.blood_pressure || 'N/A'}</Text>
            <Text>Entrada: {new Date(item.entry_date).toLocaleDateString()}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
        contentContainerStyle={animais.length === 0 && styles.listaVazia}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  nomeAnimal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  erroTexto: {
    color: '#D32F2F',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  textoVazio: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  botaoTentarNovamente: {
    backgroundColor: '#D32F2F',
    padding: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  botaoAtualizar: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignSelf: 'center',
  },
  botaoTexto: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  listaVazia: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});