import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../api/api';

const HospitalizationForm = ({ navigation }) => {
  const [animals, setAnimals] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await api.get('/reg/animal');
        setAnimals(response.data.items || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar os animais');
        console.error('Erro ao carregar animais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();
  }, []);

  const formatDateForMySQL = (date) => {
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const handleSubmit = async () => {
    if (!selectedAnimal) {
      Alert.alert('Atenção', 'Selecione um animal');
      return;
    }

    setSubmitting(true);
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
      Alert.alert(
        'Erro', 
        error.response?.data?.error || 
        error.response?.data?.message || 
        'Não foi possível cadastrar a internação'
      );
      console.error('Erro ao cadastrar internação:', error.response?.data || error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Card do Formulário */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados da Internação</Text>

          {/* Seletor de Animal */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Animal *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedAnimal}
                onValueChange={setSelectedAnimal}
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
          </View>

          {/* Data de Admissão */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Admissão *</Text>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="calendar" size={18} color="#555" />
              <Text style={styles.dateText}>
                {admissionDate.toLocaleDateString('pt-BR')}
              </Text>
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
                locale="pt-BR"
                themeVariant="light"
              />
            )}
          </View>
        </View>

        {/* Botão de Salvar */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="save" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.submitButtonText}>Salvar Internação</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
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
    flex: 1,
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

export default HospitalizationForm;