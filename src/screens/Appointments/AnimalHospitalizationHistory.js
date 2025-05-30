import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const AnimalHospitalizationHistory = ({ route }) => {
  const { animalId } = route.params;
  
  // Dados mockados - substitua pela sua chamada API
  const history = [
    { id: 1, admission_date: '01/01/2023', discharge_date: '05/01/2023', diagnosis: 'Problema gastrointestinal' },
    { id: 2, admission_date: '10/03/2023', discharge_date: '15/03/2023', diagnosis: 'Cirurgia de castração' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Internações</Text>
      
      <FlatList
        data={history}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.dateRow}>
              <Icon name="calendar" size={16} color="#666" />
              <Text style={styles.dateText}>{item.admission_date} - {item.discharge_date}</Text>
            </View>
            <Text style={styles.diagnosis}>{item.diagnosis}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    marginLeft: 8,
    color: '#666',
  },
  diagnosis: {
    fontWeight: 'bold',
  },
});

export default AnimalHospitalizationHistory;