import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  Linking,
  Modal,
  Button,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Inicio from './src/pages/Inicio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import 'react-native-gesture-handler';
import * as RNIap from 'react-native-iap';
import NotificationView from './src/components/notificationVIew';
import SubsModal from './src/components/SubscriberModal';

export default function App() {
  const [url, setUrl] = useState('');
  const [atualUrl, setAtualUrl] = useState(
    'https://areademembros.dicadehoje7.com/',
  );
  const [product, setProduct] = useState("");
  const [visibleModal, setVisibleModal] = useState(false);
  const [closeButton, setCloseButton] = useState(false)
  const [urlNotification, setUrlNotification] = useState('');
  const [ScreenLoading, setScreenLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  // MODAL DE NOTIFICAÇÃO DENTRO DO APP
  const [lastNotification, setLastNotification] = useState({
    title: '',
    body: '',
    link: '',
  });
  const [count, setCount] = useState(0);
  let counter = useRef(new Animated.Value(0)).current;
  const countInterval = useRef(null);
  let width = counter.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });
  const webViewRef = useRef(null);
  const messagingApp = useRef(null);

  async function localNotification(remoteMessage) {
    width = counter.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
      extrapolate: 'clamp',
    });
    setLastNotification({
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      link: remoteMessage.data.page || '',
    });
    messagingApp.current?.show();
    setCount(0);
    countInterval.current = setInterval(() => setCount(old => old + 1), 1000);
  }

  const load = counti => {
    Animated.timing(counter, {
      toValue: counti,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (count >= 100) {
      setCount(100);
      clearInterval(countInterval);
      messagingApp.current?.hide();
    } else {
      load(count);
    }
  }, [count]);

  function loadingWeb() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }

  async function saveLogin() {
    try {
      await AsyncStorage.setItem(
        '@login',
        'https://areademembros.dicadehoje7.com/',
      );
      setUrl('https://areademembros.dicadehoje7.com/login');
      setUrlNotification(null);
    } catch (e) {
      console.log(e);
    }
  }
  async function saveSignUp() {
    setUrl('https://areademembros.dicadehoje7.com/registro-novo/');
    setUrlNotification(null);
  }

  // Android - botão de voltar
  function backPage() {
    webViewRef.current.goBack();
    return true;
  }

  async function backPageScreen() {
    await AsyncStorage.setItem('@login', '');
    setUrl(null);
    return true;
  }

  useEffect(() => {
    let extensao = /(\.jpg|\.png|\.gif|\.xlsx|\.pdf|\.txt|\.doc|\.docx)$/i;
    setCloseButton(extensao.test(atualUrl.url) ? "archive" : false)
    if (atualUrl.url === undefined || atualUrl.url === null) {
      return;
    } else if (
      atualUrl.url.indexOf('https://areademembros.dicadehoje7.com/login') ===
      0 ||
      atualUrl.url.indexOf(
        'https://areademembros.dicadehoje7.com/registro-novo',
      ) === 0
    ) {
      BackHandler.addEventListener('hardwareBackPress', backPageScreen);
      setCloseButton("login")
    } else if (
      atualUrl.url.indexOf('https://areademembros.dicadehoje7.com') === -1
    ) {
      setUrl('https://areademembros.dicadehoje7.com/');
      setCloseButton(false)
    } else {
      setCloseButton(false)
      BackHandler.addEventListener('hardwareBackPress', backPage);
      if (
        atualUrl.url.indexOf(
          'https://areademembros.dicadehoje7.com/password',
        ) === 0
      ) {
        BackHandler.addEventListener('hardwareBackPress', backPageScreen);
      }
    }
  }, [atualUrl]);

  useEffect(() => {
    async function saveTokenToDatabase(token) {
      let device = DeviceInfo.getUniqueId();
      if (userId && token) {
        await axios.post('https://mobile.app.dicadehoje7.com/api/notification/subscriber',
          {
            device,
            token,
            user_id: userId,
          }
        )
          .then(data => {
            console.log("ADICIONANDO AO DATABASE ", data.data);
          })
          .catch(err => console.log("ADICIONANDO AO DATABASE erro", err));
      }
      // console.log('Token saved to database');
    }
    // Pega o token do dispositivo
    async function notifyMessaging() {
      await messaging()
        .getToken()
        .then(token => {
          return saveTokenToDatabase(token);
        });

      const authStatus = await messaging().requestPermission();
      const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      messaging().onMessage(async remoteMessage => {
        localNotification(remoteMessage);
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
      });

      messaging().onNotificationOpenedApp(async remoteMessage => {
        // NOTIFICAÇÃO RECEBICA QUANDO O APP ESTÁ ABERTO
        // ENVIAR UMA LOCAL NOTIFICATION PARA O USUÁRIO
        setUrl(remoteMessage.data.page);
      });

      messaging()
        .getInitialNotification()
        .then(remoteMessage => {
          if (remoteMessage) {
            // console.log(
            //   'Notification app to open from quit state',
            //  remoteMessage.data,
            //);
            //console.log('initial notification'); // recebo notificação em segundo plano
            setUrl(remoteMessage.data.page);
          }
        });
      // escuta mudanças no token
      return messaging().onTokenRefresh(tokenRefresh => { saveTokenToDatabase(tokenRefresh) });
    }
    notifyMessaging();
    // FIREBASE NOTIFICATION
    async function verificaLogin() {
      setScreenLoading(true);
      const value = await AsyncStorage.getItem('@login');
      if (value === null || value.length === 0) {
        setUrl(null);
        setUrlNotification(null);
      } else {
        if (urlNotification === '' || urlNotification === null) {
          setUrl(value);
          setScreenLoading(false);
        } else {
          setUrl(urlNotification);
          webViewRef.current.reload();
          setScreenLoading(false);
        }
      }
      setScreenLoading(false);
    }
    verificaLogin();
  }, [userId]);

  useEffect(() => {
    // CODIGO IN-APP NÃO FUNCIONAL
    async function getALlProductions() {
      RNIap.initConnection();
    }
    getALlProductions();
    // CODIGO IN-APP NÃO FUNCIONAL
    const begginer = AsyncStorage.getItem("@beginnerSubs");
    messaging().onMessage(async remoteMessage => {
      localNotification(remoteMessage);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <NotificationView
        messagingApp={messagingApp}
        lastNotification={lastNotification}
        setUrl={setUrl}
        width={width}
        count={count}
        countInterval={countInterval}
        counter={counter}
      />
      {!url ? (
        <Inicio login={saveLogin} cadastrar={saveSignUp} />
      ) : (
        <>
          <WebView
            ref={webViewRef}
            //originWhitelist={['https://areademembros.dicadehoje7.com', 'https://std.dicadehoje7.com',
            //  'https://www.youtube.com', 'https://youtube.com', 'https://player.vimeo.com', 'https://www.player.vimeo.com',
            //  'https://dicadehoje7.penserico.com', 'https://www.dicadehoje7.penserico.com','https://core.penserico.com',
            //  'https://penserico.com', 'https://dicadehoje7.penserico.com/dashboard.pr'
            //]}
            onNavigationStateChange={e => {
              let page = e.url;
              setAtualUrl(e);
              console.log('URL: ', e.url);
              if (
                e.url.indexOf(
                  'https://areademembros.dicadehoje7.com/produtos-assinatura',
                ) === 0
              ) {
                setProduct(
                  e.url.replace(
                    'https://areademembros.dicadehoje7.com/produtos-assinatura/?mprod=',
                    '',
                  ),
                );
                setVisibleModal(true);
                webViewRef.current.stopLoading();
                //webViewRef.current.goBack();
              }
            }}
            useWebKit={true}
            allowFileAccess={true}
            allowFileAccessFromFileURLs={true}
            allowingReadAccessToURL={true}
            allowUniversalAccessFromFileURLs={true}
            allowsInlineMediaPlayback={true}
            geolocationEnabled={true}
            javaScriptEnabled={true}
            allowsFullscreenVideo={true}
            cacheEnabled={true}
            onLoadStart={loadingWeb}
            onError={syntheticEvent => {
              console.log(syntheticEvent)
              saveLogin();
            }}
            source={{ uri: url }}
          />
        </>
      )}

      {loading && (
        <View style={styles.LoadingView}>
          <ActivityIndicator color="#131313" size="large" />
        </View>
      )}
      {ScreenLoading && (
        <View style={[styles.LoadingView, { backgroundColor: '#fff' }]}>
          <ActivityIndicator color="#131313" size="large" />
        </View>
      )}
      {
        // botao de fechar para páginas com arquivos de pdf e etc...
        closeButton && (
          <TouchableOpacity onPress={() => {
            closeButton === "login"
              ? setUrl(false)
              : webViewRef.current.goBack()
          }
          } style={styles.closeButton}>
            <Text style={styles.closeText}>Voltar</Text>
          </TouchableOpacity>
        )
      }
      <Modal
        visible={visibleModal}
        animationType="slide"
        transparent={true}>
        <SubsModal
          product={product}
          closeModal={() => setVisibleModal(false)}
        />
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode: 'cover',
  },
  LoadingView: {
    position: 'absolute',
    elevation: 2,
    width: '100%',
    height: '100%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff9',
  },
  containerMessaging: {
    width: '100%',
    backgroundColor: '#fff',
  },
  notificationTitle: {
    marginLeft: 10,
    paddingTop: 10,
    fontWeight: 'bold',
  },
  notificationText: {
    marginLeft: 15,
    textAlign: 'left',
    color: '#000',
  },
  notificationCall: {
    marginLeft: 10,
    textAlign: 'left',
    color: '#66ae3a',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 2,
    marginTop: 10,
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'white',
    borderColor: '#000',
    borderRadius: 5,
  },
  closeButton: {
    width: 70,
    position: "absolute",
    backgroundColor: "#016360",
    justifyContent: "center",
    bottom: 115,
    left: 10,
    padding: 10,
    backgroundColor: "#016360",
    borderRadius: 3,
    zIndex: 2,
    elevation: 2,
  },
  closeText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
  },
});

//! ios pod install: arch -x86_64 pod install