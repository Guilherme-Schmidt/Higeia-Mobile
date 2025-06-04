import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
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

      const [lowCountRes, highCountRes, countRes] = await Promise.all([
        api.get('/pharmacy/stock/low-count'),
        api.get('/pharmacy/stock/high-count'),
        api.get('/pharmacy/stock/count'),
      ]);

      const lowData = Array.isArray(lowCountRes.data) ? lowCountRes.data[0] : {};
      const estoqueBaixo = parseInt(lowData.low_count || 0, 10);
      const foraEstoque = parseInt(lowData.out_count || 0, 10);
      const abaixoMedia = estoqueBaixo - foraEstoque;

      setDados({
        estoque_baixo: estoqueBaixo,
        abaixo_media: abaixoMedia,
        fora_estoque: foraEstoque,
        estoque_alto: parseInt(highCountRes.data || 0, 10),
        total_itens: parseInt(countRes.data || 0, 10),
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#e74c3c" barStyle="light-content" />
      
      {/* Estoque Baixo */}
      <View style={[styles.card, styles.lowStockCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>Estoque Baixo</Text>
          <Text style={styles.badge}>{dados.estoque_baixo} itens ↓</Text>
        </View>
        <Text style={styles.details}>• {dados.abaixo_media} abaixo da média</Text>
        <Text style={styles.details}>• {dados.fora_estoque} fora de estoque</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ListLowStock')}>
          <Icon name="eye" size={16} color="#fff" />
          <Text style={styles.buttonText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>

      {/* Estoque Alto */}
      <View style={[styles.card, styles.highStockCard]}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>Estoque Alto</Text>
          <Text style={styles.badgeGreen}>{dados.estoque_alto} itens ↑</Text>
        </View>
        <Text style={styles.details}>• Acima da média</Text>
      </View>

      {/* Total de Itens */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title}>Total de Itens</Text>
          <Text style={styles.badgeNeutral}>{dados.total_itens} itens</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  highStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#e74c3c',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  badgeGreen: {
    backgroundColor: '#2ecc71',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  badgeNeutral: {
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 6,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
});