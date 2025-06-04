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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../api/api';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProductEntry({navigation}) {
  const [form, setForm] = useState({
    supplier: '',
    document: '',
    product: '',
    quantity: '',
    unitPrice: '',
  });
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [dropdownData, setDropdownData] = useState({
    products: [],
    suppliers: []
  });
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  async function loadDropdownData() {
    try {
      setLoading(true);
      const [productsRes, suppliersRes] = await Promise.all([
        api.get('/pharmacy/product'),
        api.get('/reg/supplier'),
      ]);

      setDropdownData({
        products: productsRes.data.items || [],
        suppliers: suppliersRes.data.items || []
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddEntry = () => {
    const requiredFields = ['product', 'quantity', 'unitPrice'];
    const missingField = requiredFields.find(field => !form[field]);
    
    if (missingField) {
      Alert.alert('Atenção', 'Preencha todos os campos do produto');
      return;
    }

    const entryTotal = parseFloat(form.quantity) * parseFloat(form.unitPrice);
    const newEntry = {
      product: form.product,
      quantity: form.quantity,
      unitPrice: form.unitPrice,
      total: entryTotal
    };

    setEntries([...entries, newEntry]);
    setTotal(prevTotal => prevTotal + entryTotal);
    setForm({
      ...form,
      product: '',
      quantity: '',
      unitPrice: ''
    });
  };

  const removeEntry = (index) => {
    const updatedEntries = [...entries];
    const removedEntry = updatedEntries.splice(index, 1)[0];
    setEntries(updatedEntries);
    setTotal(prevTotal => prevTotal - removedEntry.total);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  async function handleSave() {
    const requiredFields = ['supplier', 'document'];
    const missingField = requiredFields.find(field => !form[field]);
    
    if (missingField) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (entries.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto');
      return;
    }

    const payload = {
      date,
      supplier_id: form.supplier,
      document: form.document,
      items: entries,
    };

    try {
      setLoading(true);
      const response = await api.post('/pharmacy/entry', payload);
      
      if (response.status === 200 || response.status === 201) {
        Alert.alert('Sucesso', 'Entrada registrada com sucesso!', [
          {text: 'OK', onPress: () => navigation.navigate('ListProductEntry')}
        ]);
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      Alert.alert(
        'Erro', 
        error.response?.data?.message || 
        'Falha ao registrar a entrada de produto'
      );
    } finally {
      setLoading(false);
    }
  }

  const handleFormChange = (field, value) => {
    setForm({...form, [field]: value});
  };

  if (loading && dropdownData.products.length === 0) {
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
        <Text style={styles.headerTitle}>Lançar Entrada de Produto</Text>

        {/* Seção de Dados da Entrada */}
        <Text style={styles.sectionTitle}>Dados da Entrada</Text>
        
        {/* DatePicker Padronizado */}
        <Text style={styles.label}>Data de Entrada *</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="calendar" size={18} color="#555" />
          <Text style={styles.dateText}>
            {date.toLocaleDateString('pt-BR')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            locale="pt-BR"
            themeVariant="light"
            textColor="#333"
          />
        )}

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Fornecedor *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.supplier}
              onValueChange={(value) => handleFormChange('supplier', value)}>
              <Picker.Item label="Selecione um fornecedor" value="" />
              {dropdownData.suppliers.map(s => (
                <Picker.Item key={s.id} label={s.name} value={s.id} />
              ))}
            </Picker>
          </View>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Número do Documento *"
          value={form.document}
          onChangeText={(text) => handleFormChange('document', text)}
        />

        {/* Seção de Produtos */}
        <Text style={styles.sectionTitle}>Produtos</Text>
        
        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Produto *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.product}
              onValueChange={(value) => handleFormChange('product', value)}>
              <Picker.Item label="Selecione um produto" value="" />
              {dropdownData.products.map(p => (
                <Picker.Item key={p.id} label={p.name} value={p.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={form.quantity}
              onChangeText={(text) => handleFormChange('quantity', text)}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputGroup, {flex: 1}]}>
            <Text style={styles.label}>Valor Unitário *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={form.unitPrice}
              onChangeText={(text) => handleFormChange('unitPrice', text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddEntry}
        >
          <Icon name="plus" size={18} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar Produto</Text>
        </TouchableOpacity>

        {/* Lista de Produtos Adicionados */}
        {entries.map((entry, index) => (
          <View key={index} style={styles.entryItem}>
            <View style={styles.entryContent}>
              <Text style={styles.entryProduct}>
                {dropdownData.products.find(p => p.id === entry.product)?.name || 'Produto'}
              </Text>
              <View style={styles.entryDetails}>
                <Text style={styles.entryDetail}>{entry.quantity} un</Text>
                <Text style={styles.entryDetail}>R$ {parseFloat(entry.unitPrice).toFixed(2)}</Text>
                <Text style={styles.entryTotal}>R$ {entry.total.toFixed(2)}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeEntry(index)}
            >
              <Icon name="trash-2" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Total */}
        {entries.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        )}

        {/* Botão Salvar */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading || entries.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="save" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Salvar Entrada</Text>
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
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
    marginBottom: 16,
  },
  dateText: {
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
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
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  entryItem: {
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
  entryContent: {
    flex: 1,
  },
  entryProduct: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  entryDetails: {
    flexDirection: 'row',
  },
  entryDetail: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  entryTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  removeButton: {
    padding: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  saveButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});