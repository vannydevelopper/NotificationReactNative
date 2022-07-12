import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Linking } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import RootNavigator from "./routes/RootNavigator";
import {
       CardStyleInterpolators,
       createStackNavigator,
} from "@react-navigation/stack";
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import { setUserAction } from "./store/actions/userActions";
import { userSelector } from "./store/selectors/userSelector";
import { Host } from "react-native-portalize";
import { setLocaleAction } from "./store/actions/appActions";
import * as Updates from 'expo-updates';
import UpdatingScreen from "./screens/UpdatingScreen";
import * as Notifications from 'expo-notifications';
import * as ExpoLinking from 'expo-linking';

const Stack = createStackNavigator();

export default function AppContainer() {
       const [userLoading, setUserLoading] = useState(true);
       const dispatch = useDispatch();
       useEffect(() => {
              Notifications.setNotificationHandler({
                     handleNotification: async () => ({
                            shouldShowAlert: true,
                            shouldPlaySound: true,
                            shouldSetBadge: true,
                     }),
              });
              (async function () {
                     //await AsyncStorage.removeItem("user");
                     const user = await AsyncStorage.getItem("user");
                     const locale = await AsyncStorage.getItem("locale");
                     dispatch(setLocaleAction(locale || 'fr'))
                     dispatch(setUserAction(JSON.parse(user)));
                     setUserLoading(false);
              })();
       }, []);
       const prefix = ExpoLinking.createURL('/')
       const user = useSelector(userSelector);
       const [isUpdating, setIsUpdating] = useState(false)
       useEffect(() => {
              const timer = setInterval(async () => {
                     try {
                            const updates = await Updates.checkForUpdateAsync()
                            if (updates.isAvailable) {
                                   setIsUpdating(true)
                                   const newUpdates = await Updates.fetchUpdateAsync()
                                   if (newUpdates.isNew) {
                                          await Updates.reloadAsync()
                                   }
                            }
                     } catch (error) {
                            // console.log(error)
                     }
              }, 3000)
              return () => clearInterval(timer)
       }, [])
       if (isUpdating) {
              return <UpdatingScreen />
       }
       if (userLoading) {
              return (
                     <View
                            style={{
                                   flex: 1,
                                   alignContent: "center",
                                   alignItems: "center",
                                   justifyContent: "center",
                            }}
                     >
                            <ActivityIndicator
                                   color="#007BFF"
                                   animating={userLoading}
                                   size="large"
                            />
                     </View>
              );
       }
       return (
              <Host>
                     <NavigationContainer

                            linking={{
                                   prefixes: [prefix],
                                   config: {
                                   },
                                   async getInitialURL() {
                                          // First, you may want to do the default deep link handling
                                          // Check if app was opened from a deep link
                                          const url = await Linking.getInitialURL();

                                          if (url != null) {
                                                 return url;
                                          }

                                          // Handle URL from expo push notifications
                                          const response = await Notifications.getLastNotificationResponseAsync();
                                          const myUrl = response?.notification.request.content.data.url;
                                          return myUrl;
                                   },
                                   subscribe(listener) {
                                          const onReceiveURL = ({ url }) => listener(url);

                                          // Listen to incoming links from deep linking
                                          Linking.addEventListener('url', onReceiveURL);

                                          // Listen to expo push notifications
                                          const subscription = Notifications.addNotificationResponseReceivedListener(response => {
                                                 const data = response.notification.request.content.data

                                                 // Any custom logic to see whether the URL needs to be handled
                                                 //...

                                                 // Let React Navigation handle the URL
                                                 listener(data.url);
                                                 
                                          });


                                          return () => {
                                                 // Clean up the event listeners
                                                 Linking.removeEventListener('url', onReceiveURL);
                                                 subscription.remove();
                                          };
                                   },
                            }}
                            theme={{
                                   colors: {
                                          background: "#E1EAF3",
                                   },
                            }}
                     >
                            {user ? (
                                   <RootNavigator />
                            ) : (
                                   <Stack.Navigator
                                          screenOptions={{
                                                 cardStyleInterpolator:
                                                        CardStyleInterpolators.forFadeFromBottomAndroid,
                                          }}
                                   >
                                          <Stack.Screen
                                                 name="Login"
                                                 component={LoginScreen}
                                                 options={{ headerShown: false }}
                                          />
                                          <Stack.Screen
                                                 name="Register"
                                                 component={RegisterScreen}
                                                 options={{ headerShown: false }}
                                          />
                                   </Stack.Navigator>
                            )}
                     </NavigationContainer>
              </Host>
       );
}
