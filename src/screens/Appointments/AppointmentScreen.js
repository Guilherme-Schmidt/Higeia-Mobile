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
  ScrollView,
  SafeAreaView,
  StatusBar
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

  const [teamMembers, setTeamMembers] = useState({
    employees: [],
    students: []
  });
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [currentTeamType, setCurrentTeamType] = useState('');

  const [showFormDatePicker, setShowFormDatePicker] = useState(false);
  const [formPickerMode, setFormPickerMode] = useState('date');
  const [formPickerField, setFormPickerField] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    type: 'all'
  });

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    hour: '',
    animal_id: '',
    animalSearchTerm: '',
    type_appointments: 'consulta',
    description: '',
    team: []
  });

  useEffect(() => {
    loadAppointments();
    loadAnimals();
    loadTeamMembers();
  }, []);

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

  const loadAnimals = async () => {
    try {
      setAnimalData(prev => ({...prev, loading: true}));
      const response = await api.get('/reg/animal', {
        params: { page: 1, size: 500 }
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

  const loadTeamMembers = async () => {
    try {
      setLoadingTeam(true);
      const response = await api.get('/reg/team/members', {
        params: { query: '', page: 1, size: 500 }
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

  const renderTeamMemberItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.teamMemberItem}
      onPress={() => selectTeamMember(item)}
    >
      <Text style={styles.teamMemberName}>{item.name}</Text>
      <Text style={styles.teamMemberType}>{item.member_type}</Text>
    </TouchableOpacity>
  );

  const TeamSelectionModal = () => (
    <Modal
      animationType="slide"
      transparent={false}
      visible={showTeamModal}
      onRequestClose={() => setShowTeamModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            Selecionar {currentTeamType === 'employee' ? 'Funcionário' : 'Estudante'}
          </Text>
          <TouchableOpacity onPress={() => setShowTeamModal(false)}>
            <Icon name="close" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {loadingTeam ? (
          <ActivityIndicator size="large" color="#e74c3c" />
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
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agendamentos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="add" size={24} color="#fff" />
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
          <Icon name="event" size={18} color="#555" />
          <Text style={styles.dateText}>
            {dateRange.startDate.toLocaleDateString('pt-BR')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.dateSeparator}>a</Text>

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => {
            setDateRangePickerField('endDate');
            setShowDateRangePicker(true);
          }}
        >
          <Icon name="event" size={18} color="#555" />
          <Text style={styles.dateText}>
            {dateRange.endDate.toLocaleDateString('pt-BR')}
          </Text>
        </TouchableOpacity>
      </View>

      {showDateRangePicker && (
        <DateTimePicker
          value={dateRangePickerField === 'startDate' ? dateRange.startDate : dateRange.endDate}
          mode="date"
          display="default"
          onChange={handleDateRangeChange}
          locale="pt-BR"
          themeVariant="light"
        />
      )}

      {/* Filtros Adicionais */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar..."
          placeholderTextColor="#999"
          value={filters.search}
          onChangeText={(text) => setFilters({ ...filters, search: text })}
        />

        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.typeFilterContainer}
        >
          {['all', 'consulta', 'cirurgia', 'vacina'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterButton,
                filters.type === type && styles.activeFilter
              ]}
              onPress={() => setFilters({ ...filters, type })}
            >
              <Text style={[
                styles.filterText,
                filters.type === type && styles.activeFilterText
              ]}>
                {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de Consultas */}
      {loading ? (
        <ActivityIndicator size="large" color="#e74c3c" style={styles.loader} />
      ) : (
        <FlatList
          data={appointments.filter(apt => {
            if (filters.type !== 'all' && apt.type_appointments !== filters.type) {
              return false;
            }
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
            <View style={styles.emptyContainer}>
              <Icon name="event-busy" size={40} color="#ddd" />
              <Text style={styles.emptyText}>Nenhum agendamento no período</Text>
            </View>
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
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Agendamento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#e74c3c" />
              </TouchableOpacity>
            </View>

            {/* Campo de Data */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Data *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setFormPickerMode('date');
                  setFormPickerField('date');
                  setShowFormDatePicker(true);
                }}
              >
                <Icon name="calendar-today" size={18} color="#555" />
                <Text style={styles.inputText}>{form.date}</Text>
              </TouchableOpacity>
            </View>

            {/* Campo de Horário */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Horário *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => {
                  setFormPickerMode('time');
                  setFormPickerField('hour');
                  setShowFormDatePicker(true);
                }}
              >
                <Icon name="access-time" size={18} color="#555" />
                <Text style={styles.inputText}>
                  {form.hour || 'Selecione o horário'}
                </Text>
              </TouchableOpacity>
            </View>

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
                locale="pt-BR"
                themeVariant="light"
              />
            )}

            {/* Campo de Animal */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Animal *</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowAnimalsDropdown(!showAnimalsDropdown)}
              >
                <Icon name="pets" size={18} color="#555" />
                <Text style={styles.inputText}>
                  {form.animalSearchTerm || 'Selecione um animal'}
                </Text>
              </TouchableOpacity>
              
              {showAnimalsDropdown && (
                <View style={styles.animalsDropdown}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar animal..."
                    placeholderTextColor="#999"
                    value={form.animalSearchTerm}
                    onChangeText={filterAnimals}
                    autoFocus={true}
                  />
                  
                  {animalData.loading ? (
                    <ActivityIndicator size="small" color="#e74c3c" style={styles.loadingIndicator} />
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
              <ScrollView 
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeFilterContainer}
              >
                {['consulta', 'cirurgia', 'vacina'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      form.type_appointments === type && styles.activeFilter
                    ]}
                    onPress={() => setForm({ ...form, type_appointments: type })}
                  >
                    <Text style={[
                      styles.filterText,
                      form.type_appointments === type && styles.activeFilterText
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Campo de Descrição */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={4}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>

            {/* Campo de Equipe */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Equipe</Text>
              {form.team.map((member, index) => (
                <View key={index} style={styles.teamMemberForm}>
                  <Text style={styles.teamMemberText}>
                    {member.name} ({member.member_type})
                  </Text>
                  <TouchableOpacity onPress={() => removeTeamMember(index)}>
                    <Icon name="delete" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ))}

              <View style={styles.addTeamButtons}>
                <TouchableOpacity
                  style={styles.teamTypeButton}
                  onPress={() => openTeamModal('employee')}
                >
                  <Text style={styles.teamTypeButtonText}>+ Funcionário</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.teamTypeButton}
                  onPress={() => openTeamModal('student')}
                >
                  <Text style={styles.teamTypeButtonText}>+ Estudante</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão de Agendar */}
            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={scheduleAppointment}
            >
              <Text style={styles.submitButtonText}>Agendar</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Seleção de Equipe */}
      <TeamSelectionModal />
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
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#e74c3c',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
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
    flex: 1,
    marginHorizontal: 8,
  },
  dateText: {
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
  },
  dateSeparator: {
    fontSize: 16,
    color: '#666',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    marginBottom: 12,
  },
  typeFilterContainer: {
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#e74c3c',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
  },
  loader: {
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },

  // Card de agendamento
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#e74c3c',
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
    borderTopColor: '#eee',
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

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  inputText: {
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },

  // Dropdown de animais
  animalsDropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  animalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  animalName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  animalOwner: {
    fontSize: 14,
    color: '#666',
  },
  animalSpecies: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  loadingIndicator: {
    marginVertical: 12,
  },

  // Equipe no formulário
  teamMemberForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  teamMemberText: {
    fontSize: 14,
    color: '#333',
  },
  addTeamButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  teamTypeButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  teamTypeButtonText: {
    color: '#fff',
    fontSize: 14,
  },

  // Botão de submit
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal de seleção de equipe
  teamMemberItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  teamMemberName: {
    fontSize: 16,
    color: '#333',
  },
  teamMemberType: {
    fontSize: 14,
    color: '#666',
  },
});

export default AppointmentScreen;