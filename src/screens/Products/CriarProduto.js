// src/screens/Products/CadastrarProduto.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

export default function CriarProduto({ navigation }) {
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricaoProduto, setDescricaoProduto] = useState('');
  const [precoProduto, setPrecoProduto] = useState('');

  const handleCadastrar = () => {
    // Aqui você pode adicionar a lógica para cadastrar o produto (salvar em um banco, etc.)
    if (!nomeProduto || !descricaoProduto || !precoProduto) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    // Para fins de exemplo, vamos exibir um alerta com os dados inseridos
    Alert.alert('Produto Cadastrado', `Nome: ${nomeProduto}\nDescrição: ${descricaoProduto}\nPreço: R$${precoProduto}`);
    
    // Após cadastrar, você pode redirecionar para a tela de Listar Produtos ou outra
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Produto</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome do Produto"
        value={nomeProduto}
        onChangeText={setNomeProduto}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Descrição do Produto"
        value={descricaoProduto}
        onChangeText={setDescricaoProduto}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Preço do Produto"
        keyboardType="numeric"
        value={precoProduto}
        onChangeText={setPrecoProduto}
      />
      
      <Button title="Cadastrar" onPress={handleCadastrar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
});
