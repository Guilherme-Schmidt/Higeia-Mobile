import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RegisterProductOutput = () => {
  // Estados principais
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [animals, setAnimals] = useState([]);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    animal_id: null,
    withdrawn_by_id: null,
    total: 0,
  });
  
  // Estados para busca e seleção
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productAmount, setProductAmount] = useState('');

  // Carrega dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Carrega produtos
        const productsRes = await api.get('/pharmacy/product');
        setProducts(productsRes.data.items || []);
  
        
        // Carrega funcionários
        const employeesRes = await api.get('/reg/employee');
        setEmployees(employeesRes.data.items || []);
        
        // // Carrega animais (se aplicável)
         const response = await api.get('/reg/animal');
        setAnimals(response.data.items || response.data || []);
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados iniciais');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Adiciona produto à lista de selecionados
  const handleAddProduct = () => {
    if (!currentProduct || !productAmount || isNaN(productAmount) || Number(productAmount) <= 0) {
      Alert.alert('Atenção', 'Selecione um produto e informe uma quantidade válida');
      return;
    }

    const newProduct = {
      product_id: currentProduct.id,
      amount: Number(productAmount),
      product: currentProduct, // Mantemos a referência para exibição
    };

    setSelectedProducts([...selectedProducts, newProduct]);
    setCurrentProduct(null);
    setProductAmount('');
    setShowProductModal(false);
  };

  // Remove produto da lista
  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.product_id !== productId));
  };

  // Submete o formulário
  const handleSubmit = async () => {
    if (!formData.withdrawn_by_id || selectedProducts.length === 0) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios e adicione pelo menos um produto');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        products: selectedProducts.map(p => ({
          product_id: p.product_id,
          amount: p.amount,
          // Adicione outros campos necessários como unit_id, batch, etc.
        })),
      };

      const response = await api.post('/pharmacy/product-output', payload);
      
      if (response.data.status === 'success') {
        Alert.alert('Sucesso', 'Saída de produtos registrada com sucesso');
        // Limpa o formulário após sucesso
        setSelectedProducts([]);
        setFormData({
          ...formData,
          animal_id: null,
          total: 0,
        });
      } else {
        throw new Error(response.data.message || 'Erro ao registrar saída');
      }
    } catch (error) {
      console.error('Erro ao registrar saída:', error);
      Alert.alert('Erro', 'Não foi possível registrar a saída de produtos');
    } finally {
      setLoading(false);
    }
  };

  // Renderização do item do produto
  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productItem}
      onPress={() => {
        setCurrentProduct(item);
        setShowProductModal(true);
      }}
    >
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productStock}>Estoque: {item.amount}</Text>
    </TouchableOpacity>
  );

  // Renderização do produto selecionado
  const renderSelectedProduct = (product) => (
    <View style={styles.selectedProductItem} key={product.product_id}>
      <View style={styles.selectedProductInfo}>
        <Text style={styles.selectedProductName}>{product.product.name}</Text>
        <Text style={styles.selectedProductAmount}>Quantidade: {product.amount}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveProduct(product.product_id)}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Registro de Saída de Produtos</Text>
        
        {/* Formulário principal */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(text) => setFormData({...formData, date: text})}
            placeholder="Data da saída"
          />
        </View>


        <View style={styles.formGroup}>
          <Text style={styles.label}>Responsável pela Retirada*</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.withdrawn_by_id}
              onValueChange={(value) => setFormData({...formData, withdrawn_by_id: value})}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um funcionário..." value={null} />
              {employees.map(employee => (
                <Picker.Item 
                  key={employee.id} 
                  label={`${employee.name}`} 
                  value={employee.id} 
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Animal (opcional)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.animal_id}
              onValueChange={(value) => setFormData({...formData, animal_id: value})}
              style={styles.picker}
            >
              <Picker.Item label="Selecione um animal..." value={null} />
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

        {/* Lista de produtos selecionados */}
        <Text style={styles.sectionTitle}>Produtos para Saída</Text>
        {selectedProducts.length > 0 ? (
          <View style={styles.selectedProductsContainer}>
            {selectedProducts.map(renderSelectedProduct)}
          </View>
        ) : (
          <Text style={styles.emptyText}>Nenhum produto selecionado</Text>
        )}

        {/* Botão para adicionar produtos */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowProductModal(true)}
        >
          <Text style={styles.addButtonText}>Adicionar Produtos</Text>
        </TouchableOpacity>

        {/* Botão de submeter */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Registrar Saída</Text>
          )}
        </TouchableOpacity>

        {/* Modal de seleção de produtos */}
        <Modal
          visible={showProductModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowProductModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Produto</Text>
              <TouchableOpacity onPress={() => setShowProductModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Buscar produto..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />

            <FlatList
              data={products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProductItem}
              contentContainerStyle={styles.productList}
            />

            {currentProduct && (
              <View style={styles.productForm}>
                <Text style={styles.selectedProductText}>
                  Selecionado: {currentProduct.name}
                </Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Quantidade"
                  value={productAmount}
                  onChangeText={setProductAmount}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleAddProduct}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  selectedProductsContainer: {
    marginBottom: 16,
  },
  selectedProductItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  selectedProductAmount: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  removeButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginVertical: 16,
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  productList: {
    paddingBottom: 16,
  },
  productItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  productStock: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  productForm: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  selectedProductText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  amountInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterProductOutput;