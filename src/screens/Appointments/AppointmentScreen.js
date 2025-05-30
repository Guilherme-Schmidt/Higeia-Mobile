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
  
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [dateRangePickerField, setDateRangePickerField] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 7))
  });

  const [animalData, setAnimalData] = useState({
    loading: false,
    animals: [],
    filteredAnimals: []
  });
  const [showAnimalsDropdown, setShowAnimalsDropdown] = useState(false);

  // Estados para equipe
  const [teamMembers, setTeamMembers] = useState({
    employees: [],
    students: []
  });
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [currentTeamType, setCurrentTeamType] = useState('');

  // Estados para pickers de data/hora do formulário
  const [showFormDatePicker, setShowFormDatePicker] = useState(false);
  const [formPickerMode, setFormPickerMode] = useState('date');
  const [formPickerField, setFormPickerField] = useState(null);

  // Estados para filtros
  const [filters, setFilters] = useState({
    search: '',
    type: 'all'
  });

  // Estado do formulário
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hour: '',
    animal_id: '',
    animalSearchTerm: '',
    type_appointments: 'consulta',
    description: '',
    team: []
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadAppointments();
    loadAnimals();
    loadTeamMembers();
  }, []);

  // Carregar agendamentos
  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        whereBetween: `${dateRange.startDate.toISOString().split('T')[0]},${dateRange.endDate.toISOString().split('T')[0]}`
      };

      const response = await api.get('/clinic/appointment', { params });
      setAppointments(response.data.items || []);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
      Alert.alert('Erro', 'Não foi possível carregar os agendamentos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar animais - Versão Corrigida
  const loadAnimals = async () => {
    try {
      setAnimalData(prev => ({...prev, loading: true}));
      const response = await api.get('/reg/animal', {
        params: {
          page: 1,
          size: 500
        },
        headers: {
          'Authorization': 'Bearer seu_token_aqui',
          'Content-Type': 'application/json'
        }
      });

      setAnimalData({
        loading: false,
        animals: response.data.items || [],
        filteredAnimals: response.data.items || []
      });
    } catch (error) {
      console.error('Erro ao carregar animais:', error);
      setAnimalData(prev => ({...prev, loading: false}));
      Alert.alert('Erro', 'Não foi possível carregar a lista de animais');
    }
  };

  // Carregar membros da equipe
  const loadTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const response = await api.get('/reg/team/members', {
        params: {
          query: '',
          page: 1,
          size: 500
        },
        headers: {
          'Authorization': 'Bearer seu_token_aqui',
          'Content-Type': 'application/json'
        }
      });

      setTeamMembers({
        employees: response.data.items.filter(m => m.member_type === 'Employee'),
        students: response.data.items.filter(m => m.member_type === 'Student')
      });
    } catch (error) {
      console.error('Erro ao carregar equipe:', error);
      Alert.alert('Erro', 'Não foi possível carregar a equipe');
    } finally {
      setLoadingTeam(false);
    }
  };

  // Filtrar animais - Versão Corrigida
  const filterAnimals = (text) => {
    setForm(prev => ({...prev, animalSearchTerm: text}));
    
    setAnimalData(prev => {
      if (!text) {
        return {...prev, filteredAnimals: prev.animals};
      }
      
      const filtered = prev.animals.filter(animal =>
        animal.name.toLowerCase().includes(text.toLowerCase()) ||
        (animal.owner_name && animal.owner_name.toLowerCase().includes(text.toLowerCase()))
      );
      
      return {...prev, filteredAnimals: filtered};
    });
  };

  // Selecionar animal - Versão Corrigida
  const selectAnimal = (animal) => {
    setForm(prev => ({
      ...prev,
      animal_id: animal.id,
      animalSearchTerm: `${animal.name} (${animal.owner_name || 'Sem dono'})`
    }));
    setShowAnimalsDropdown(false);
  };

  const handleFormDateChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setShowFormDatePicker(false);
      return;
    }

    if (selected) {
      if (formPickerField === 'date') {
        setForm(prev => ({...prev, date: selected.toISOString().split('T')[0]}));
      } else if (formPickerField === 'hour') {
        const hours = selected.getHours().toString().padStart(2, '0');
        const minutes = selected.getMinutes().toString().padStart(2, '0');
        setForm(prev => ({...prev, hour: `${hours}:${minutes}`}));
      }
    }
    setShowFormDatePicker(false);
  };

  const handleDateRangeChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setShowDateRangePicker(false);
      return;
    }

    if (selected) {
      if (dateRangePickerField === 'startDate') {
        setDateRange(prev => ({...prev, startDate: selected}));
      } else if (dateRangePickerField === 'endDate') {
        setDateRange(prev => ({...prev, endDate: selected}));
      }
    }
    setShowDateRangePicker(false);
  };

  // Manipuladores de equipe
  const openTeamModal = (type) => {
    setCurrentTeamType(type);
    setShowTeamModal(true);
  };

  const selectTeamMember = (member) => {
    setForm(prev => ({
      ...prev,
      team: [...prev.team, {
        member_type: member.member_type.toLowerCase(),
        member_id: member.member_id,
        name: member.name
      }]
    }));
    setShowTeamModal(false);
  };

  const removeTeamMember = (index) => {
    setForm(prev => {
      const newTeam = [...prev.team];
      newTeam.splice(index, 1);
      return {...prev, team: newTeam};
    });
  };

  const scheduleAppointment = async () => {
    if (!form.animal_id || !form.date || !form.hour) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (Animal, Data, Horário)');
      return;
    }
    try {
      await api.post('/clinic/appointment', form);
      setModalVisible(false);
      resetForm();
      loadAppointments();
      Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
    } catch (error) {
      console.error('Erro ao agendar:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Erro ao agendar consulta');
    }
  };

  // Resetar formulário
  const resetForm = () => {
    setForm({
      date: new Date().toISOString().split('T')[0],
      hour: '',
      animal_id: '',
      animalSearchTerm: '',
      type_appointments: 'consulta',
      description: '',
      team: []
    });
  };

  // Renderizar item de agendamento
  const renderAppointment = ({ item }) => (
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

  // Renderizar item de animal - Versão Corrigida
  const renderAnimalItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.animalItem} 
      onPress={() => selectAnimal(item)}
    >
      <Text style={styles.animalName}>{item.name}</Text>
      <Text style={styles.animalOwner}>Dono: {item.owner_name || 'Não informado'}</Text>
      {item.species && <Text style={styles.animalSpecies}>Espécie: {item.species}</Text>}
    </TouchableOpacity>
  );

  // Renderizar item de membro da equipe
  const renderTeamMemberItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.teamMemberItem}
      onPress={() => selectTeamMember(item)}
    >
      <Text style={styles.teamMemberName}>{item.name}</Text>
      <Text style={styles.teamMemberType}>{item.member_type}</Text>
    </TouchableOpacity>
  );

  // Modal de Seleção de Equipe
  const TeamSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showTeamModal}
      onRequestClose={() => setShowTeamModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Selecionar {currentTeamType === 'employee' ? 'Funcionário' : 'Estudante'}
          </Text>
          <TouchableOpacity onPress={() => setShowTeamModal(false)}>
            <Icon name="close" size={24} color="#f44336" />
          </TouchableOpacity>
        </View>

        {loadingTeam ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <FlatList
            data={currentTeamType === 'employee' ? teamMembers.employees : teamMembers.students}
            renderItem={renderTeamMemberItem}
            keyExtractor={(item) => item.member_id?.toString() || Math.random().toString()}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Nenhum {currentTeamType === 'employee' ? 'funcionário' : 'estudante'} disponível
              </Text>
            }
          />
        )}
      </View>
    </Modal>
  );

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

          {/* Campo de Data */}
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

          {/* Campo de Horário */}
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

          {/* Campo de Animal - Versão Corrigida */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Animal</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowAnimalsDropdown(!showAnimalsDropdown)}
            >
              <Text>{form.animalSearchTerm || 'Selecione um animal'}</Text>
            </TouchableOpacity>
            
            {showAnimalsDropdown && (
              <View style={styles.animalsDropdown}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar animal..."
                  value={form.animalSearchTerm}
                  onChangeText={filterAnimals}
                  autoFocus={true}
                />
                
                {animalData.loading ? (
                  <ActivityIndicator size="small" color="#4CAF50" style={styles.loadingIndicator} />
                ) : (
                  <FlatList
                    data={animalData.filteredAnimals}
                    renderItem={renderAnimalItem}
                    keyExtractor={item => item.id?.toString() || `animal-${Math.random().toString(36).substr(2, 9)}`}
                    keyboardShouldPersistTaps="handled"
                    ListEmptyComponent={
                      <Text style={styles.emptyText}>
                        {form.animalSearchTerm ? 'Nenhum animal encontrado' : 'Nenhum animal cadastrado'}
                      </Text>
                    }
                  />
                )}
              </View>
            )}
          </View>

          {/* Campo de Tipo de Consulta */}
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

          {/* Campo de Descrição */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
            />
          </View>

          {/* Campo de Equipe */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Equipe</Text>
            {form.team.map((member, index) => (
              <View key={index} style={styles.teamMemberForm}>
                <Text>{member.name} ({member.member_type})</Text>
                <TouchableOpacity onPress={() => removeTeamMember(index)}>
                  <Icon name="delete" size={20} color="#f44336" />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addTeamButtons}>
              <TouchableOpacity
                style={[styles.filterButton, { marginRight: 10 }]}
                onPress={() => openTeamModal('employee')}
              >
                <Text style={styles.filterText}>+ Funcionário</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => openTeamModal('student')}
              >
                <Text style={styles.filterText}>+ Estudante</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Botão de Agendar */}
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

      {/* Modal de Seleção de Equipe */}
      <TeamSelectionModal />
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
  loadingIndicator: { marginVertical: 10 },
  listContent: { paddingBottom: 100 },
  
  // Estilos para cards de agendamento
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
  
  // Estilos para o modal
  modalContainer: { flex: 1, padding: 15, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  formGroup: { marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    paddingHorizontal: 10, 
    height: 40, 
    justifyContent: 'center' 
  },
  
  // Estilos para dropdown de animais
  animalsDropdown: { 
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#fff'
  },
  animalItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  animalName: {
    fontWeight: 'bold',
    fontSize: 16
  },
  animalOwner: {
    fontSize: 14,
    color: '#666'
  },
  animalSpecies: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic'
  },
  
  // Estilos para equipe no formulário
  teamMemberForm: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 5,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 5
  },
  addTeamButtons: { 
    flexDirection: 'row', 
    marginTop: 5 
  },
  
  // Estilos para seleção de membros da equipe
  teamMemberItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  
  // Botão de submit
  submitButton: { 
    backgroundColor: '#4CAF50', 
    padding: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 10 
  },
  submitButtonText: { 
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
  
  // Texto para listas vazias
  emptyText: { 
    textAlign: 'center', 
    marginTop: 30, 
    fontSize: 16, 
    color: '#999' 
  }
});

export default AppointmentScreen;