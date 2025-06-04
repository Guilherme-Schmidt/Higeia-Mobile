import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../api/api';

const initialForm = {
  temperature: '',
  record_date: '',
  record_time: '',
  heart_rate: '',
  respiratory_rate: '',
  mucous_membranes: '',
  dehydration_level: 'normal',
  appetite: 'normal',
  urine: 'normal',
  vomit: false,
  diarrhea: false,
  posture: '',
  notes: '',
};

const AddHospitalizationRecordScreen = ({ route, navigation }) => {
  const { animalId, animalName, hospitalizationId } = route.params;
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleInputChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleBoolean = (name) => {
    setForm(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  };

  const onChangeDate = (event, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setSelectedDate(selected);
      handleInputChange('record_date', formatDate(selected));
    }
  };

  const onChangeTime = (event, selected) => {
    setShowTimePicker(false);
    if (selected) {
      setSelectedDate(selected);
      handleInputChange('record_time', formatTime(selected));
    }
  };

  const handleSubmit = async () => {
    if (!form.temperature || !form.record_date || !form.record_time) {
      Alert.alert('Erro', 'Preencha os campos obrigatórios: temperatura, data e hora.');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/clinic/hospitalizations/${hospitalizationId}/records`, {
        hospitalization_id: hospitalizationId,
        temperature: parseFloat(form.temperature),
        record_date: form.record_date,
        record_time: form.record_time,
        heart_rate: form.heart_rate ? parseInt(form.heart_rate, 10) : null,
        respiratory_rate: form.respiratory_rate ? parseInt(form.respiratory_rate, 10) : null,
        mucous_membranes: form.mucous_membranes || null,
        dehydration_level: form.dehydration_level,
        appetite: form.appetite,
        urine: form.urine,
        vomit: form.vomit,
        diarrhea: form.diarrhea,
        posture: form.posture || null,
        notes: form.notes || null,
      });

      Alert.alert('Sucesso', 'Registro clínico adicionado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Falha ao adicionar registro clínico'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Novo Registro para {animalName}</Text>

        <Text style={styles.sectionTitle}>Dados Clínicos</Text>

        <TextInput
          style={styles.input}
          placeholder="Temperatura (°C)*"
          keyboardType="numeric"
          value={form.temperature}
          onChangeText={(text) => handleInputChange('temperature', text)}
        />

        <View style={styles.datetimeContainer}>
          <TouchableOpacity 
            style={[styles.input, styles.halfInput]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>
              {form.record_date || 'Selecionar Data*'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.input, styles.halfInput]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.inputText}>
              {form.record_time || 'Selecionar Hora*'}
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Frequência cardíaca (bpm)"
          keyboardType="numeric"
          value={form.heart_rate}
          onChangeText={(text) => handleInputChange('heart_rate', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Frequência respiratória (rpm)"
          keyboardType="numeric"
          value={form.respiratory_rate}
          onChangeText={(text) => handleInputChange('respiratory_rate', text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Mucosas (ex: róseas, pálidas)"
          value={form.mucous_membranes}
          onChangeText={(text) => handleInputChange('mucous_membranes', text)}
        />

        <Text style={styles.label}>Nível de desidratação</Text>
        <View style={styles.optionsRow}>
          {['normal', 'mild', 'moderate', 'severe'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                form.dehydration_level === level && styles.optionButtonSelected,
              ]}
              onPress={() => handleInputChange('dehydration_level', level)}
            >
              <Text style={form.dehydration_level === level ? styles.optionTextSelected : styles.optionText}>
                {level === 'mild' ? 'Leve' : 
                 level === 'moderate' ? 'Moderada' : 
                 level === 'severe' ? 'Severa' : 'Normal'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Apetite</Text>
        <View style={styles.optionsRow}>
          {['normal', 'reduced', 'absent'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                form.appetite === level && styles.optionButtonSelected,
              ]}
              onPress={() => handleInputChange('appetite', level)}
            >
              <Text style={form.appetite === level ? styles.optionTextSelected : styles.optionText}>
                {level === 'reduced' ? 'Reduzido' : 
                 level === 'absent' ? 'Ausente' : 'Normal'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Urina</Text>
        <View style={styles.optionsRow}>
          {['normal', 'reduced', 'absent', 'increased'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                form.urine === level && styles.optionButtonSelected,
              ]}
              onPress={() => handleInputChange('urine', level)}
            >
              <Text style={form.urine === level ? styles.optionTextSelected : styles.optionText}>
                {level === 'reduced' ? 'Reduzida' : 
                 level === 'absent' ? 'Ausente' : 
                 level === 'increased' ? 'Aumentada' : 'Normal'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.checkboxRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleBoolean('vomit')}
          >
            <View style={[styles.checkbox, form.vomit && styles.checkboxChecked]}>
              {form.vomit && <Text style={styles.checkboxIcon}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Vômito</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => toggleBoolean('diarrhea')}
          >
            <View style={[styles.checkbox, form.diarrhea && styles.checkboxChecked]}>
              {form.diarrhea && <Text style={styles.checkboxIcon}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Diarréia</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Postura (ex: decúbito, em estação)"
          value={form.posture}
          onChangeText={(text) => handleInputChange('posture', text)}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observações"
          multiline
          numberOfLines={4}
          value={form.notes}
          onChangeText={(text) => handleInputChange('notes', text)}
        />

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Salvando...' : 'Salvar Registro'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            onChange={onChangeTime}
            is24Hour={true}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#1976d2',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  optionText: {
    fontSize: 14,
    color: '#555',
  },
  optionTextSelected: {
    color: '#fff',
  },
  checkboxRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 25,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  checkboxIcon: {
    color: '#fff',
    fontSize: 16,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#90caf9',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddHospitalizationRecordScreen;