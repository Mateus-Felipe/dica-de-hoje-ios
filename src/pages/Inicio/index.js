import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';

export default function Inicio({login, cadastrar}) {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ececec" />
      <Image
        style={styles.logoImage}
        resizeMode="contain"
        source={require('../../assets/images/logo.png')}
      />
      <Text style={styles.title}>Área de membros Dica de Hoje</Text>
      <TouchableOpacity style={styles.btn} activeOpacity={0.6} onPress={login}>
        <Text style={styles.textBtn}>Já tenho uma conta</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btn}
        activeOpacity={0.6}
        onPress={cadastrar}>
        <Text style={styles.textBtn}>Não tenho uma conta</Text>
      </TouchableOpacity>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ececec',
  },
  logoImage: {
    width: '40%',
    height: '15%',
  },
  title: {
    fontSize: 20,
    color: '#3c3c3c',
    fontWeight: '700',
    marginBottom: 30,
    marginTop: 30,
  },
  btn: {
    marginBottom: 28,
    backgroundColor: '#246f6a',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 5,
  },
  textBtn: {
    color: '#ececec',
    textTransform: 'uppercase',
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
