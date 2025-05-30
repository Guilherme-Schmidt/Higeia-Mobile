import React, { useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Badge } from 'react-native-paper';

// Telas existentes
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

// Telas de hospitalização
import HospitalizationsList from './src/screens/Appointments/HospitalizationsList';
import HospitalizationForm from './src/screens/Appointments/HospitalizationForm';
import AnimalHospitalizationHistory from './src/screens/Appointments/AnimalHospitalizationHistory';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const ICON_COLOR = '#2196F3'; // Azul mais profissional
const ICON_SIZE = 20;
const HEADER_STYLE = { color: '#fff', fontWeight: 'bold' };

const DrawerIcon = name => (
  <Icon name={name} size={ICON_SIZE} color={ICON_COLOR} />
);

// Navegador de Farmácia
const ProdutosNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProductList" component={ProductList} />
    <Stack.Screen name="CadastrarProduto" component={CadastrarProduto} />
    <Stack.Screen name="EntradaProduto" component={ProductEntryScreen} />
    <Stack.Screen name="ListProductEntry" component={ListProductEntry} />
    <Stack.Screen name="DashboardStock" component={DashboardStock} />
    <Stack.Screen name="ListLowStock" component={ListLowStock} />
  </Stack.Navigator>
);

// Navegador de Clínica
const ClinicaNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Appointments" component={AppointmentScreen} />
    <Stack.Screen name="ListAllAnimals" component={ListAllAnimals} />
    <Stack.Screen name="RegisterAnimals" component={RegisterAnimals} />
    <Stack.Screen name="ListClients" component={ListClient} />
    <Stack.Screen name="RegisterClient" component={RegisterClient} />
  </Stack.Navigator>
);

// Navegador de Hospitalização
const HospitalizacaoNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HospitalizationsList" component={HospitalizationsList} />
    <Stack.Screen name="HospitalizationForm" component={HospitalizationForm} />
    <Stack.Screen name="AnimalHospitalizationHistory" component={AnimalHospitalizationHistory} />
  </Stack.Navigator>
);

// Conteúdo personalizado do Drawer
const CustomDrawerContent = props => {
  const [menuExpandido, setMenuExpandido] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do sistema?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Sair', 
          onPress: () => {
            props.navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#2c3e50' }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#34495e' }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>VetClinic</Text>
        <Text style={{ color: '#bdc3c7', fontSize: 14 }}>Bem-vindo, Veterinário</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 15 }}>
        <Text style={{ ...HEADER_STYLE, flex: 1 }}>Menu Expandido</Text>
        <Switch
          value={menuExpandido}
          onValueChange={setMenuExpandido}
          thumbColor={ICON_COLOR}
        />
      </View>

      <DrawerItem
        label="Dashboard"
        labelStyle={{ color: '#fff' }}
        icon={() => DrawerIcon('home')}
        onPress={() => props.navigation.navigate('Home')}
      />

      {/* Seção Farmácia */}
      <Text style={{ ...HEADER_STYLE, marginLeft: 15, marginTop: 10, color: '#3498db' }}>Farmácia</Text>
      {menuExpandido && (
        <>
          <DrawerItem
            label="Estoque"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('boxes')}
            onPress={() => props.navigation.navigate('Produtos', { screen: 'DashboardStock' })}
          />
          <DrawerItem
            label="Produtos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('pills')}
            onPress={() => props.navigation.navigate('Produtos', { screen: 'ProductList' })}
          />
          <DrawerItem
            label="Cadastrar Produto"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('plus-circle')}
            onPress={() => props.navigation.navigate('Produtos', { screen: 'CadastrarProduto' })}
          />
          <DrawerItem
            label="Entrada de Produtos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('box-open')}
            onPress={() => props.navigation.navigate('Produtos', { screen: 'EntradaProduto' })}
          />
        </>
      )}

      {/* Seção Clínica */}
      <Text style={{ ...HEADER_STYLE, marginLeft: 15, marginTop: 10, color: '#2ecc71' }}>Clínica</Text>
      {menuExpandido && (
        <>
          <DrawerItem
            label="Agendamentos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('calendar-alt')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'Appointments' })}
          />
          <DrawerItem
            label="Todos os Animais"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('paw')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'ListAllAnimals' })}
          />
          <DrawerItem
            label="Cadastrar Animal"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('plus-circle')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'RegisterAnimals' })}
          />
          <DrawerItem
            label="Clientes"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('users')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'ListClients' })}
          />
          <DrawerItem
            label="Cadastrar Cliente"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('user-plus')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'RegisterClient' })}
          />
        </>
      )}

      {/* Seção Hospitalização */}
      <Text style={{ ...HEADER_STYLE, marginLeft: 15, marginTop: 10, color: '#e74c3c' }}>Hospitalização</Text>
      {menuExpandido && (
        <>
          <DrawerItem
            label="Animais Internados"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('procedures')}
            onPress={() => props.navigation.navigate('Hospitalizacao', { screen: 'HospitalizationsList' })}
          />
          <DrawerItem
            label="Nova Internação"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('hospital')}
            onPress={() => props.navigation.navigate('Hospitalizacao', { screen: 'HospitalizationForm' })}
          />
        </>
      )}

      {/* Botão de Logout */}
      <View style={{ marginTop: 'auto', marginBottom: 20 }}>
        <DrawerItem
          label="Sair"
          labelStyle={{ color: '#ff4444', fontWeight: 'bold' }}
          icon={() => <Icon name="sign-out-alt" size={ICON_SIZE} color="#ff4444" />}
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
};

// Navegador Drawer principal
const DrawerNavigator = () => (
  <Drawer.Navigator 
    drawerContent={props => <CustomDrawerContent {...props} />}
    screenOptions={{
      drawerStyle: {
        width: 280,
      },
      drawerActiveTintColor: ICON_COLOR,
      drawerInactiveTintColor: '#fff',
    }}
  >
    <Drawer.Screen 
      name="Produtos" 
      component={ProdutosNavigator}
      options={{
        drawerIcon: ({ color }) => DrawerIcon('pills'),
      }}
    />
    <Drawer.Screen 
      name="Clínica" 
      component={ClinicaNavigator}
      options={{
        drawerIcon: ({ color }) => DrawerIcon('clinic-medical'),
      }}
    />
    <Drawer.Screen 
      name="Hospitalizacao" 
      component={HospitalizacaoNavigator}
      options={{
        drawerIcon: ({ color }) => DrawerIcon('procedures'),
        title: 'Hospitalização',
      }}
    />
  </Drawer.Navigator>
);

// Navegador principal
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