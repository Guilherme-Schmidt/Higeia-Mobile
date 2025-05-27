import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Button, TextInput, Checkbox, HelperText } from 'react-native-paper';
import api from '../../api/api';

const RegisterClient = ({ navigation, route }) => {
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState({
    name: '',
    cpf: '',
    address: '',
    number_address: '',
    cep: '',
    telephone: '',
    telephone_is_whatsapp: false,
    telephone_is_telegram: false,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('reg/client', client);
      Alert.alert('Sucesso', 'Cliente cadastrado com sucesso!');
      navigation.goBack();
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o cliente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      {/* ... (mantenha os outros campos do formulário) ... */}
      
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 20 }}
      >
        Cadastrar Cliente
      </Button>
    </ScrollView>
  );
};

export default RegisterClient;