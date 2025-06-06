import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
  Animated,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SearchablePicker = ({
  items = [],
  selectedValue,
  onValueChange,
  placeholder = "Selecione...",
  label,
  displayProperty = 'name',
  keyExtractor = 'id',
  style,
  loading = false,
  onSearch,
  searchMinLength = 3,
  dropdownMaxHeight = 300,
  showAmount = true
}) => {
  const [search, setSearch] = useState('');
  const [showList, setShowList] = useState(false);
  const [filteredItems, setFilteredItems] = useState(items);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const dropdownHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  // Filtra os itens localmente ou faz busca na API
  useEffect(() => {
    if (search.length >= searchMinLength && onSearch) {
      onSearch(search);
    } else {
      setFilteredItems(
        items.filter(item =>
          String(item[displayProperty]).toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, items]);

  // Animação para abrir/fechar o dropdown
  useEffect(() => {
    if (showList) {
      inputRef.current?.focus();
      Animated.timing(dropdownHeight, {
        toValue: Math.min(dropdownMaxHeight, filteredItems.length * 50 + 60),
        duration: 200,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
    }
  }, [showList, filteredItems]);

  // Monitora teclado para ajustar posição
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSelectItem = (value) => {
    onValueChange(value);
    setShowList(false);
    setSearch('');
    Keyboard.dismiss();
  };

  const selectedItemLabel = selectedValue
    ? items.find(item => item[keyExtractor] === selectedValue)?.[displayProperty]
    : placeholder;

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={[styles.container, style]}>
        {label && <Text style={styles.label}>{label}</Text>}
        
        <TouchableOpacity 
          style={styles.selectedValueContainer}
          onPress={() => {
            setShowList(!showList);
            setSearch('');
          }}
          activeOpacity={0.8}
        >
          <Text 
            style={[
              styles.selectedValueText,
              !selectedValue && styles.placeholderText
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedItemLabel}
          </Text>
          <Icon 
            name={showList ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#666" 
          />
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.dropdownContainer,
            { 
              height: dropdownHeight,
              bottom: isKeyboardVisible ? SCREEN_HEIGHT * 0.3 : undefined,
              zIndex: 999 // Garante que fique acima de outros elementos
            }
          ]}
        >
          <View style={styles.searchContainer}>
            <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Digite para buscar..."
              placeholderTextColor="#999"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {loading && (
              <ActivityIndicator 
                size="small" 
                color="#999" 
                style={styles.loadingIndicator} 
              />
            )}
          </View>
          
          <FlatList
            data={filteredItems}
            keyExtractor={item => String(item[keyExtractor])}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.itemContainer,
                  selectedValue === item[keyExtractor] && styles.selectedItem
                ]}
                onPress={() => handleSelectItem(item[keyExtractor])}
                activeOpacity={0.7}
              >
                <Text style={styles.itemText}>{item[displayProperty]}</Text>
                {showAmount && item.amount !== undefined && (
                  <Text style={styles.itemDetail}>Estoque: {item.amount}</Text>
                )}
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="always"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="search" size={24} color="#ccc" />
                <Text style={styles.emptyText}>
                  {search.length >= searchMinLength 
                    ? 'Nenhum resultado encontrado' 
                    : `Digite ${searchMinLength} ou mais caracteres`}
                </Text>
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  selectedValueContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  selectedValueText: {
    color: '#333',
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 10,
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  selectedItem: {
    backgroundColor: '#f0f7ff',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
});

export default SearchablePicker;