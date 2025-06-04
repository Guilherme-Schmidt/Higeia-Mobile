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
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import api from '../../api/api';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterProductOutput({navigation}) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    animal_id: '',
    withdrawn_by_id: '',
    sector_id: '',
    total: '',
    products: []
  });
  const [newProduct, setNewProduct] = useState({
    product_id: '',
    amount: ''
  });
  const [dropdownData, setDropdownData] = useState({
    animals: [],
    employees: [],
    sectors: [],
    products: []
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
      const [animalsRes, employeesRes, sectorsRes, productsRes] = await Promise.all([
        api.get('/reg/animal'),
        api.get('/reg/employee'),
        api.get('/pharmacy/product-output/sectors'),
        api.get('/pharmacy/product')
      ]);

      setDropdownData({
        animals: animalsRes.data?.items || [],
        employees: employeesRes.data?.items || [],
        sectors: sectorsRes.data?.items || [],
        products: productsRes.data?.items || []
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.product_id || !newProduct.amount) {
      Alert.alert('Atenção', 'Selecione um produto e informe a quantidade');
      return;
    }
    
    const selectedProduct = dropdownData.products.find(p => p.id === newProduct.product_id);
    
    const product = {
      product_id: newProduct.product_id,
      product_name: selectedProduct.name,
      amount: parseInt(newProduct.amount),
      unit: selectedProduct.unit?.name || 'un'
    };
    
    setForm({
      ...form,
      products: [...form.products, product],
      total: (parseFloat(form.total || 0) + (parseInt(newProduct.amount) * (selectedProduct.price || 0)).toString()
    )});
    
    setNewProduct({
      product_id: '',
      amount: ''
    });
  };

  const removeProduct = (index) => {
    const updatedProducts = [...form.products];
    const removedProduct = updatedProducts.splice(index, 1)[0];
    
    // Atualizar o total
    const selectedProduct = dropdownData.products.find(p => p.id === removedProduct.product_id);
    const newTotal = parseFloat(form.total) - (parseInt(removedProduct.amount) * (selectedProduct.price || 0));
    
    setForm({
      ...form,
      products: updatedProducts,
      total: newTotal > 0 ? newTotal.toString() : ''
    });
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      setForm({...form, date: date.toISOString().split('T')[0]});
    }
  };

  async function handleSave() {
    const requiredFields = [
      {field: 'sector_id', label: 'Setor de destino'},
      {field: 'withdrawn_by_id', label: 'Responsável pela retirada'},
      {field: 'products', label: 'Produtos'}
    ];

    const missingField = requiredFields.find(f => {
      if (f.field === 'products') return form.products.length === 0;
      return !form[f.field];
    });
    
    if (missingField) {
      Alert.alert('Atenção', `Preencha o campo: ${missingField.label}`);
      return;
    }

    const payload = {
      ...form,
      products: form.products.map(p => ({
        product_id: p.product_id,
        amount: p.amount
      }))
    };

    try {
      setLoading(true);
      const response = await api.post('/pharmacy/product-output', payload);

      if (response.data?.Error === "Not create") {
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

  if (loading && dropdownData.sectors.length === 0) {
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
        <Text style={styles.headerTitle}>Registro de Saída de Produtos</Text>

        {/* Informações da Saída */}
        <Text style={styles.sectionTitle}>Informações da Saída</Text>
        
        <TouchableOpacity 
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={form.date ? styles.inputText : styles.placeholderText}>
            {form.date || 'Data da saída *'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
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
              <Picker.Item label="Selecione o setor..." value="" />
              {dropdownData.sectors.map(sector => (
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
              <Picker.Item label="Selecione o responsável..." value="" />
              {dropdownData.employees.map(emp => (
                <Picker.Item 
                  key={emp.id} 
                  label={`${emp.person?.name} (${emp.role})`} 
                  value={emp.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.pickerGroup}>
          <Text style={styles.label}>Animal (opcional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.animal_id}
              onValueChange={(value) => setForm({...form, animal_id: value})}
            >
              <Picker.Item label="Selecione o animal..." value="" />
              {dropdownData.animals.map(animal => (
                <Picker.Item 
                  key={animal.id} 
                  label={`${animal.name} (${animal.species})`} 
                  value={animal.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        {/* Produtos */}
        <Text style={styles.sectionTitle}>Produtos</Text>
        
        {form.products.map((product, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{product.product_name}</Text>
              <Text style={styles.itemDetail}>
                {product.amount} {product.unit}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeProduct(index)}
            >
              <Icon name="trash-2" size={18} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.row}>
          <View style={[styles.pickerGroup, {flex: 1, marginRight: 10}]}>
            <Text style={styles.label}>Produto *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newProduct.product_id}
                onValueChange={(value) => setNewProduct({...newProduct, product_id: value})}
              >
                <Picker.Item label="Selecione o produto..." value="" />
                {dropdownData.products.map(product => (
                  <Picker.Item 
                    key={product.id} 
                    label={`${product.name} (${product.unit?.name || 'un'})`} 
                    value={product.id} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={[styles.inputGroup, {flex: 1}]}>
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              placeholder="Qtd"
              value={newProduct.amount}
              onChangeText={(text) => setNewProduct({...newProduct, amount: text})}
              keyboardType="numeric"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleAddProduct}
        >
          <Icon name="plus" size={18} color="#fff" />
          <Text style={styles.secondaryButtonText}>Adicionar Produto</Text>
        </TouchableOpacity>

        {/* Total */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>R$ {parseFloat(form.total || 0).toFixed(2)}</Text>
        </View>

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
  inputGroup: {
    marginBottom: 16,
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
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
});