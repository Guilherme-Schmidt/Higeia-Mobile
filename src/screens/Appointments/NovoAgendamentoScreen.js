import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import api from '../../api/api';

export default function NovoAgendamentoScreen({ navigation }) {
  const [animalId, setAnimalId] = useState('');
  const [data, setData] = useState('');
  const [status, setStatus] = useState('agendado');

  const salvarAgendamento = async () => {
    try {
      await api.post('/clinic/appointment', {
        animal_id: animalId,
        data,
        status
      });
      Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Não foi possível criar o agendamento.');
    }
  };

  return (
    <View style={styles.container}>
      <Text>ID do Animal:</Text>
      <TextInput
        style={styles.input}
        value={animalId}
        onChangeText={setAnimalId}
        placeholder="Ex: 1"
        keyboardType="numeric"
      />
      <Text>Data (AAAA-MM-DD HH:MM:SS):</Text>
      <TextInput
        style={styles.input}
        value={data}
        onChangeText={setData}
        placeholder="2025-05-21 14:00:00"
      />
      <Button title="Salvar Agendamento" onPress={salvarAgendamento} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
});
