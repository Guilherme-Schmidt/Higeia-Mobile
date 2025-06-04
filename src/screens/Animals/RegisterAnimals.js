import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../api/api';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

const RegisterAnimals = ({ navigation }) => {
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingOwners, setLoadingOwners] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoadingOwners(true);
        const response = await api.get('reg/client');
        setOwners(response.data.items || []); 
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar a lista de donos');
        console.error('Erro ao carregar donos:', error);
      } finally {
        setLoadingOwners(false);
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
      Alert.alert('Sucesso', 'Animal cadastrado com sucesso!', [
      {
        text: 'OK',
        onPress: () => navigation.navigate('ListAllAnimals'), // Alterado para navegar para ListAnimals
      },
    ]);

    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert('Erro', error.response?.data?.message || 'Ocorreu um erro ao cadastrar o animal');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAnimal({ ...animal, date_of_birth: selectedDate });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
    

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Formulário */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          {/* Nome */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <View style={styles.inputContainer}>
              <Icon name="edit-3" size={18} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={animal.name}
                onChangeText={(text) => setAnimal({ ...animal, name: text })}
                placeholder="Digite o nome do animal"
                placeholderTextColor="#999"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name[0]}</Text>}
          </View>

          {/* Peso */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Peso (kg)</Text>
            <View style={styles.inputContainer}>
              <Icon name="weight" size={18} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={animal.weighing}
                onChangeText={(text) => setAnimal({ ...animal, weighing: text })}
                keyboardType="numeric"
                placeholder="0,00"
                placeholderTextColor="#999"
              />
            </View>
            {errors.weighing && <Text style={styles.errorText}>{errors.weighing[0]}</Text>}
          </View>

          {/* Data de Nascimento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Nascimento</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar" size={18} color="#555" />
              <Text style={styles.dateText}>
                {animal.date_of_birth.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={animal.date_of_birth}
                mode="date"
                display="default"
                onChange={handleDateChange}
                locale="pt-BR"
                maximumDate={new Date()}
                themeVariant="light"
              />
            )}
          </View>

          {/* Raça */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Raça</Text>
            <View style={styles.inputContainer}>
              <Icon name="git-branch" size={18} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={animal.breed}
                onChangeText={(text) => setAnimal({ ...animal, breed: text })}
                placeholder="Digite a raça"
                placeholderTextColor="#999"
              />
            </View>
            {errors.breed && <Text style={styles.errorText}>{errors.breed[0]}</Text>}
          </View>

          {/* Espécie */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Espécie *</Text>
            <View style={styles.inputContainer}>
              <Icon name="type" size={18} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={animal.species}
                onChangeText={(text) => setAnimal({ ...animal, species: text })}
                placeholder="Ex: Cachorro, Gato"
                placeholderTextColor="#999"
              />
            </View>
            {errors.species && <Text style={styles.errorText}>{errors.species[0]}</Text>}
          </View>

          {/* Pelagem */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pelagem</Text>
            <View style={styles.inputContainer}>
              <Icon name="feather" size={18} color="#555" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={animal.coat}
                onChangeText={(text) => setAnimal({ ...animal, coat: text })}
                placeholder="Descrição da pelagem"
                placeholderTextColor="#999"
              />
            </View>
            {errors.coat && <Text style={styles.errorText}>{errors.coat[0]}</Text>}
          </View>

          {/* Dono */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dono *</Text>
            {loadingOwners ? (
              <ActivityIndicator size="small" color="#e74c3c" />
            ) : (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={animal.animal_owner_id}
                  onValueChange={(itemValue) => setAnimal({ ...animal, animal_owner_id: itemValue })}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione um dono" value="" />
                  {owners.map((owner) => (
                    <Picker.Item key={owner.id} label={owner.name} value={owner.id} />
                  ))}
                </Picker>
              </View>
            )}
            {errors.animal_owner_id && <Text style={styles.errorText}>{errors.animal_owner_id[0]}</Text>}
          </View>
        </View>

        {/* Botão de Cadastro */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>Cadastrar Animal</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  dateText: {
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: '#e74c3c',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegisterAnimals;