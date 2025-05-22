/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Badge } from 'react-native-paper';

// Importando as telas
import LoginScreen from './src/screens/LoginScreen';
import ListarProdutos from './src/screens/Products/ListarProdutos';
import CadastrarProduto from './src/screens/Products/CriarProduto';
import ProductEntryScreen from './src/screens/ProductEntry';
import ListProductEntry from './src/screens/ListProductEntry';
import DashboardStock from './src/screens/Stock/DashboardStock';
import ListLowStock from './src/screens/Stock/ListLowStock';
import ListHospitalizedAnimals from './src/screens/Animals/ListHospitalizedAnimals';
import ListAllAnimals from './src/screens/Animals/ListAnimals';
import AppointmentScreen from './src/screens/Appointments/AppointmentScreen';
import NovoAgendamentoScreen from './src/screens/Appointments/NovoAgendamentoScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const ICON_COLOR = '#0f0';
const ICON_SIZE = 20;
const HEADER_STYLE = { color: '#fff', fontWeight: 'bold' };

const DrawerIcon = name => (
  <Icon name={name} size={ICON_SIZE} color={ICON_COLOR} />
);

const ProdutosNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListarProdutos" component={ListarProdutos} />
    <Stack.Screen name="CadastrarProduto" component={CadastrarProduto} />
    <Stack.Screen name="EntradaProduto" component={ProductEntryScreen} />
    <Stack.Screen name="ListProductEntry" component={ListProductEntry} />
    <Stack.Screen name="DashboardStock" component={DashboardStock} />
    <Stack.Screen name="ListLowStock" component={ListLowStock} />
  </Stack.Navigator>
);

const ClinicaNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Appointments" component={AppointmentScreen} />
    <Stack.Screen name="Novo Agendamento" component={NovoAgendamentoScreen} />
    <Stack.Screen name="ListHospitalizedAnimals" component={ListHospitalizedAnimals} />
    <Stack.Screen name="ListAllAnimals" component={ListAllAnimals} />
  </Stack.Navigator>
);

const CustomDrawerContent = props => {
  const [menuExpandido, setMenuExpandido] = useState(true);

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#121212' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <Text style={{ ...HEADER_STYLE, flex: 1 }}>Menu Expandido?</Text>
        <Switch
          value={menuExpandido}
          onValueChange={setMenuExpandido}
          thumbColor={ICON_COLOR}
        />
      </View>

      <DrawerItem
        label="Home"
        labelStyle={{ color: '#fff' }}
        icon={() => DrawerIcon('home')}
        onPress={() => props.navigation.navigate('Home')}
      />

      <Text style={{ ...HEADER_STYLE, marginLeft: 15, marginTop: 10 }}>Farmácia</Text>
      {menuExpandido && (
        <>
          <DrawerItem
            label="Estoque"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('file-medical')}
            onPress={() => props.navigation.navigate('Produtos', { screen: 'DashboardStock' })}
          />
          <DrawerItem
            label="Produtos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('file-medical')}
            onPress={() => props.navigation.navigate('Produtos', { screen: 'ListarProdutos' })}
          />
          <DrawerItem
            label="Criar Produtos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('list-alt')}
            onPress={() => props.navigation.navigate('Criar Produto')}
            right={() => <Badge size={20} style={{ backgroundColor: ICON_COLOR }}>5</Badge>}
          />
          <DrawerItem
            label="Entrada de Produtos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('box')}
            onPress={() => props.navigation.navigate('Entrada Produto')}
          />
          <DrawerItem
            label="Retiradas"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('list')}
            onPress={() => alert('Tela de retiradas ainda não implementada')}
            right={() => <Badge size={20} style={{ backgroundColor: ICON_COLOR }}>5</Badge>}
          />
          <DrawerItem
            label="Pedidos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('clipboard-list')}
            onPress={() => alert('Tela de pedidos ainda não implementada')}
            right={() => <Badge size={20} style={{ backgroundColor: ICON_COLOR }}>5</Badge>}
          />
        </>
      )}

      <Text style={{ ...HEADER_STYLE, marginLeft: 15, marginTop: 10 }}>Clínica</Text>
      {menuExpandido && (
        <>
          <DrawerItem
            label="Agendamentos"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('calendar-alt')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'Appointments' })}
          />
          <DrawerItem
            label="Internações"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('hospital')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'ListHospitalizedAnimals' })}
          />
          <DrawerItem
            label="Todos os Animais"
            labelStyle={{ color: '#fff' }}
            icon={() => DrawerIcon('paw')}
            onPress={() => props.navigation.navigate('Clínica', { screen: 'ListAllAnimals' })}
          />
        </>
      )}
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => (
  <Drawer.Navigator drawerContent={props => <CustomDrawerContent {...props} />}>
    <Drawer.Screen name="Produtos" component={ProdutosNavigator} />
    <Drawer.Screen name="Criar Produto" component={CadastrarProduto} />
    <Drawer.Screen name="Entrada Produto" component={ProductEntryScreen} />
    <Drawer.Screen name="Clínica" component={ClinicaNavigator} />
  </Drawer.Navigator>
);

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
