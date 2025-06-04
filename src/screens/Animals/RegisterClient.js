import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { Button, TextInput, Checkbox, Text, HelperText } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import api from '../../api/api';

const RegisterClient = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [client, setClient] = useState({
    name: '',
    cpf: '',
    address: '',
    number_address: '',
    cep: '',
    city_id: null,
    telephone: '',
    telephone_is_whatsapp: false,
    telephone_is_telegram: false,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get('cities');
        setCities(response.data.items || []);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível carregar a lista de cidades');
        console.error('Erro ao buscar cidades:', error);
      }
    };
    fetchCities();
  }, []);

  const handleSubmit = async () => {
    if (!client.city_id) {
      Alert.alert('Atenção', 'Selecione uma cidade');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...client,
        telephone_is_whatsapp: client.telephone_is_whatsapp ? 1 : 0,
        telephone_is_telegram: client.telephone_is_telegram ? 1 : 0
      };
      
      await api.post('reg/client', payload);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert('Erro', error.response?.data?.message || 'Erro ao cadastrar cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      

      {/* Formulário */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dados Pessoais</Text>

        {/* Nome */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo *</Text>
          <TextInput
            value={client.name}
            onChangeText={(text) => setClient({...client, name: text})}
            error={!!errors.name}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor="#e74c3c"
            left={<TextInput.Icon name="account" color="#555" />}
          />
          {errors.name && <HelperText type="error" style={styles.errorText}>{errors.name[0]}</HelperText>}
        </View>

        {/* CPF */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CPF *</Text>
          <TextInput
            value={client.cpf}
            onChangeText={(text) => setClient({...client, cpf: text})}
            keyboardType="numeric"
            error={!!errors.cpf}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor="#e74c3c"
            left={<TextInput.Icon name="card-account-details" color="#555" />}
          />
          {errors.cpf && <HelperText type="error" style={styles.errorText}>{errors.cpf[0]}</HelperText>}
        </View>

        {/* Telefone */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Telefone *</Text>
          <TextInput
            value={client.telephone}
            onChangeText={(text) => setClient({...client, telephone: text})}
            keyboardType="phone-pad"
            error={!!errors.telephone}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor="#e74c3c"
            left={<TextInput.Icon name="phone" color="#555" />}
          />
          {errors.telephone && <HelperText type="error" style={styles.errorText}>{errors.telephone[0]}</HelperText>}
        </View>

        <View style={styles.checkboxRow}>
          <Checkbox.Android
            status={client.telephone_is_whatsapp ? 'checked' : 'unchecked'}
            onPress={() => setClient({...client, telephone_is_whatsapp: !client.telephone_is_whatsapp})}
            color="#e74c3c"
          />
          <Text style={styles.checkboxLabel}>WhatsApp</Text>

          <Checkbox.Android
            status={client.telephone_is_telegram ? 'checked' : 'unchecked'}
            onPress={() => setClient({...client, telephone_is_telegram: !client.telephone_is_telegram})}
            color="#e74c3c"
            style={{ marginLeft: 20 }}
          />
          <Text style={styles.checkboxLabel}>Telegram</Text>
        </View>

        <Text style={styles.sectionTitle}>Endereço</Text>

        {/* CEP */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>CEP</Text>
          <TextInput
            value={client.cep}
            onChangeText={(text) => setClient({...client, cep: text})}
            keyboardType="numeric"
            error={!!errors.cep}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor="#e74c3c"
            left={<TextInput.Icon name="map-marker" color="#555" />}
          />
          {errors.cep && <HelperText type="error" style={styles.errorText}>{errors.cep[0]}</HelperText>}
        </View>

        {/* Endereço */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Endereço</Text>
          <TextInput
            value={client.address}
            onChangeText={(text) => setClient({...client, address: text})}
            error={!!errors.address}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor="#e74c3c"
            left={<TextInput.Icon name="home" color="#555" />}
          />
          {errors.address && <HelperText type="error" style={styles.errorText}>{errors.address[0]}</HelperText>}
        </View>

        {/* Número */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Número</Text>
          <TextInput
            value={client.number_address}
            onChangeText={(text) => setClient({...client, number_address: text})}
            keyboardType="numeric"
            error={!!errors.number_address}
            style={styles.input}
            mode="outlined"
            outlineColor="#ddd"
            activeOutlineColor="#e74c3c"
            left={<TextInput.Icon name="numeric" color="#555" />}
          />
          {errors.number_address && <HelperText type="error" style={styles.errorText}>{errors.number_address[0]}</HelperText>}
        </View>

        {/* Cidade */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Cidade *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={client.city_id}
              onValueChange={(value) => setClient({...client, city_id: value})}
              style={styles.picker}
              dropdownIconColor="#555"
            >
              <Picker.Item label="Selecione uma cidade..." value={null} />
              {cities.map(city => (
                <Picker.Item key={city.id} label={city.name} value={city.id} />
              ))}
            </Picker>
          </View>
          {errors.city_id && <HelperText type="error" style={styles.errorText}>{errors.city_id[0]}</HelperText>}
        </View>
      </View>

      {/* Botão de Cadastro */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
        labelStyle={styles.submitButtonText}
        icon="content-save"
      >
        {loading ? 'Salvando...' : 'Cadastrar Cliente'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#e74c3c',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    height: 50,
    marginHorizontal: 16,
    marginTop: 8,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegisterClient;