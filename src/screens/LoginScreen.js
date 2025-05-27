import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Importando o ícone de pata

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://10.0.2.2:8000/api/login', {
        email,
        password,
      });
      const { access_token } = response.data;
      await AsyncStorage.setItem('access_token', access_token);
      navigation.replace('Home');
    } catch (error) {
      setLoading(false);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Erro: ${error.response.data.message || 'Falha na autenticação'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        alert('Erro de rede. Tente novamente mais tarde.');
      } else {
        console.error('General error:', error.message);
        alert('Ocorreu um erro inesperado. Tente novamente.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Ícone de pata adicionado aqui */}
        <Icon name="paw" size={50} color="#4CAF50" style={styles.pawIcon} />
        
        <Text style={styles.title}>IFC Login</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Senha"
          secureTextEntry
          style={styles.input}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" style={{ marginVertical: 20 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    alignItems: 'center',
  },
  pawIcon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#4CAF50',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  buttonText: {
    
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoginScreen;