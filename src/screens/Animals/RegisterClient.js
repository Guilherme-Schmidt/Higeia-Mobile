import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, Text, StyleSheet } from 'react-native';
import { Button, TextInput, Checkbox, HelperText } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import api from '../../api/api';

const RegisterClient = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [client, setClient] = useState({
    name: '',
    cpf: '',
    address: '',
    number_address: '',
    cep: '',
    city_id: null, // Inicialmente null para forçar seleção
    telephone: '',
    telephone_is_whatsapp: false,
    telephone_is_telegram: false,
  });
  const [errors, setErrors] = useState({});

  // Busca a lista de cidades ao carregar o componente
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await api.get('cities');
        setCities(response.data.items || []);
      } catch (error) {
        console.error('Erro ao buscar cidades:', error);
        Alert.alert('Erro', 'Não foi possível carregar a lista de cidades');
      }
    };
    fetchCities();
  }, []);

  const handleSubmit = async () => {
    // Validação do city_id
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
      
      console.log('Enviando dados:', payload);
      const response = await api.post('reg/client', payload);
      
      console.log('Resposta:', response.data);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro no cadastro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert(
          'Erro', 
          error.response?.data?.message || 
          'Não foi possível conectar ao servidor. Verifique sua conexão.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Campo Nome */}
      <TextInput
        label="Nome Completo"
        value={client.name}
        onChangeText={(text) => setClient({...client, name: text})}
        error={!!errors.name}
        style={styles.input}
        mode="outlined"
      />
      {errors.name && <HelperText type="error" style={styles.errorText}>{errors.name[0]}</HelperText>}

      {/* Campo CPF */}
      <TextInput
        label="CPF"
        value={client.cpf}
        onChangeText={(text) => setClient({...client, cpf: text})}
        keyboardType="numeric"
        error={!!errors.cpf}
        style={styles.input}
        mode="outlined"
      />
      {errors.cpf && <HelperText type="error" style={styles.errorText}>{errors.cpf[0]}</HelperText>}

      {/* Campo Endereço */}
      <TextInput
        label="Endereço"
        value={client.address}
        onChangeText={(text) => setClient({...client, address: text})}
        error={!!errors.address}
        style={styles.input}
        mode="outlined"
      />
      {errors.address && <HelperText type="error" style={styles.errorText}>{errors.address[0]}</HelperText>}

      {/* Campo Número */}
      <TextInput
        label="Número"
        value={client.number_address}
        onChangeText={(text) => setClient({...client, number_address: text})}
        keyboardType="numeric"
        error={!!errors.number_address}
        style={styles.input}
        mode="outlined"
      />
      {errors.number_address && <HelperText type="error" style={styles.errorText}>{errors.number_address[0]}</HelperText>}

      {/* Campo CEP */}
      <TextInput
        label="CEP"
        value={client.cep}
        onChangeText={(text) => setClient({...client, cep: text})}
        keyboardType="numeric"
        error={!!errors.cep}
        style={styles.input}
        mode="outlined"
      />
      {errors.cep && <HelperText type="error" style={styles.errorText}>{errors.cep[0]}</HelperText>}

      {/* Campo Telefone */}
      <TextInput
        label="Telefone"
        value={client.telephone}
        onChangeText={(text) => setClient({...client, telephone: text})}
        keyboardType="phone-pad"
        error={!!errors.telephone}
        style={styles.input}
        mode="outlined"
      />
      {errors.telephone && <HelperText type="error" style={styles.errorText}>{errors.telephone[0]}</HelperText>}

      {/* Seletor de Cidade */}
      <Text style={styles.label}>Cidade *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={client.city_id}
          onValueChange={(value) => setClient({...client, city_id: value})}
          style={styles.picker}
          dropdownIconColor="#666"
        >
          <Picker.Item label="Selecione uma cidade..." value={null} />
          {cities.map(city => (
            <Picker.Item key={city.id} label={city.name} value={city.id} />
          ))}
        </Picker>
      </View>
      {errors.city_id && <HelperText type="error" style={styles.errorText}>{errors.city_id[0]}</HelperText>}

      {/* Checkbox WhatsApp */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={client.telephone_is_whatsapp ? 'checked' : 'unchecked'}
          onPress={() => setClient({...client, telephone_is_whatsapp: !client.telephone_is_whatsapp})}
          color="#6200ee"
        />
        <Text style={styles.checkboxLabel}>Este telefone é WhatsApp</Text>
      </View>

      {/* Checkbox Telegram */}
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={client.telephone_is_telegram ? 'checked' : 'unchecked'}
          onPress={() => setClient({...client, telephone_is_telegram: !client.telephone_is_telegram})}
          color="#6200ee"
        />
        <Text style={styles.checkboxLabel}>Este telefone é Telegram</Text>
      </View>

      {/* Botão de Cadastro */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        Cadastrar Cliente
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: '#fff',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  button: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: '#6200ee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    marginBottom: 10,
  },
});

export default RegisterClient;