import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Platform
} from 'react-native';
import axios from 'axios';
import * as RNIap from 'react-native-iap';

export default function SubsModal({ product, closeModal }) {
    const [loading, setLoading] = useState(true);
    const [listProducts, setListProducts] = useState([]);

    async function BuyProduct() {
        const productIds = Platform.select({
            ios: [
                'com.dicadehoje.carteiraplena'
            ],
            android: [
                'com.example.coins100'
            ]
        });
        console.log('chamou!');
        RNIap.initConnection();
        // const result = await RNIap.getProducts(['com.dicadehoje.carteiraplena']);
        // console.log(result);
        try {
            await RNIap.requestSubscription('com.dicadehoje.carteiraplena');
        } catch (err) {
            console.warn(err);
        }
    }

    useEffect(() => {
        async function GetProducts() {
            await axios
                .get(
                    'https://areademembros.dicadehoje7.com/wp-json/wp/v2/produto',
                )
                .then(response => {
                    let responseData = response.data;
                    responseData.map(content => {
                        let newData = {
                            id: content.id,
                            title: content.title.rendered,
                            desc: content.acf.resumo,
                            price_year: content.acf.vlr_anual,
                            price_month: content.acf.vlr_mensal,
                        };
                        setListProducts(prevState => [...prevState, newData]);
                    });
                    setLoading(false);
                });
        }
        GetProducts();
    }, []);
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#000" barStyle="default" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => closeModal()}>
                    <Text style={styles.headerIcon}>{'<'}</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Planos</Text>
                <Text style={styles.headerTitle} />
            </View>
            {!loading ? (
                <FlatList
                    data={listProducts}
                    keyExtractor={item => item.id}
                    style={{ marginTop: 90 }}
                    ListHeaderComponent={() => (
                        <View style={styles.listHeader}>
                            <Text style={[styles.title, { fontSize: 25 }]}>
                                Adicione este plano ao seu portfólio
                            </Text>
                        </View>
                    )}
                    renderItem={AtualItem => {
                        let item = AtualItem.item;
                        if (item.id.toString() === product) {
                            return (
                                <View key={item.id} style={styles.flatListView}>
                                    <Text style={styles.title}>
                                        {item.title}
                                    </Text>
                                    <Text style={styles.copyText}>
                                        {item.desc}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.CTA}
                                        onPress={BuyProduct}>
                                        <Text style={styles.textButton}>
                                            Assinar
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        } else {
                            return <></>;
                        }
                    }}
                />
            ) : (
                <ActivityIndicator color="" size="large" />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#016360',
        padding: 10,
    },
    header: {
        position: 'absolute',
        flexDirection: 'row',
        alignContent: 'flex-start',
        justifyContent: 'space-between',
        alignItems: 'center',
        top: 40,
        paddingHorizontal: 10,
        height: 50,
        width: '100%',
        borderBottomWidth: 0.5,
        borderBottomColor: '#2f2f2f',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerIcon: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#fff',
    },
    title: {
        fontSize: 25,
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    listHeader: {
        width: '100%',
        marginBottom: 30,
    },
    CTA: {
        width: '90%',
        marginVertical: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    textButton: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 18,
    },
    copyText: {
        color: '#fff',
        fontSize: 16,
    },
    flatListView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    separator: {
        borderBottomColor: 'rgba(0, 0, 0, 0.2)',
        borderBottomWidth: 1,
    },
});
