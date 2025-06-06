import React, { useState } from 'react';
import { View, Text, Switch, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';

// Configuração básica do axios
import api from './src/api/api'; // Certifique-se de que o caminho está correto
// Import das telas (mantidas iguais)
import LoginScreen from './src/screens/LoginScreen';
import ProductList from './src/screens/Products/ProductList';
import CadastrarProduto from './src/screens/Products/RegisterProduct';
import ProductEntryScreen from './src/screens/ProductEntry';
import ListProductEntry from './src/screens/ListProductEntry';
import DashboardStock from './src/screens/Stock/DashboardStock';
import ListLowStock from './src/screens/Stock/ListLowStock';
import ListAllAnimals from './src/screens/Animals/ListAnimals';
import AppointmentScreen from './src/screens/Appointments/AppointmentScreen';
import RegisterAnimals from './src/screens/Animals/RegisterAnimals';
import RegisterClient from './src/screens/Animals/RegisterClient';
import ListClient from './src/screens/Animals/ListClient';
import HospitalizationsList from './src/screens/Appointments/HospitalizationsList';
import HospitalizationForm from './src/screens/Appointments/HospitalizationForm';
import AnimalHospitalizationHistory from './src/screens/Appointments/AnimalHospitalizationHistory';
import HospitalizationDetailScreen from './src/screens/Appointments/HospitalizationDetailScreen';
import AddHospitalizationRecordScreen from './src/screens/Appointments/AddHospitalizationRecordScreen';
import RecordDetailScreen from './src/screens/Appointments/RecordDetailScreen';
import RegisterProductOutput from './src/screens/Products/RegisterProductOutput';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Constantes de estilo
const ICON_COLOR = '#2196F3';
const ICON_SIZE = 20;
const ACTIVE_BG_COLOR = 'rgba(255, 255, 255, 0.1)';

const DrawerIcon = ({ name, color = ICON_COLOR, size = ICON_SIZE }) => (
  <Icon name={name} size={size} color={color} />
);

// Navigator Farmácia
const ProdutosNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductList" component={ProductList} />
    <Stack.Screen name="CadastrarProduto" component={CadastrarProduto} />
    <Stack.Screen name="EntradaProduto" component={ProductEntryScreen} />
    <Stack.Screen name="ListProductEntry" component={ListProductEntry} />
    <Stack.Screen name="DashboardStock" component={DashboardStock} />
    <Stack.Screen name="ListLowStock" component={ListLowStock} />
    <Stack.Screen name="SaidaProduto" component={RegisterProductOutput} />
  </Stack.Navigator>
);

// Navigator Clínica
const ClinicaNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Appointments" component={AppointmentScreen} />
    <Stack.Screen name="ListAllAnimals" component={ListAllAnimals} />
    <Stack.Screen name="RegisterAnimals" component={RegisterAnimals} />
    <Stack.Screen name="ListClients" component={ListClient} />
    <Stack.Screen name="RegisterClient" component={RegisterClient} />
  </Stack.Navigator>
);

// Navigator Hospitalização
const HospitalizacaoNavigator = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      headerStyle: {
        backgroundColor: '#e74c3c',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }}
  >
    <Stack.Screen 
      name="HospitalizationsList" 
      component={HospitalizationsList} 
      options={{ title: 'Animais Internados' }}
    />
    <Stack.Screen 
      name="HospitalizationForm" 
      component={HospitalizationForm} 
      options={{ title: 'Nova Internação' }}
    />
    <Stack.Screen 
      name="AnimalHospitalizationHistory" 
      component={AnimalHospitalizationHistory} 
      options={({ route }) => ({ 
        title: `Histórico - ${route.params.animalName}` 
      })}
    />
    <Stack.Screen 
      name="HospitalizationDetail" 
      component={HospitalizationDetailScreen} 
      options={({ route }) => ({ 
        title: `Registros - ${route.params.animalName}` 
      })}
    />
    <Stack.Screen 
      name="AddHospitalizationRecord" 
      component={AddHospitalizationRecordScreen} 
      options={{ title: 'Novo Registro Clínico' }}
    />
    <Stack.Screen 
      name="RecordDetail" 
      component={RecordDetailScreen} 
      options={{ title: 'Detalhes do Registro' }}
    />
  </Stack.Navigator>
);

