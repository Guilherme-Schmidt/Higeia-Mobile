import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const RecordDetailScreen = ({ route }) => {
  const { record, animalName } = route.params;

  const translateValue = (value, type) => {
    const translations = {
      dehydration_level: {
        normal: 'Normal',
        mild: 'Leve', 
        moderate: 'Moderada',
        severe: 'Severa'
      },
      appetite: {
        normal: 'Normal',
        reduced: 'Reduzido',
        absent: 'Ausente'
      },
      urine: {
        normal: 'Normal',
        reduced: 'Reduzida',
        absent: 'Ausente',
        increased: 'Aumentada'
      }
    };
    
    return translations[type]?.[value] || value;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Detalhes do Registro</Text>
      <Text style={styles.subtitle}>{animalName}</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data e Hora</Text>
        <Text>
          {new Date(`${record.record_date}T${record.record_time}`).toLocaleString()}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sinais Vitais</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Temperatura:</Text>
          <Text>{record.temperature} °C</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Frequência Cardíaca:</Text>
          <Text>{record.heart_rate || '-'} bpm</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Frequência Respiratória:</Text>
          <Text>{record.respiratory_rate || '-'} rpm</Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avaliação Clínica</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Mucosas:</Text>
          <Text>{record.mucous_membranes || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Desidratação:</Text>
          <Text>{translateValue(record.dehydration_level, 'dehydration_level')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Apetite:</Text>
          <Text>{translateValue(record.appetite, 'appetite')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Urina:</Text>
          <Text>{translateValue(record.urine, 'urine')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Vômito:</Text>
          <Text>{record.vomit ? 'Sim' : 'Não'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Diarréia:</Text>
          <Text>{record.diarrhea ? 'Sim' : 'Não'}</Text>
        </View>
      </View>
      
      {record.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <Text style={styles.notes}>{record.notes}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16
  },
  section: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e74c3c'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  label: {
    fontWeight: '600'
  },
  notes: {
    lineHeight: 22
  }
});

export default RecordDetailScreen;