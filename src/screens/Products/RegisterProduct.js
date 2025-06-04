import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../api/api';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterProduct({navigation}) {
  const [form, setForm] = useState({
    name: '',
    amount: '',
    barCode: '',
    controlled: false,
    productCategory: '',
    unit: '',
    laboratory: '',
    productUse: ''
  });
  const [batches, setBatches] = useState([]);
  const [activePrinciples, setActivePrinciples] = useState([]);
  const [newActivePrinciple, setNewActivePrinciple] = useState('');
  const [newBatch, setNewBatch] = useState({
    number: '',
    validity: '',
    entryTotal: '',
    outputTotal: ''
  });

  const [dropdownData, setDropdownData] = useState({
    categories: [],
    units: [],
    laboratories: [],
    productUses: []
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadDropdownData();
  }, []);

  async function loadDropdownData() {
    try {
      setLoading(true);
      const [categoriesRes, unitsRes, labsRes, usesRes] = await Promise.all([
        api.get('/pharmacy/products/category'),
        api.get('/pharmacy/products/unit'),
        api.get('/pharmacy/products/laboratory'),
        api.get('/pharmacy/products/use'),
      ]);

      setDropdownData({
        categories: categoriesRes.data?.items || [],
        units: unitsRes.data?.items || [],
        laboratories: labsRes.data?.items || [],
        productUses: usesRes.data?.items || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddBatch = () => {
    if (!newBatch.number || !newBatch.validity || !newBatch.entryTotal) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios do lote');
      return;
    }
    
    const batch = {
      batch: newBatch.number,
      validity: newBatch.validity,
      entry_total: parseInt(newBatch.entryTotal),
      output_total: parseInt(newBatch.outputTotal || '0'),
      amount_total: parseInt(newBatch.entryTotal) - parseInt(newBatch.outputTotal || '0'),
    };
    
    setBatches([...batches, batch]);
    setNewBatch({
      number: '',
      validity: '',
      entryTotal: '',
      outputTotal: ''
    });
  };

  const handleAddActivePrinciple = () => {
    if (!newActivePrinciple.trim()) {
      Alert.alert('Atenção', 'Informe o nome do princípio ativo');
      return;
    }
    setActivePrinciples([...activePrinciples, { name: newActivePrinciple.trim() }]);
    setNewActivePrinciple('');
  };

  const removeItem = (list, setList, index) => {
    const newList = [...list];
    newList.splice(index, 1);
    setList(newList);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setNewBatch({...newBatch, validity: date.toISOString().split('T')[0]});
    }
  };

  async function handleSave() {
    const requiredFields = [
      {field: 'name', label: 'Nome do produto'},
      {field: 'amount', label: 'Quantidade'},
      {field: 'barCode', label: 'Código de barras'},
      {field: 'productCategory', label: 'Categoria'},
      {field: 'unit', label: 'Unidade'},
      {field: 'laboratory', label: 'Laboratório'},
      {field: 'productUse', label: 'Uso do produto'}
    ];

    const missingField = requiredFields.find(f => !form[f.field]);
    if (missingField) {
      Alert.alert('Atenção', `Preencha o campo: ${missingField.label}`);
      return;
    }

    const payload = {
      ...form,
      product_category_id: form.productCategory,
      amount: parseInt(form.amount),
      unit_id: form.unit,
      product_use_id: form.productUse,
      controlled: form.controlled ? 1 : 0,
      laboratory_id: form.laboratory,
      batch_active: batches.length > 0,
      batchs: batches,
      active_principle: activePrinciples,
    };

    try {
      setLoading(true);
      const response = await api.post('/pharmacy/product', payload);

      if (response.data?.Error === "Not create") {
        const errorMessage = response.data.Error_Message 
          ? Object.values(response.data.Error_Message).join('\n') 
          : 'Não foi possível cadastrar o produto.';
        throw new Error(errorMessage);
      }

      Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
        {text: 'OK', onPress: () => navigation.goBack()}
      ]);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      Alert.alert(
        'Erro', 
        error.response?.data?.message || 
        error.message || 
        'Erro ao cadastrar produto'
      );
    } finally {
      setLoading(false);
    }
  }

  const handleFormChange = (field, value) => {
    setForm({...form, [field]: value});
  };

  if (loading && dropdownData.categories.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      

        {/* Formulário Principal */}
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome do produto *"
          value={form.name}
          onChangeText={(text) => handleFormChange('name', text)}
          autoCapitalize="words"
        />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, {flex: 1, marginRight: 10}]}
            placeholder="Quantidade *"
            value={form.amount}
            onChangeText={(text) => handleFormChange('amount', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, {flex: 1}]}
            placeholder="Código de barras *"
            value={form.barCode}
            onChangeText={(text) => handleFormChange('barCode', text)}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Categoria *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.productCategory}
              onValueChange={(value) => handleFormChange('productCategory', value)}
            >
              <Picker.Item label="Selecione..." value="" />
              {dropdownData.categories.map(cat => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.pickerGroup, {flex: 1, marginRight: 10}]}>
            <Text style={styles.label}>Unidade *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.unit}
                onValueChange={(value) => handleFormChange('unit', value)}
              >
                <Picker.Item label="Selecione..." value="" />
                {dropdownData.units.map(u => (
                  <Picker.Item key={u.id} label={u.name} value={u.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.pickerGroup, {flex: 1}]}>
            <Text style={styles.label}>Laboratório *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.laboratory}
                onValueChange={(value) => handleFormChange('laboratory', value)}
              >
                <Picker.Item label="Selecione..." value="" />
                {dropdownData.laboratories.map(lab => (
                  <Picker.Item key={lab.id} label={lab.name} value={lab.id} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Uso do Produto *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.productUse}
              onValueChange={(value) => handleFormChange('productUse', value)}
            >
              <Picker.Item label="Selecione..." value="" />
              {dropdownData.productUses.map(use => (
                <Picker.Item key={use.id} label={use.name} value={use.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Produto Controlado</Text>
          <Switch
            value={form.controlled}
            onValueChange={(value) => handleFormChange('controlled', value)}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={form.controlled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        {/* Seção de Lotes */}
        <Text style={styles.sectionTitle}>Lotes</Text>
        
        {batches.map((batch, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Lote: {batch.batch}</Text>
              <Text style={styles.itemDetail}>Validade: {batch.validity}</Text>
              <Text style={styles.itemDetail}>Quantidade: {batch.amount_total}</Text>
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem(batches, setBatches, index)}
            >
              <Icon name="trash-2" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, {flex: 1, marginRight: 10}]}
            placeholder="Número do Lote *"
            value={newBatch.number}
            onChangeText={(text) => setNewBatch({...newBatch, number: text})}
          />
          <TouchableOpacity 
            style={[styles.input, {flex: 1, justifyContent: 'center'}]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={newBatch.validity ? styles.inputText : styles.placeholderText}>
              {newBatch.validity || 'Validade *'}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.row}>
          <TextInput
            style={[styles.input, {flex: 1, marginRight: 10}]}
            placeholder="Entrada Total *"
            value={newBatch.entryTotal}
            onChangeText={(text) => setNewBatch({...newBatch, entryTotal: text})}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, {flex: 1}]}
            placeholder="Saída Total"
            value={newBatch.outputTotal}
            onChangeText={(text) => setNewBatch({...newBatch, outputTotal: text})}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleAddBatch}
        >
          <Icon name="plus" size={18} color="#fff" />
          <Text style={styles.secondaryButtonText}>Adicionar Lote</Text>
        </TouchableOpacity>

        {/* Seção de Princípios Ativos */}
        <Text style={styles.sectionTitle}>Princípios Ativos</Text>
        
        {activePrinciples.map((ap, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.itemText}>{ap.name}</Text>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeItem(activePrinciples, setActivePrinciples, index)}
            >
              <Icon name="trash-2" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}

        <TextInput
          style={styles.input}
          placeholder="Nome do Princípio Ativo"
          value={newActivePrinciple}
          onChangeText={setNewActivePrinciple}
        />

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleAddActivePrinciple}
        >
          <Icon name="plus" size={18} color="#fff" />
          <Text style={styles.secondaryButtonText}>Adicionar Princípio Ativo</Text>
        </TouchableOpacity>

        {/* Botão de Salvar */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="save" size={18} color="#fff" />
              <Text style={styles.primaryButtonText}>Salvar Produto</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    marginBottom: 16,
    justifyContent: 'center',
  },
  inputText: {
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  pickerGroup: {
    marginBottom: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    padding: 8,
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
});