// Conteúdo personalizado do Drawer
const CustomDrawerContent = ({ navigation, ...props }) => {
  const [menuExpandido, setMenuExpandido] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);

  const handleLogout = async () => {
    try {
      setLoadingLogout(true);
      
      // Chamada para a API de logout
      await api.post('/logout');
      
      // Redireciona para a tela de login após logout bem-sucedido
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      Alert.alert('Erro', 'Não foi possível fazer logout. Tente novamente.');
    } finally {
      setLoadingLogout(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert(
      'Sair do Sistema',
      'Deseja realmente sair do aplicativo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: handleLogout,
          style: 'destructive'
        }
      ],
      { cancelable: true }
    );
  };

  // Estilos organizados
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#2c3e50',
    },
    header: {
      padding: 20,
      backgroundColor: '#1a2639',
      borderBottomWidth: 1,
      borderBottomColor: '#34495e',
    },
    appTitle: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    welcomeText: {
      color: '#bdc3c7',
      fontSize: 14,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#34495e',
    },
    toggleText: {
      color: '#fff',
      flex: 1,
      fontSize: 14,
    },
    sectionContainer: {
      marginTop: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sectionTitle: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginLeft: 8,
    },
    menuItem: {
      marginVertical: 2,
      borderRadius: 4,
      paddingLeft: 16,
    },
    logoutContainer: {
      marginTop: 'auto',
      marginBottom: 20,
      borderTopWidth: 1,
      borderTopColor: '#34495e',
      paddingTop: 12,
    },
    labelStyle: {
      color: '#fff',
      fontSize: 14,
    },
    activeLabelStyle: {
      fontWeight: 'bold',
    },
  };

  // Seções do menu
  const menuSections = [
    {
      title: 'Dashboard',
      icon: 'home',
      onPress: () => navigation.navigate('Home'),
      color: '#fff',
    },
    {
      title: 'Farmácia',
      icon: 'pills',
      color: '#3498db',
      items: [
        { label: 'Estoque', icon: 'boxes', screen: 'Produtos', route: 'DashboardStock' },
        { label: 'Produtos', icon: 'pills', screen: 'Produtos', route: 'ProductList' },
        { label: 'Cadastrar Produto', icon: 'plus-circle', screen: 'Produtos', route: 'CadastrarProduto' },
        { label: 'Entrada de Produtos', icon: 'box-open', screen: 'Produtos', route: 'EntradaProduto' },
        { label: 'Saída de Produtos', icon: 'sign-out-alt', screen: 'Produtos', route: 'SaidaProduto' },
      ],
    },
    {
      title: 'Clínica',
      icon: 'clinic-medical',
      color: '#2ecc71',
      items: [
        { label: 'Agendamentos', icon: 'calendar-alt', screen: 'Clínica', route: 'Appointments' },
        { label: 'Todos os Animais', icon: 'paw', screen: 'Clínica', route: 'ListAllAnimals' },
        { label: 'Cadastrar Animal', icon: 'plus-circle', screen: 'Clínica', route: 'RegisterAnimals' },
        { label: 'Clientes', icon: 'users', screen: 'Clínica', route: 'ListClients' },
        { label: 'Cadastrar Cliente', icon: 'user-plus', screen: 'Clínica', route: 'RegisterClient' },
      ],
    },
    {
      title: 'Hospitalização',
      icon: 'procedures',
      color: '#e74c3c',
      items: [
        { label: 'Animais Internados', icon: 'procedures', screen: 'Hospitalizacao', route: 'HospitalizationsList' },
        { label: 'Nova Internação', icon: 'hospital', screen: 'Hospitalizacao', route: 'HospitalizationForm' },
      ],
    },
  ];

  return (
    <DrawerContentScrollView {...props} style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>VetClinic Pro</Text>
        <Text style={styles.welcomeText}>Bem-vindo, Veterinário</Text>
      </View>

      {/* Toggle para expandir/recolher menu */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>Menu Expandido</Text>
        <Switch
          value={menuExpandido}
          onValueChange={setMenuExpandido}
          thumbColor={ICON_COLOR}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>

      {/* Itens do menu */}
      {menuSections.map((section, index) => (
        <View key={index} style={styles.sectionContainer}>
          {section.items ? (
            <>
              <View style={styles.sectionHeader}>
                <DrawerIcon name={section.icon} color={section.color} size={16} />
                <Text style={[styles.sectionTitle, { color: section.color }]}>
                  {section.title}
                </Text>
              </View>
              
              {menuExpandido && section.items.map((item, itemIndex) => (
                <DrawerItem
                  key={itemIndex}
                  label={item.label}
                  labelStyle={styles.labelStyle}
                  icon={() => <DrawerIcon name={item.icon} />}
                  onPress={() => navigation.navigate(item.screen, { screen: item.route })}
                  style={styles.menuItem}
                  activeBackgroundColor={ACTIVE_BG_COLOR}
                />
              ))}
            </>
          ) : (
            <DrawerItem
              label={section.title}
              labelStyle={styles.labelStyle}
              icon={() => <DrawerIcon name={section.icon} color={section.color} />}
              onPress={section.onPress}
              style={styles.menuItem}
              activeBackgroundColor={ACTIVE_BG_COLOR}
            />
          )}
        </View>
      ))}

      {/* Botão de Logout */}
      <View style={styles.logoutContainer}>
        <DrawerItem
          label={loadingLogout ? 'Saindo...' : 'Sair do Sistema'}
          labelStyle={[styles.labelStyle, { color: '#ff6b6b' }]}
          icon={() => loadingLogout ? (
            <ActivityIndicator size="small" color="#ff6b6b" />
          ) : (
            <DrawerIcon name="sign-out-alt" color="#ff6b6b" />
          )}
          onPress={confirmLogout}
          style={styles.menuItem}
          disabled={loadingLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
};

// Drawer principal
const DrawerNavigator = () => (
  <Drawer.Navigator
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      drawerType: 'front',
      drawerStyle: {
        width: 280,
      },
      drawerActiveTintColor: ICON_COLOR,
      drawerInactiveTintColor: '#fff',
      overlayColor: 'transparent',
    }}
  >
    <Drawer.Screen 
      name="Produtos" 
      component={ProdutosNavigator}
      options={{
        drawerIcon: ({ color }) => <DrawerIcon name="pills" color={color} />,
      }}
    />
    <Drawer.Screen 
      name="Clínica" 
      component={ClinicaNavigator}
      options={{
        drawerIcon: ({ color }) => <DrawerIcon name="clinic-medical" color={color} />,
      }}
    />
    <Drawer.Screen 
      name="Hospitalizacao" 
      component={HospitalizacaoNavigator}
      options={{
        drawerIcon: ({ color }) => <DrawerIcon name="procedures" color={color} />,
        title: 'Hospitalização',
      }}
    />
  </Drawer.Navigator>
);

// Navigator principal
const MainNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Home" component={DrawerNavigator} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}