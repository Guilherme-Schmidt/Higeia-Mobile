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
} from 'react-native';
import api from '../../api/api';
import {Picker} from '@react-native-picker/picker';

export default function CriarProduto({navigation}) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [barCode, setBarCode] = useState('');
  const [controlled, setControlled] = useState(false);
  const [productCategory, setProductCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [laboratory, setLaboratory] = useState('');
  const [productUse, setProductUse] = useState('');
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [laboratories, setLaboratories] = useState([]);
  const [productUses, setProductUses] = useState([]);

  useEffect(() => {
    loadDropdownData();
  }, []);

  async function loadDropdownData() {
    try {
      const [categoriesRes, unitsRes, labsRes, usesRes] = await Promise.all([
        api.get('/pharmacy/products/category'),
        api.get('/pharmacy/products/unit'),
        api.get('/pharmacy/products/laboratory'),
        api.get('/pharmacy/products/use'),
      ]);

      setCategories(Array.isArray(categoriesRes.data.items) ? categoriesRes.data.items : []);
      setUnits(Array.isArray(unitsRes.data.items) ? unitsRes.data.items : []);
      setLaboratories(Array.isArray(labsRes.data.items) ? labsRes.data.items : []);
      setProductUses(Array.isArray(usesRes.data.items) ? usesRes.data.items : []);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    }
  }

  async function handleSave() {
    if (!name || !amount || !barCode || !productCategory || !unit || !laboratory || !productUse) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios.');
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
      active_principle: [
        {name: 'cortisol'},
        {name: 'cortisol 3'},
      ],
    };

    try {
      const response = await api.post('/pharmacy/product', payload);

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Sucesso', 'Produto cadastrado com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', `A API retornou um status inesperado: ${response.status}`);
      }
    } catch (error) {
      Alert.alert(
        'Erro',
        `Falha ao cadastrar: ${error.response ? JSON.stringify(error.response.data) : error.message}`,
      );
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#4e9bde" barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Cadastrar Produto</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Quantidade"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Código de barras"
          value={barCode}
          onChangeText={setBarCode}
        />

        <Text style={styles.label}>Categoria:</Text>
        <Picker selectedValue={productCategory} onValueChange={setProductCategory} style={styles.picker}>
          <Picker.Item label="Selecione uma categoria" value="" />
          {categories.map(cat => <Picker.Item key={cat.id} label={cat.name} value={cat.id} />)}
        </Picker>

        <Text style={styles.label}>Unidade:</Text>
        <Picker selectedValue={unit} onValueChange={setUnit} style={styles.picker}>
          <Picker.Item label="Selecione uma unidade" value="" />
          {units.map(u => <Picker.Item key={u.id} label={u.name} value={u.id} />)}
        </Picker>

        <Text style={styles.label}>Laboratório:</Text>
        <Picker selectedValue={laboratory} onValueChange={setLaboratory} style={styles.picker}>
          <Picker.Item label="Selecione um laboratório" value="" />
          {laboratories.map(lab => <Picker.Item key={lab.id} label={lab.name} value={lab.id} />)}
        </Picker>

        <Text style={styles.label}>Uso do Produto:</Text>
        <Picker selectedValue={productUse} onValueChange={setProductUse} style={styles.picker}>
          <Picker.Item label="Selecione um uso" value="" />
          {productUses.map(use => <Picker.Item key={use.id} label={use.name} value={use.id} />)}
        </Picker>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Controlado:</Text>
          <Switch value={controlled} onValueChange={setControlled} />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvar</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderColor:'#000000',
    borderWidth: 13,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    marginTop: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#008000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
