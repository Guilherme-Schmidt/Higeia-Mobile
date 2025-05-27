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
import api from '../../api/api';
import {Picker} from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterProduct({navigation}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [barCode, setBarCode] = useState('');
  const [controlled, setControlled] = useState(false);
  const [productCategory, setProductCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [laboratory, setLaboratory] = useState('');
  const [productUse, setProductUse] = useState('');
  const [batches, setBatches] = useState([]);
  const [activePrinciples, setActivePrinciples] = useState([]);
  const [newActivePrincipleName, setNewActivePrincipleName] = useState('');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [newBatchValidity, setNewBatchValidity] = useState('');
  const [newBatchEntryTotal, setNewBatchEntryTotal] = useState('');
  const [newBatchOutputTotal, setNewBatchOutputTotal] = useState('');

  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [productUses, setProductUses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Estados para o date picker
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

      setCategories(categoriesRes.data?.items || []);
      setUnits(unitsRes.data?.items || []);
      setLaboratories(labsRes.data?.items || []);
      setProductUses(usesRes.data?.items || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados necessários.');
    } finally {
      setLoading(false);
    }
  }

  const handleAddBatch = () => {
    if (!newBatchNumber || !newBatchValidity || !newBatchEntryTotal) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios do lote (Número, Validade, Entrada Total)');
      return;
    }
    
    const newBatch = {
      batch: newBatchNumber,
      validity: newBatchValidity,
      product_id: 0,
      entry_total: parseInt(newBatchEntryTotal),
      output_total: parseInt(newBatchOutputTotal || '0'),
      amount_total: parseInt(newBatchEntryTotal) - parseInt(newBatchOutputTotal || '0'),
    };
    
    setBatches([...batches, newBatch]);
    setNewBatchNumber('');
    setNewBatchValidity('');
    setNewBatchEntryTotal('');
    setNewBatchOutputTotal('');
  };

  const handleAddActivePrinciple = () => {
    if (!newActivePrincipleName.trim()) {
      Alert.alert('Atenção', 'O nome do princípio ativo não pode estar vazio.');
      return;
    }
    setActivePrinciples([...activePrinciples, { name: newActivePrincipleName.trim() }]);
    setNewActivePrincipleName('');
  };

  const removeBatch = (index) => {
    const newBatches = [...batches];
    newBatches.splice(index, 1);
    setBatches(newBatches);
  };

  const removeActivePrinciple = (index) => {
    const newPrinciples = [...activePrinciples];
    newPrinciples.splice(index, 1);
    setActivePrinciples(newPrinciples);
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setNewBatchValidity(formattedDate);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  async function handleSave() {
    if (!name || !amount || !barCode || !productCategory || !unit || !laboratory || !productUse) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    const payload = {
      name,
      product_category_id: productCategory,
      amount: parseInt(amount),
      unit_id: unit,
      product_use_id: productUse,
      controlled: controlled ? 1 : 0,
      laboratory_id: laboratory,
      bar_code: barCode,
      batch_active: batches.length > 0,
      batchs: batches,
      active_principle: activePrinciples,
    };

    try {
      setLoading(true);
      const response = await api.post('/pharmacy/product', payload);

      if (response.data && response.data.Error === "Not create") {
        let errorMessage = 'Não foi possível cadastrar o produto.';
        if (response.data.Error_Message) {
          errorMessage = Object.values(response.data.Error_Message).join('\n');
        }
        Alert.alert('Erro', errorMessage);
      } else if (response.status >= 200 && response.status < 300) {
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!', [
          {text: 'OK', onPress: () => navigation.goBack()}
        ]);
      } else {
        throw new Error(`Status HTTP inesperado: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      let errorMessage = 'Erro ao cadastrar produto';
      
      if (error.response) {
        if (error.response.status === 205) {
          errorMessage = 'Dados inválidos. Verifique as informações.';
        } else {
          errorMessage = error.response.data?.message || 
                        `Erro ${error.response.status}: ${JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        errorMessage = 'Sem resposta do servidor. Verifique sua conexão.';
      } else {
        errorMessage = error.message || 'Erro desconhecido ao processar a requisição.';
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (loading && categories.length === 0 && units.length === 0 && laboratories.length === 0 && productUses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#008000" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e9bde" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastrar Produto</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do produto *"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <TextInput
          style={styles.input}
          placeholder="Quantidade *"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Código de barras *"
          value={barCode}
          onChangeText={setBarCode}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Categoria *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={productCategory}
            onValueChange={setProductCategory}
            style={styles.picker}
          >
            <Picker.Item label="Selecione uma categoria" value="" />
            {categories.map(cat => (
              <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Unidade *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={unit}
            onValueChange={setUnit}
            style={styles.picker}
          >
            <Picker.Item label="Selecione uma unidade" value="" />
            {units.map(u => (
              <Picker.Item key={u.id} label={u.name} value={u.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Laboratório *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={laboratory}
            onValueChange={setLaboratory}
            style={styles.picker}
          >
            <Picker.Item label="Selecione um laboratório" value="" />
            {laboratories.map(lab => (
              <Picker.Item key={lab.id} label={lab.name} value={lab.id} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Uso do Produto *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={productUse}
            onValueChange={setProductUse}
            style={styles.picker}
          >
            <Picker.Item label="Selecione um uso" value="" />
            {productUses.map(use => (
              <Picker.Item key={use.id} label={use.name} value={use.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Controlado:</Text>
          <Switch
            value={controlled}
            onValueChange={setControlled}
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={controlled ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <Text style={styles.sectionTitle}>Lotes</Text>
        {batches.map((batch, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>
              Lote: {batch.batch}, Validade: {batch.validity}, Total: {batch.amount_total}
            </Text>
            <TouchableOpacity onPress={() => removeBatch(index)}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={styles.input}
          placeholder="Número do Lote"
          value={newBatchNumber}
          onChangeText={setNewBatchNumber}
          keyboardType="numeric"
        />
        
        <TouchableOpacity onPress={showDatepicker} style={styles.input}>
          <Text style={newBatchValidity ? {} : {color: '#999'}}>
            {newBatchValidity || 'Selecione a validade (AAAA-MM-DD)'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Entrada Total"
          value={newBatchEntryTotal}
          onChangeText={setNewBatchEntryTotal}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Saída Total (Opcional)"
          value={newBatchOutputTotal}
          onChangeText={setNewBatchOutputTotal}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddBatch}>
          <Text style={styles.buttonText}>Adicionar Lote</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Princípios Ativos</Text>
        {activePrinciples.map((ap, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>{ap.name}</Text>
            <TouchableOpacity onPress={() => removeActivePrinciple(index)}>
              <Text style={styles.removeText}>Remover</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TextInput
          style={styles.input}
          placeholder="Nome do Princípio Ativo"
          value={newActivePrincipleName}
          onChangeText={setNewActivePrincipleName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddActivePrinciple}>
          <Text style={styles.buttonText}>Adicionar Princípio Ativo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar Produto</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    justifyContent: 'center',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  button: {
    backgroundColor: '#008000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
  },
  addButton: {
    backgroundColor: '#4e9bde',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 25,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#4e9bde',
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeText: {
    color: 'red',
    marginLeft: 10,
  },
});