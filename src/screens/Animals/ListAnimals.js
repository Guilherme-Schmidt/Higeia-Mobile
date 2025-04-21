import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Switch,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import api from '../../api/api';

export default function ListAnimals() {
  const [animais, setAnimais] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Função para carregar os animais
  const carregarAnimais = async () => {
    try {
      const response = await api.get('/reg/animal');
      console.log(response.data); // Verifique a estrutura da resposta
      if (response.data.items) {
        setAnimais(response.data.items); // Acesse os animais dentro da chave 'items'
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os animais.');
      console.error('Erro ao buscar animais:', error);
    } finally {
      setCarregando(false); // Finaliza o carregamento
    }
  };

  // Função para alterar o status de internação
  const alterarStatusInternacao = async (animalId, internado) => {
    try {
      console.log('Enviando dados para a API:', { internado });

      const response = await api.put(
        `/clinic/hospitalization/${animalId}/status`,
        {
          internado: internado, // Envia o valor 'internado' como booleano (true ou false)
        },
      );

      console.log('Resposta da API:', response.data);

      if (response.status === 200) {
        // Atualiza o estado local se a alteração foi bem-sucedida
        setAnimais(prevAnimais =>
          prevAnimais.map(animal =>
            animal.id === animalId
              ? {
                  ...animal,
                  hospitalization: {
                    ...animal.hospitalization,
                    discharged: internado ? 0 : 1, // 0 = internado, 1 = não internado
                  },
                }
              : animal,
          ),
        );
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao alterar o status.');
      }
    } catch (error) {
      console.error(
        'Erro ao atualizar internação:',
        error.response?.data || error.message,
      );
      Alert.alert('Erro', 'Não foi possível alterar o status de internação.');
    }
  };

  useEffect(() => {
    carregarAnimais();
  }, []);

  // Função para renderizar cada item da lista de animais
  const renderItem = ({ item }) => {
    const internado =
      item.hospitalization && item.hospitalization.discharged === 0;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.nome}>{item.name}</Text>
          <Text style={styles.info}>
            Espécie: {item.species} - Raça: {item.breed}
          </Text>
        </View>
        <Switch
          value={internado}
          onValueChange={() => alterarStatusInternacao(item.id, !internado)} // Passa o valor oposto para atualizar
          thumbColor={internado ? '#0f0' : '#888'}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Todos os Animais</Text>

      {carregando ? (
        <ActivityIndicator size="large" color="#0f0" />
      ) : (
        <FlatList
          data={animais}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum animal encontrado.</Text>
          }
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: '#333',
    borderWidth: 1,
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
