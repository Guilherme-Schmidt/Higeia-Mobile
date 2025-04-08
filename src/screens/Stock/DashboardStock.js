import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import api from '../../api/api';

export default function DashboardEstoque() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState({
    estoque_baixo: 0,
    abaixo_media: 0,
    fora_estoque: 0,
    estoque_alto: 0,
    total_itens: 0,
  });

  const carregarDados = async () => {
    try {
      setLoading(true);

      const [lowCountRes, highCountRes, countRes, lowListRes] =
        await Promise.all([
          api.get('/pharmacy/stock/low-count'),
          api.get('/pharmacy/stock/high-count'),
          api.get('/pharmacy/stock/count'),
          api.get('/pharmacy/stock/low-list'),
        ]);

      const lowData = Array.isArray(lowCountRes.data)
        ? lowCountRes.data[0]
        : {};
      const estoqueBaixo = parseInt(lowData.low_count || 0, 10);
      const foraEstoque = parseInt(lowData.out_count || 0, 10);
      const abaixoMedia = estoqueBaixo - foraEstoque;

      const estoqueAlto = parseInt(highCountRes.data || 0, 10);
      const totalItens = parseInt(countRes.data || 0, 10);

      setDados({
        estoque_baixo: estoqueBaixo,
        abaixo_media: abaixoMedia,
        fora_estoque: foraEstoque,
        estoque_alto: estoqueAlto,
        total_itens: totalItens,
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0f0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Estoque Baixo */}
      <View style={styles.card}>
        <Text style={styles.title}>Estoque Baixo</Text>
        <Text style={styles.valor}>{dados.estoque_baixo} itens ↓</Text>
        <Text style={styles.info}>{dados.abaixo_media} abaixo da média</Text>
        <Text style={styles.info}>{dados.fora_estoque} fora de estoque</Text>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => navigation.navigate('ListLowStock')}>
          <Icon name="eye" size={16} color="#fff" />
          <Text style={styles.botaoTexto}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>

      {/* Estoque Alto */}
      <View style={styles.card}>
        <Text style={styles.title}>Estoque Alto</Text>
        <Text style={styles.valor}>{dados.estoque_alto} itens ↑</Text>
        <Text style={styles.info}>acima da média</Text>
      </View>

      {/* Total de Itens */}
      <View style={styles.card}>
        <Text style={styles.title}>Total de Itens</Text>
        <Text style={styles.valor}>{dados.total_itens} itens ▒▒▒</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f1f3f9',
    flex: 1,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  valor: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  info: {
    color: '#ccc',
    marginTop: 5,
  },
  botao: {
    marginTop: 10,
    backgroundColor: '#28a745',
    padding: 10,
    flexDirection: 'row',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
