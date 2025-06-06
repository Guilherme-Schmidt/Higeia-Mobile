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
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {Picker} from '@react-native-picker/picker';
import api from '../../api/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ProductOutput({navigation}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    animal_id: '',
    withdrawn_by_id: '',
    sector_id: '',
    products: []
  });
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [amount, setAmount] = useState('');
  const [batch, setBatch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      const [employeesRes, sectorsRes, animalsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/pharmacy/product-output/sectors'),
        api.get('/reg/animal'),
      ]);

      setEmployees(employeesRes.data?.items || []);
      setSectors(sectorsRes.data?.items || []);
      setAnimals(animalsRes.data?.items || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários.');
    } finally {
      setLoading(false);
    }
  }

  async function searchProducts(query) {
    if (!query || query.length < 3) return;
    
    try {
      setLoadingProducts(true);
      const response = await api.get(`/pharmacy/products/search?query=${query}`);
      setProducts(response.data?.items || []);
      setShowProductPicker(true);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoadingProducts(false);
    }
  }

  const handleAddProduct = () => {
    if (!selectedProduct || !amount || isNaN(parseInt(amount)) || parseInt(amount) <= 0) {
      Alert.alert('Atenção', 'Selecione um produto e informe uma quantidade válida');
      return;
    }

    if (selectedProduct.batch_active && !batch) {
      Alert.alert('Atenção', 'Este produto possui controle de lotes. Informe o lote.');
      return;
    }

    const newProduct = {
      product_id: selectedProduct.id,
      amount: parseInt(amount),
      unit_id: selectedProduct.unit_id,
      batch: selectedProduct.batch_active ? batch : null,
      product: selectedProduct
    };

    setForm({
      ...form,
      products: [...form.products, newProduct]
    });

    setSelectedProduct(null);
    setAmount('');
    setBatch('');
    setShowProductPicker(false);
  };

  const removeProduct = (index) => {
    Alert.alert(
      'Confirmar',
      'Deseja realmente remover este produto da saída?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            const newProducts = [...form.products];
            newProducts.splice(index, 1);
            setForm({...form, products: newProducts});
          }
        }
      ]
    );
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setForm({...form, date: date.toISOString().split('T')[0]});
    }
  };

  async function handleSave() {
    const requiredFields = [
      {field: 'date', label: 'Data'},
      {field: 'sector_id', label: 'Setor de destino'},
      {field: 'withdrawn_by_id', label: 'Responsável pela retirada'}
    ];

    const missingField = requiredFields.find(f => !form[f.field]);
    if (missingField) {
      Alert.alert('Atenção', `Preencha o campo: ${missingField.label}`);
      return;
    }

    if (form.products.length === 0) {
      Alert.alert('Atenção', 'Adicione pelo menos um produto');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/pharmacy/product-output', form);

      if (response.data?.Error) {
        const errorMessage = response.data.Error_Message 
          ? Object.values(response.data.Error_Message).join('\n') 
          : 'Não foi possível registrar a saída.';
        throw new Error(errorMessage);
      }

      Alert.alert('Sucesso', 'Saída de produtos registrada com sucesso!', [
        {text: 'OK', onPress: () => navigation.goBack()}
      ]);
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert(
        'Erro', 
        error.response?.data?.message || 
        error.message || 
        'Erro ao registrar saída de produtos'
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading && !employees.length) {
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
        <Text style={styles.sectionTitle}>Informações da Saída</Text>
        
        <TouchableOpacity 
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={form.date ? styles.inputText : styles.placeholderText}>
            {form.date || 'Data *'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date(form.date)}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Setor de Destino *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.sector_id}
              onValueChange={(value) => setForm({...form, sector_id: value})}
            >
              <Picker.Item label="Selecione..." value="" />
              {sectors.map(sector => (
                <Picker.Item key={sector.id} label={sector.name} value={sector.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Responsável pela Retirada *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.withdrawn_by_id}
              onValueChange={(value) => setForm({...form, withdrawn_by_id: value})}
            >
              <Picker.Item label="Selecione..." value="" />
              {employees.map(employee => (
                <Picker.Item 
                  key={employee.id} 
                  label={`${employee.person?.name || 'Funcionário'}`} 
                  value={employee.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Animal (Opcional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.animal_id}
              onValueChange={(value) => setForm({...form, animal_id: value})}
            >
              <Picker.Item label="Selecione..." value="" />
              {animals.map(animal => (
                <Picker.Item 
                  key={animal.id} 
                  label={animal.name || `Animal ${animal.id}`} 
                  value={animal.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Produtos</Text>

        <FlatList
          data={form.products}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <View style={styles.listItem}>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.product.name}</Text>
                <Text style={styles.itemDetail}>Quantidade: {item.amount}</Text>
                {item.batch && <Text style={styles.itemDetail}>Lote: {item.batch}</Text>}
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeProduct(index)}
              >
                <Icon name="trash-2" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhum produto adicionado</Text>
          }
        />

        <TextInput
          style={styles.input}
          placeholder="Buscar produto..."
          onChangeText={searchProducts}
        />

        {loadingProducts && <ActivityIndicator size="small" color="#e74c3c" />}

        {showProductPicker && (
          <View style={styles.pickerGroup}>
            <Text style={styles.label}>Selecione o Produto</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedProduct?.id || ''}
                onValueChange={(value) => {
                  const product = products.find(p => p.id === value);
                  setSelectedProduct(product);
                }}
              >
                <Picker.Item label="Selecione..." value="" />
                {products.map(product => (
                  <Picker.Item 
                    key={product.id} 
                    label={`${product.name} (${product.amount} disponíveis)`} 
                    value={product.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {selectedProduct && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Quantidade *"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {selectedProduct.batch_active && (
              <TextInput
                style={styles.input}
                placeholder="Número do Lote *"
                value={batch}
                onChangeText={setBatch}
              />
            )}

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleAddProduct}
            >
              <Icon name="plus" size={18} color="#fff" />
              <Text style={styles.secondaryButtonText}>Adicionar Produto</Text>
            </TouchableOpacity>
          </>
        )}

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
              <Text style={styles.primaryButtonText}>Registrar Saída</Text>
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginVertical: 20,
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