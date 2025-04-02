/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { Badge } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import ListarProdutos from './src/screens/Products/ListarProdutos';
import CadastrarProduto from './src/screens/Products/CriarProduto';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// 📌 Stack Navigator para Produtos
function ProdutosNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListarProdutos" component={ListarProdutos} />
      <Stack.Screen name="CadastrarProduto" component={CadastrarProduto} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props) {
  const [menuExpandido, setMenuExpandido] = useState(true);

  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: '#121212' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', flex: 1 }}>Menu Expandido?</Text>
        <Switch
          value={menuExpandido}
          onValueChange={setMenuExpandido}
          thumbColor="#0f0"
        />
      </View>

      <DrawerItem
        label="Home"
        labelStyle={{ color: '#fff' }}
        icon={() => <Icon name="home" size={20} color="#0f0" />}
        onPress={() => props.navigation.navigate('Home')}
      />

      {/* Seção Farmácia */}
      {menuExpandido && <Text style={{ color: '#fff', marginLeft: 15, marginTop: 10, fontWeight: 'bold' }}>Farmácia</Text>}
      <DrawerItem
        label="Produtos"
        labelStyle={{ color: '#fff' }}
        icon={() => <Icon name="file-medical" size={20} color="#0f0" />}
        onPress={() => props.navigation.navigate('Produtos')}
      />
      <DrawerItem
        label="Entradas / Compras"
        labelStyle={{ color: '#fff' }}
        icon={() => <Icon name="list-alt" size={20} color="#0f0" />}
        onPress={() => {}}
        right={() => <Badge size={20} style={{ backgroundColor: '#0f0' }}>5</Badge>}
      />
      <DrawerItem
        label="Retiradas"
        labelStyle={{ color: '#fff' }}
        icon={() => <Icon name="list" size={20} color="#0f0" />}
        onPress={() => {}}
        right={() => <Badge size={20} style={{ backgroundColor: '#0f0' }}>5</Badge>}
      />
      <DrawerItem
        label="Pedidos"
        labelStyle={{ color: '#fff' }}
        icon={() => <Icon name="clipboard-list" size={20} color="#0f0" />}
        onPress={() => {}}
        right={() => <Badge size={20} style={{ backgroundColor: '#0f0' }}>5</Badge>}
      />

      {/* Seção Clínica */}
      {menuExpandido && <Text style={{ color: '#fff', marginLeft: 15, marginTop: 10, fontWeight: 'bold' }}>Clínica</Text>}
      <DrawerItem
        label="Agendamentos"
        labelStyle={{ color: '#fff' }}
        icon={() => <Icon name="calendar-alt" size={20} color="#0f0" />}
        onPress={() => {}}
      />
    </DrawerContentScrollView>
  );
}

// 📌 Drawer Navigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator drawerContent={(props) => <CustomDrawerContent {...props} />}>
      <Drawer.Screen name="Produtos" component={ProdutosNavigator} />
    </Drawer.Navigator>
  );
}

// 📌 Stack Principal
function MainNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}

// 📌 Aplicação Principal
export default function App() {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}
