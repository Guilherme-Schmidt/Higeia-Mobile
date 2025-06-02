import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome5';
import api from '../../api/api';

const HospitalizationForm = ({ navigation }) => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await api.get('/reg/animal');
        setAnimals(response.data.items);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os animais');
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  // ✅ Função para formatar a data no padrão MySQL (YYYY-MM-DD HH:MM:SS)
  const formatDateForMySQL = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleSubmit = async () => {
  if (!selectedAnimal) {
    Alert.alert('Atenção', 'Selecione um animal');
    return;
  }

  try {
    const data = {
      animal_id: selectedAnimal,
      admission_date: formatDateForMySQL(admissionDate),
      discharge: false,
    };

    await api.post('/clinic/hospitalization', data);
    Alert.alert('Sucesso', 'Internação cadastrada com sucesso');
    navigation.goBack();
  } catch (error) {
    // Aqui pega a mensagem correta que vem do backend
    Alert.alert('Erro', error.response?.data?.error || 'Não foi possível cadastrar a internação');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Animal *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedAnimal}
          onValueChange={(itemValue) => setSelectedAnimal(itemValue)}
        >
          <Picker.Item label="Selecione um animal" value="" />
          {animals.map(animal => (
            <Picker.Item 
              key={animal.id} 
              label={`${animal.name} (${animal.species})`} 
              value={animal.id} 
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Data de Admissão *</Text>
      <TouchableOpacity 
        style={styles.dateInput}
        onPress={() => setShowDatePicker(true)}
      >
        <Text>{admissionDate.toLocaleDateString()}</Text>
        <Icon name="calendar-alt" size={18} color="#666" />
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={admissionDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setAdmissionDate(date);
            }
          }}
        />
      )}

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Salvar Internação</Text>
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
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
    color: '#333',
    fontWeight: '500',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HospitalizationForm;
