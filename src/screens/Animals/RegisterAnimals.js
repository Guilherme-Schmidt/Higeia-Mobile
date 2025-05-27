import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, TextInput, HelperText } from 'react-native-paper';
import api from '../../api/api';
import DatePicker from 'react-native-date-picker';
import { Picker } from '@react-native-picker/picker';

const RegisterAnimals = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [owners, setOwners] = useState([]);
  const [animal, setAnimal] = useState({
    name: '',
    weighing: '',
    date_of_birth: new Date(),
    breed: '',
    species: '',
    coat: '',
    animal_owner_id: '',
  });
  const [errors, setErrors] = useState({});
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Carrega lista de donos
  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await api.get('reg/client');
        // Acessa a propriedade 'items' do response.data
        setOwners(response.data.items || []); 
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar a lista de donos');
        setOwners([]);
      }
    };
    fetchOwners();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('reg/animal', {
        ...animal,
        date_of_birth: animal.date_of_birth.toISOString().split('T')[0],
      });
      Alert.alert('Sucesso', 'Animal cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o animal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <TextInput
        label="Nome"
        value={animal.name}
        onChangeText={(text) => setAnimal({ ...animal, name: text })}
        error={!!errors.name}
        style={{ marginBottom: 10 }}
      />
      {errors.name && <HelperText type="error">{errors.name[0]}</HelperText>}

      <TextInput
        label="Peso (kg)"
        value={animal.weighing}
        onChangeText={(text) => setAnimal({ ...animal, weighing: text })}
        keyboardType="numeric"
        error={!!errors.weighing}
        style={{ marginBottom: 10 }}
      />
      {errors.weighing && <HelperText type="error">{errors.weighing[0]}</HelperText>}

      <TextInput
        label="Data de Nascimento"
        value={animal.date_of_birth.toLocaleDateString('pt-BR')}
        onFocus={() => setDatePickerOpen(true)}
        style={{ marginBottom: 10 }}
      />
      <DatePicker
        modal
        open={datePickerOpen}
        date={animal.date_of_birth}
        mode="date"
        onConfirm={(date) => {
          setDatePickerOpen(false);
          setAnimal({ ...animal, date_of_birth: date });
        }}
        onCancel={() => {
          setDatePickerOpen(false);
        }}
      />

      <TextInput
        label="Raça"
        value={animal.breed}
        onChangeText={(text) => setAnimal({ ...animal, breed: text })}
        error={!!errors.breed}
        style={{ marginBottom: 10 }}
      />
      {errors.breed && <HelperText type="error">{errors.breed[0]}</HelperText>}

      <TextInput
        label="Espécie"
        value={animal.species}
        onChangeText={(text) => setAnimal({ ...animal, species: text })}
        error={!!errors.species}
        style={{ marginBottom: 10 }}
      />
      {errors.species && <HelperText type="error">{errors.species[0]}</HelperText>}

      <TextInput
        label="Pelagem"
        value={animal.coat}
        onChangeText={(text) => setAnimal({ ...animal, coat: text })}
        error={!!errors.coat}
        style={{ marginBottom: 10 }}
      />
      {errors.coat && <HelperText type="error">{errors.coat[0]}</HelperText>}

      <Picker
        selectedValue={animal.animal_owner_id}
        onValueChange={(itemValue) => setAnimal({ ...animal, animal_owner_id: itemValue })}
        style={{ marginBottom: 20 }}
      >
        <Picker.Item label="Selecione um dono" value="" />
        {owners.map((owner) => (
          <Picker.Item key={owner.id} label={owner.name} value={owner.id} />
        ))}
      </Picker>
      {errors.animal_owner_id && <HelperText type="error">{errors.animal_owner_id[0]}</HelperText>}

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        Cadastrar Animal
      </Button>
    </ScrollView>
  );
};

export default RegisterAnimals;