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
} from 'react-native';
import api from '../api/api';
import {Picker} from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';

export default function ProductEntry({navigation}) {
  const [supplier, setSupplier] = useState('');
  const [document, setDocument] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [total, setTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  async function loadDropdownData() {
    try {
      const [productsRes, suppliersRes] = await Promise.all([
        api.get('/pharmacy/product'),
        api.get('/reg/supplier'),
      ]);

      setProducts(productsRes.data.items || []);
      setSuppliers(suppliersRes.data.items || []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
  }

  function addEntry() {
    if (!product || !quantity || !unitPrice) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }
    const totalValue = parseFloat(quantity) * parseFloat(unitPrice);
    setEntries([...entries, {product, quantity, unitPrice, total: totalValue}]);
    setTotal(prevTotal => prevTotal + totalValue);
  }

  async function handleSave() {
    if (!date || !supplier || !document || entries.length === 0) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
      return;
    }

    const payload = {
      date,
      supplier_id: supplier,
      document,
      items: entries,
    };

    try {
      const response = await api.post('/pharmacy/entry', payload);
      if (response.status === 201 || response.status === 200) {
        Alert.alert('Sucesso', 'Entrada de produto cadastrada com sucesso!');
        navigation.navigate('ListProductEntry'); 

      } else {
        Alert.alert(
          'Erro',
          `A API retornou um status inesperado: ${response.status}`,
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Falha ao cadastrar a entrada de produto.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e9bde" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Lançar Entrada de Produto</Text>

        <TouchableOpacity
          onPress={() => setOpen(true)}
          style={styles.dateButton}>
          <Text style={styles.dateText}>
            {date.toISOString().split('T')[0]}
          </Text>
        </TouchableOpacity>

        <DatePicker
          modal
          open={open}
          date={date}
          mode="date"
          locale="pt-BR"
          onConfirm={selectedDate => {
            setOpen(false);
            setDate(selectedDate);
          }}
          onCancel={() => setOpen(false)}
        />

        <Text style={styles.label}>Fornecedor:</Text>
        <Picker
          selectedValue={supplier}
          onValueChange={setSupplier}
          style={styles.picker}>
          <Picker.Item label="Selecione um fornecedor" value="" />
          {suppliers.map(s => (
            <Picker.Item key={s.id} label={s.name} value={s.id} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="DOC/NF"
          value={document}
          onChangeText={setDocument}
        />

        <Text style={styles.label}>Produto:</Text>
        <Picker
          selectedValue={product}
          onValueChange={setProduct}
          style={styles.picker}>
          <Picker.Item label="Selecione um produto" value="" />
          {products.map(p => (
            <Picker.Item key={p.id} label={p.name} value={p.id} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Quantidade"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Valor Unitário"
          value={unitPrice}
          onChangeText={setUnitPrice}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={addEntry}>
          <Text style={styles.buttonText}>+ Adicionar</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f6f9fc', padding: 20},
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {fontSize: 16, fontWeight: 'bold', marginTop: 20},
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {height: 50, backgroundColor: '#fff', marginBottom: 12},
  label: {fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4},
  button: {
    backgroundColor: '#008000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  entryText: {fontSize: 14, color: '#333', marginTop: 5},
});
