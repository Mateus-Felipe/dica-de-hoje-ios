import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Text, Animated, StyleSheet} from 'react-native';
import {Notification} from 'react-native-in-app-message';

export default function NotificationView({
    messagingApp,
    lastNotification,
    setUrl,
    setCount,
    width,
    count,
    countInterval,
    counter,
}) {
    useEffect(() => {
        if (count >= 100) {
            setCount(100);
            clearInterval(countInterval);
            messagingApp.current?.hide();
        } else {
            load(count);
        }
    }, [count]);

    const load = counti => {
        Animated.timing(counter, {
            toValue: counti,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    };
    return (
        <Notification
            autohide={false}
            ref={messagingApp}
            hideStatusBar={true}
            customComponent={
                <TouchableOpacity
                    onPress={() => {
                        if (
                            lastNotification.link !==
                                'https://areademembros.dicadehoje7.com' ||
                            lastNotification.link !==
                                'https://areademembros.dicadehoje7.com/'
                        ) {
                            setUrl(lastNotification.link);
                        }
                        messagingApp.current.hide();
                        setCount(100);
                    }}
                    style={styles.containerMessaging}>
                    <Text
                        style={[
                            styles.notificationText,
                            styles.notificationTitle,
                        ]}>
                        {lastNotification.title}
                    </Text>
                    <Text style={styles.notificationText}>
                        {lastNotification.body}
                    </Text>
                    {lastNotification.link &&
                    lastNotification.link.length > 0 ? (
                        <Text style={styles.notificationCall}>
                            Clique para acessar
                        </Text>
                    ) : (
                        <></>
                    )}
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={
                                ([StyleSheet.absoluteFill],
                                {backgroundColor: '#66ae3a', width})
                            }
                        />
                    </View>
                </TouchableOpacity>
            }
        />
    );
}

const styles = StyleSheet.create({
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
});
