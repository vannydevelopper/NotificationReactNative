import { Alert, Button, CloseIcon, FormControl, HStack, Icon, IconButton, Input, VStack, WarningOutlineIcon } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Image, ImageBackground, ScrollView, StyleSheet, Text, useWindowDimensions, View, TouchableNativeFeedback, BackHandler, TouchableOpacity, Platform } from 'react-native'
import { MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { color } from 'react-native/Libraries/Components/View/ReactNativeStyleAttributes';
import fetchApi from '../../helpers/fetchApi';
import { setUserAction } from "../../store/actions/userActions";
import { useDispatch } from "react-redux";
import * as Location from 'expo-location'
import { FormattedMessage, useIntl } from 'react-intl'
import { setLocaleAction } from '../../store/actions/appActions';
import registerPushNotification from '../../helpers/registerPushNotification';


export default function LoginScreen() {
          const [email, setEmail] = useState("");
          const [password, setPassword] = useState("");
          const { width, height } = useWindowDimensions()
          const [showPassword, setShowPassword] = useState(false)
          const navigation = useNavigation()
          const [loading, setLoading] = useState(false);
          const [location, setLocation] = useState(null)
          const [errors, setErrors] = useState(null);
          const dispatch = useDispatch();
          const intl = useIntl()
          const [showLocalesModal, setShowLocalModal] = useState(false)

          const handleLogin = async () => {
                    setLoading(true);
                    const token = await registerPushNotification()
                    if(!location) {
                              let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                              if (locationStatus !== 'granted') {
                                        return setLoading(false)
                              }
                              var loc = await Location.getCurrentPositionAsync({});
                              setLocation(loc)
                    }
                    const user = {
                              email,
                              password,
                              lat: location?.coords?.latitude,
                              long: location?.coords?.longitude,
                              PUSH_NOTIFICATION_TOKEN: token?.data,
                              DEVICE: Platform.OS === 'ios' ? 1 : 0
                    };
                    setErrors(null)
                    try {
                              const userData = await fetchApi("/users/login", {
                                        method: "POST",
                                        body: JSON.stringify(user),
                                        headers: { "Content-Type": "application/json" },
                              });
                              await AsyncStorage.setItem("user", JSON.stringify(userData));
                              dispatch(setUserAction(userData));
                    } catch (error) {
                              console.log(error)
                              setErrors(error.errors)
                    }
                    setLoading(false);
          }

          const onLocaleSelect = async (locale) => {
                    await AsyncStorage.setItem('locale', locale)
                    dispatch(setLocaleAction(locale))
                    setShowLocalModal(false)
          }

          const askLocationPermission = async () => {
                    let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                    if (locationStatus !== 'granted') {
                              console.log('Permission to access location was denied');
                              setLocation(false)
                              return;
                    }
                    var location = await Location.getCurrentPositionAsync({});
                    setLocation(location)
          }

          useEffect(() => {
                    askLocationPermission()
          }, [])


          if (location === false) {
                    return <View style={{ alignContent: 'center', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 16, opacity: 0.8 }}>
                                        { intl.formatMessage({ id: 'app.location.noLocation' })}
                              </Text>
                              <Text style={{ textAlign: 'center', color: '#777', marginTop: 10, paddingHorizontal: 10 }}>
                                        { intl.formatMessage({ id: 'app.location.needLocation' })}
                              </Text>
                              <TouchableNativeFeedback
                                        background={TouchableNativeFeedback.Ripple('#ddd')}
                                        useForeground={true}
                                        onPress={() => askLocationPermission()}
                              >
                                        <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 10, marginTop: 20 }}>
                                                  <Text>
                                                            { intl.formatMessage({ id: 'app.location.grantAccess' })}
                                                  </Text>
                                        </View>
                              </TouchableNativeFeedback>
                    </View>

          }

          const LocalesModal = () => {
                    useEffect(() => {
                              const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                                        setShowLocalModal(false)
                                        return true
                              })
                              return () => {
                                        backHandler.remove()
                              }
                    }, [])
                    return (

                              <View style={styles.modalContainer}>
                                        <View style={{ ...styles.modalContent }}>
                                                  <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20 }}>
                                                            <Text style={{ fontWeight: 'bold' }}>{ intl.formatMessage({ id: 'auth.login.selectLocale' })}</Text>
                                                  </View>
                                                  <View>
                                                            <TouchableNativeFeedback onPress={() => onLocaleSelect('bi')}>
                                                                      <View style={{ ...styles.reponseItem, borderTopColor: '#f5f2f2' }}>
                                                                                {intl.locale == 'bi' ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#071E43" /> :
                                                                                          <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text numberOfLines={2} style={styles.reponseText}>Kirundi</Text>
                                                                      </View>
                                                            </TouchableNativeFeedback>
                                                            <TouchableNativeFeedback onPress={() => onLocaleSelect('fr')}>
                                                                      <View style={{ ...styles.reponseItem, borderTopColor: '#f5f2f2' }}>
                                                                                {intl.locale == 'fr' ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#071E43" /> :
                                                                                          <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text numberOfLines={2} style={styles.reponseText}>Français</Text>
                                                                      </View>
                                                            </TouchableNativeFeedback>
                                                            <TouchableNativeFeedback onPress={() => onLocaleSelect('en')}>
                                                                      <View style={{ ...styles.reponseItem, borderTopColor: '#f5f2f2' }}>
                                                                                {intl.locale == 'en' ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#071E43" /> :
                                                                                          <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text numberOfLines={2} style={styles.reponseText}>English</Text>
                                                                      </View>
                                                            </TouchableNativeFeedback>
                                                            <TouchableNativeFeedback onPress={() => onLocaleSelect('sw')}>
                                                                      <View style={{ ...styles.reponseItem, borderTopColor: '#f5f2f2' }}>
                                                                                {intl.locale == 'sw' ? <MaterialCommunityIcons name="radiobox-marked" size={24} color="#071E43" /> :
                                                                                          <MaterialCommunityIcons name="radiobox-blank" size={24} color="#777" />}
                                                                                <Text numberOfLines={2} style={styles.reponseText}>Kiswahili</Text>
                                                                      </View>
                                                            </TouchableNativeFeedback>
                                                  </View>
                                        </View>
                              </View>
                    )
          }

          const getLocaleLabel = () => {
                    if (intl.locale == 'bi') {
                              return 'Kirundi'
                    }
                    if (intl.locale == 'en') {
                              return 'English'
                    }
                    if (intl.locale == 'sw') {
                        return 'Kiswahili'
                    }
                    return 'Français'
          }

          return (
                    <>
                              { showLocalesModal && <LocalesModal /> }
                              <ImageBackground style={styles.container} source={require('../../../assets/images/Bg.png')}>
                                        <TouchableOpacity onPress={() => setShowLocalModal(true)} style={styles.langButton}>
                                                  <Ionicons name="language" size={22} color="#fff" />
                                                  <Text style={styles.langText}>{getLocaleLabel()}</Text>
                                        </TouchableOpacity>
                                        <ScrollView keyboardShouldPersistTaps="handled">
                                                  <View style={{ flex: 1, minHeight: height - 34 }}>
                                                            <View style={styles.header}>
                                                                      <View style={styles.appImage}>
                                                                                <Image source={require('../../../assets/icon.png')} style={{ width: "90%", height: "90%", marginBottom: 5 }} />
                                                                      </View>
                                                                      <Text style={styles.appName}>
                                                                                { intl.formatMessage({ id: 'auth.login.titleLogin' })}
                                                                      </Text>
                                                                      <Text style={styles.bottomTitle}>
                                                                                { intl.formatMessage({ id: 'auth.login.title' })}
                                                                      </Text>
                                                            </View>
                                                            {errors?.main && <Alert w="85%" alignSelf={"center"} status={"error"} my={5} opacity={errors?.main ? 1 : 0}>
                                                                      <VStack space={2} flexShrink={1} w="100%">
                                                                                <HStack flexShrink={1} space={2} justifyContent="space-between">
                                                                                          <HStack space={2} flexShrink={1}>
                                                                                                    <Alert.Icon mt="1" />
                                                                                                    <Text fontSize="md" color="coolGray.800">
                                                                                                              {errors?.main[intl.locale]}
                                                                                                    </Text>
                                                                                          </HStack>
                                                                                          <IconButton onPress={() => setErrors(null)} variant="unstyled" _focus={{
                                                                                                    borderWidth: 0
                                                                                          }} icon={<CloseIcon size="3" color="coolGray.600" />} />
                                                                                </HStack>
                                                                      </VStack>
                                                            </Alert>}
                                                            <View style={styles.bottomSide}>
                                                                      {/* <Text style={styles.bottomTitle}>
                                                                      Connexion - Application PSR
                                                            </Text> */}
                                                                      <View style={styles.inputs}>
                                                                                <View style={styles.input}>
                                                                                          <Text style={styles.inputLabel}>
                                                                                                    { intl.formatMessage({ id: 'auth.login.username' })}
                                                                                          </Text>
                                                                                          <Input
                                                                                                    placeholder={ intl.formatMessage({ id: 'auth.login.usernameHolder' })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    value={email}
                                                                                                    onChangeText={(em) => setEmail(em)}
                                                                                                    isDisabled={loading}
                                                                                                    InputLeftElement={
                                                                                                              <Icon
                                                                                                                        as={<MaterialCommunityIcons name="email-outline" size={20} color="#777" />}
                                                                                                                        size={6}
                                                                                                                        ml="2"
                                                                                                                        color="muted.400"
                                                                                                              />}
                                                                                          />
                                                                                </View>
                                                                                {errors && errors.email && (<Text style={styles.error}>{errors.email[0][intl.locale]}</Text>)}
                                                                                <View style={{ marginTop: 10 }}>
                                                                                          <Text style={styles.inputLabel}>{ intl.formatMessage({ id: 'auth.login.password' })}</Text>
                                                                                          <FormControl isInvalid={errors && errors.password}>
                                                                                                    <Input
                                                                                                              placeholder={ intl.formatMessage({ id: 'auth.login.passwordHolder' })}
                                                                                                              backgroundColor={"#fff"}
                                                                                                              borderRadius={8}
                                                                                                              py={3}
                                                                                                              value={password}
                                                                                                              onChangeText={(em) => setPassword(em)}
                                                                                                              isDisabled={loading}
                                                                                                              secureTextEntry={!showPassword}
                                                                                                              InputLeftElement={
                                                                                                                        <Icon
                                                                                                                                  as={<AntDesign name="lock" size={20} color="black" />}
                                                                                                                                  size={7}
                                                                                                                                  ml="2"
                                                                                                                                  color="muted.400"
                                                                                                                        />}
                                                                                                              InputRightElement={
                                                                                                                        <Icon
                                                                                                                                  as={<Ionicons name={!showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="black" />}
                                                                                                                                  size={7}
                                                                                                                                  ml="2"
                                                                                                                                  color="muted.400"
                                                                                                                                  style={{ marginRight: 5 }}
                                                                                                                                  onPress={() => setShowPassword(t => !t)}
                                                                                                                        />}
                                                                                                              />
                                                                                                              {errors && errors.password &&<FormControl.ErrorMessage leftIcon={<WarningOutlineIcon size="xs" />}>
                                                                                                                        {errors.password[0][intl.locale]}
                                                                                                              </FormControl.ErrorMessage>}
                                                                                                    </FormControl>
                                                                                </View>

                                                                      </View>
                                                                      <Button
                                                                                isDisabled={email == "" || password == ""}
                                                                                borderRadius={30}
                                                                                isLoading={loading}
                                                                                px={0}
                                                                                py={3}
                                                                                width={"60%"}
                                                                                minHeight={55}
                                                                                marginTop={5}
                                                                                size="lg"
                                                                                onPress={handleLogin}
                                                                                backgroundColor={"#369c69"}
                                                                                _text={{
                                                                                          fontWeight: 'bold'
                                                                                }}
                                                                      >
                                                                                { intl.formatMessage({ id: 'auth.login.loginButton' })}
                                                                      </Button>
                                                                      <View style={styles.separator}>
                                                                                <View style={styles.separatorLine} />
                                                                                <Text style={styles.separatorText}>{ intl.formatMessage({ id: 'auth.login.or' })}</Text>
                                                                                <View style={styles.separatorLine} />
                                                                      </View>
                                                                      <Button
                                                                                onPress={() => navigation.navigate('Register')}
                                                                                borderRadius={30}
                                                                                px={12}
                                                                                py={3}
                                                                                size="lg"
                                                                                backgroundColor={"transparent"}
                                                                                borderColor={"#369c69"}
                                                                                borderWidth={2}
                                                                                marginBottom={15}
                                                                                _text={{
                                                                                          fontWeight: 'bold',
                                                                                          color: "#369c69"
                                                                                }}
                                                                      >
                                                                                { intl.formatMessage({ id: 'auth.login.registerButton' })}
                                                                      </Button>
                                                            </View>
                                                  </View>
                                        </ScrollView>
                              </ImageBackground>
                    </>
          )
}

const styles = StyleSheet.create({
          container: {
                    flex: 1,
                    // justifyContent: 'center',
                    // alignItems: 'center'
          },
          header: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    flex: 0.3
          },
          appImage: {
                    width: 100,
                    height: 100,
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: "#fff",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: 20,
                    marginBottom: 20
          },
          appName: {
                    color: '#fff',
                    fontWeight: 'bold'
          },
          bottomSide: {
                    // justifyContent: 'center',
                    alignItems: 'center',
                    width: '85%',
                    alignSelf: 'center',
                    flex: 1,
                    // backgroundColor: "red",
                    // marginTop: -80
          },
          bottomTitle: {
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 17,
                    marginVertical: 10
                    // marginTop: 50,
                    // marginBottom: 30
          },
          inputs: {
                    width: '100%',
                    // marginTop: 50,
          },
          inputLabel: {
                    color: '#fff',
                    fontWeight: 'bold',
                    marginVertical: 5
          },
          register: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 20
          },
          registerLabel: {
                    color: '#fff',
                    fontSize: 16
          },
          registerBtn: {
                    color: '#369c69',
                    fontSize: 16,
                    marginLeft: 10
          },
          separator: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    // paddingHorizontal: 50,
                    marginVertical: 20
          },
          separatorLine: {
                    height: 1,
                    flex: 1,
                    backgroundColor: '#ddd'
          },
          separatorText: {
                    marginHorizontal: 10,
                    color: '#777'
          },
          error: {
                    color: "#F90505",
          },
          errormain: {
                    color: "#F90505",
                    textAlign: "center",
          },
          langButton: {
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#333',
                    padding: 10,
                    borderRadius: 10,
                    zIndex: 1
          },
          langText: {
                    color: '#f1f1f1',
                    marginLeft: 5
          },

          modalContainer: {
                    position: 'absolute',
                    zIndex: 1,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    justifyContent: 'center',
                    alignItems: 'center'
          },
          modalContent: {
                    width: '80%',
                    maxWidth: 400,
                    maxHeight: '90%',
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    overflow: 'hidden',
                    paddingVertical: 10
          },
          reponseItem: {
                    paddingVertical: 10,
                    paddingHorizontal: 15,
                    marginTop: 5,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignContent: 'center'
          },
          reponseText: {
                    marginLeft: 10
          },
})