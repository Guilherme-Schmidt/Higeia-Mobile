import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../../api/api';

const AppointmentScreen = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Separate state for date range picker
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRangePickerField, setDateRangePickerField] = useState(null); // 'startDate' or 'endDate'

  const [animalsList, setAnimalsList] = useState([]);
  const [animalSearchTerm, setAnimalSearchTerm] = useState('');
  const [showAnimalDropdown, setShowAnimalDropdown] = useState(false);

  // --- Novos estados para Veterinários e Técnicos ---
  const [veterinariansList, setVeterinariansList] = useState([]);
  const [techniciansList, setTechniciansList] = useState([]);

  // Estados para controlar o modal de seleção de equipe
  const [showTeamSelectionModal, setShowTeamSelectionModal] = useState(false);
  const [currentTeamType, setCurrentTeamType] = useState(''); // 'veterinario' ou 'tecnico'
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);

  // Separate state for form date/time pickers
  const [showFormDatePicker, setShowFormDatePicker] = useState(false);
  const [formPickerMode, setFormPickerMode] = useState('date'); // 'date' or 'time'
  const [formPickerField, setFormPickerField] = useState(null); // 'date' or 'hour'

  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hour: '',
    animal_id: '',
    type_appointments: 'consulta',
    description: '',
    team: []
  });

  const fetchVeterinarians = async () => {
    try {
      // Ajuste sua rota API para buscar veterinários
      const response = await api.get('/clinic/veterinarians');
      // Suponha que sua API retorna um array de { id: '...', name: '...' }
      setVeterinariansList(response.data.items || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar veterinários:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de veterinários.');
    }
  };

  // Função para carregar técnicos
  const fetchTechnicians = async () => {
    try {
      // Ajuste sua rota API para buscar técnicos
      const response = await api.get('/clinic/technicians');
      // Suponha que sua API retorna um array de { id: '...', name: '...' }
      setTechniciansList(response.data.items || response.data || []);
    } catch (error) {
      console.error('Erro ao carregar técnicos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de técnicos.');
    }
  };


  const [filters, setFilters] = useState({
    search: '',
    type: 'all'
  });

  

  // Função para carregar agendamentos
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        whereBetween: `${dateRange.startDate.toISOString().split('T')[0]},${dateRange.endDate.toISOString().split('T')[0]}`
      };

      const response = await api.get('/clinic/appointment', { params });
      console.log('Dados completos recebidos:', response.data);
      setAppointments(response.data.items || []);

    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Buscando agendamentos entre:', {
      start: dateRange.startDate.toISOString().split('T')[0],
      end: dateRange.endDate.toISOString().split('T')[0]
    });
    loadAppointments();
  }, [dateRange]);

  // Agendar nova consulta
  const scheduleAppointment = async () => {
    if (!form.animal_id || !form.date || !form.hour) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (Animal, Data, Horário)');
      return;
    }
    try {
      await api.post('/clinic/appointment', form);
      setModalVisible(false);
      setForm({
        date: new Date().toISOString().split('T')[0],
        hour: '',
        animal_id: '',
        type_appointments: 'consulta',
        description: '',
        team: []
      });
      loadAppointments();
      Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao agendar consulta');
    }
  };

  // Manipulador do DateTimePicker para o FORMULÁRIO
  const handleFormDateChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setShowFormDatePicker(false);
      return;
    }

    if (selected) {
      if (formPickerField === 'date') {
        setForm({ ...form, date: selected.toISOString().split('T')[0] });
      } else if (formPickerField === 'hour') {
        const hours = selected.getHours().toString().padStart(2, '0');
        const minutes = selected.getMinutes().toString().padStart(2, '0');
        setForm({ ...form, hour: `${hours}:${minutes}` });
      }
    }
    setShowFormDatePicker(false);
  };

  // Manipulador do DateTimePicker para o FILTRO DE DATAS
  const handleDateRangeChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setShowDateRangePicker(false);
      return;
    }

    if (selected) {
      if (dateRangePickerField === 'startDate') {
        setDateRange({ ...dateRange, startDate: selected });
      } else if (dateRangePickerField === 'endDate') {
        setDateRange({ ...dateRange, endDate: selected });
      }
    }
    setShowDateRangePicker(false);
  };

  // Adicionar membro ao time - ajuste o ID conforme sua lógica
  const addTeamMember = (memberType) => {
    // Exemplo: gerar ID único ou escolher de lista real
    const newId = (Math.random() * 100000).toFixed(0);
    setForm({
      ...form,
      team: [...form.team, {
        member_type: memberType,
        member_id: newId
      }]
    });
  };

  // Remover membro do time
  const removeTeamMember = (index) => {
    const newTeam = [...form.team];
    newTeam.splice(index, 1);
    setForm({ ...form, team: newTeam });
  };

  // Renderiza cada agendamento
  const renderAppointment = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTime}>
            {item.hour ? item.hour.substring(0, 5) : '--:--'}
          </Text>
          <Text style={styles.cardType}>
            {item.type_appointments || 'Consulta'}
          </Text>
        </View>

        <Text style={styles.cardTitle}>
          {item.animal?.name || 'Animal não especificado'}
        </Text>

        <Text style={styles.cardOwner}>
          Dono: {item.owner_animal?.name || 'Dono não especificado'}
        </Text>

        {item.description && (
          <Text style={styles.cardDescription}>
            {item.description}
          </Text>
        )}

        {item.team && item.team.length > 0 && (
          <View style={styles.teamContainer}>
            <Text style={styles.teamTitle}>Equipe:</Text>
            {item.team.map((member, index) => (
              <View key={`${item.id}-${index}`} style={styles.teamMember}>
                <Text style={styles.teamMemberName}>
                  {member.name || 'Membro sem nome'}
                </Text>
                <Text style={styles.teamMemberType}>
                  ({member.member_type || 'Tipo não especificado'})
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Agendamentos</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Icon name="add" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Filtros de Data */}
      <View style={styles.dateFilterContainer}>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            setDateRangePickerField('startDate');
            setShowDateRangePicker(true);
          }}
        >
          <Text>{dateRange.startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.dateSeparator}>a</Text>

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            setDateRangePickerField('endDate');
            setShowDateRangePicker(true);
          }}
        >
          <Text>{dateRange.endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
      </View>

      {/* DateTimePicker para Filtros de Data */}
      {showDateRangePicker && (
        <DateTimePicker
          value={dateRangePickerField === 'startDate' ? dateRange.startDate : dateRange.endDate}
          mode="date"
          display="default"
          onChange={handleDateRangeChange}
        />
      )}

      {/* Filtros Adicionais */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
        />

        <View style={styles.typeFilter}>
          {['all', 'consulta', 'cirurgia', 'vacina'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filters.type === type && styles.activeFilter
              ]}
              onPress={() => setFilters({ ...filters, type })}
            >
              <Text style={styles.filterText}>
                {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Lista de Consultas */}
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
      ) : (
        <FlatList
          data={appointments.filter(apt => {
            // Filtro por tipo
            if (filters.type !== 'all' && apt.type_appointments !== filters.type) {
              return false;
            }

            // Filtro por busca
            if (filters.search &&
              !apt.animal?.name.toLowerCase().includes(filters.search.toLowerCase()) &&
              !apt.owner_animal?.name.toLowerCase().includes(filters.search.toLowerCase())) {
              return false;
            }

            return true;
          })}
          renderItem={renderAppointment}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum agendamento no período</Text>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Modal de Agendamento */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Agendamento</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Icon name="close" size={24} color="#f44336" />
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setFormPickerMode('date');
                setFormPickerField('date');
                setShowFormDatePicker(true);
              }}
            >
              <Text>{form.date}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Horário</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setFormPickerMode('time');
                setFormPickerField('hour');
                setShowFormDatePicker(true);
              }}
            >
              <Text>{form.hour || 'Selecione o horário'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>ID do Animal</Text>
            <TextInput
              style={styles.input}
              placeholder="ID do Animal"
              value={form.animal_id}
              onChangeText={(text) => setForm({ ...form, animal_id: text })}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Tipo de Consulta</Text>
            <View style={styles.typeFilter}>
              {['consulta', 'cirurgia', 'vacina'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterButton,
                    form.type_appointments === type && styles.activeFilter
                  ]}
                  onPress={() => setForm({ ...form, type_appointments: type })}
                >
                  <Text style={styles.filterText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
          </View>

          {/* Equipe */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Equipe</Text>
            {form.team.map((member, index) => (
              <View key={index} style={styles.teamMemberForm}>
                <Text>{member.member_type} - ID: {member.member_id}</Text>
                <TouchableOpacity onPress={() => removeTeamMember(index)}>
                  <Icon name="delete" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addTeamButtons}>
              <TouchableOpacity
                style={[styles.filterButton, { marginRight: 10 }]}
                onPress={() => addTeamMember('veterinario')}
              >
                <Text style={styles.filterText}>+ Veterinário</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => addTeamMember('tecnico')}
              >
                <Text style={styles.filterText}>+ Técnico</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={scheduleAppointment}>
            <Text style={styles.submitButtonText}>Agendar</Text>
          </TouchableOpacity>

          {/* DateTimePicker para o FORMULÁRIO */}
          {showFormDatePicker && (
            <DateTimePicker
              value={
                formPickerField === 'hour' && form.hour
                  ? (() => {
                    const [h, m] = form.hour.split(':');
                    const d = new Date();
                    d.setHours(parseInt(h), parseInt(m));
                    return d;
                  })()
                  : new Date(form.date)
              }
              mode={formPickerMode}
              display="default"
              onChange={handleFormDateChange}
            />
          )}

        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold' },
  dateFilterContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  dateInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, minWidth: 110, alignItems: 'center' },
  dateSeparator: { marginHorizontal: 5, fontSize: 18 },
  filterContainer: { marginBottom: 10 },
  searchInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingHorizontal: 10, height: 40, marginBottom: 8 },
  typeFilter: { flexDirection: 'row' },
  filterButton: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 20, backgroundColor: '#ddd', marginRight: 6 },
  activeFilter: { backgroundColor: '#4CAF50' },
  filterText: { color: '#000' },
  loader: { marginTop: 30 },
  listContent: { paddingBottom: 100 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardType: {
    fontSize: 14,
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
  cardOwner: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  teamContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  teamTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  teamMember: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  teamMemberName: {
    fontSize: 14,
    color: '#444',
    marginRight: 8,
  },
  teamMemberType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  modalContainer: { flex: 1, padding: 15, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  formGroup: { marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingHorizontal: 10, height: 40, justifyContent: 'center' },
  teamMemberForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  addTeamButtons: { flexDirection: 'row', marginTop: 5 },
  submitButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 30, fontSize: 16, color: '#999' }
});

export default AppointmentScreen;