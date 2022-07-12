import { Button, Icon, Input, useToast } from 'native-base'
import React, { useState, useEffect } from 'react'
import { Image, ImageBackground, ScrollView, StyleSheet, Text, useWindowDimensions, TouchableWithoutFeedback, View, Animated, BackHandler, Platform } from 'react-native'
import { MaterialCommunityIcons, AntDesign, Ionicons } from '@expo/vector-icons';
import { EvilIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import fetchApi from '../../helpers/fetchApi';
import * as Location from 'expo-location'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from 'react-redux';
import { setUserAction } from '../../store/actions/userActions';
import Loading from '../../components/app/Loading';
import { Host, Portal } from 'react-native-portalize';
import { FormattedMessage, useIntl } from 'react-intl'
import registerPushNotification from '../../helpers/registerPushNotification';

const OTPModal = ({ onClose }) => {
          const [scale] = useState(new Animated.Value(1.1))
          const intl = useIntl()
          const cancelRef = React.useRef(null);
          const [code, setCode] = useState('')

          useEffect(() => {
                    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                              onClose()
                              return true
                    })
                    Animated.spring(scale, {
                              toValue: 1,
                              useNativeDriver: true
                    }).start()
                    return () => {
                              backHandler.remove()
                    }
          }, [])
          return (
                    <TouchableWithoutFeedback onPress={onClose}>
                              <View style={styles.modalContainer}>
                                        <TouchableWithoutFeedback>
                                                  <Animated.View style={{ ...styles.modalContent, transform: [{ scale }] }}>
                                                            <View style={{ borderBottomWidth: 0, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: '#071E43' }}>
                                                                      <Text style={{ fontWeight: 'bold', color: '#fff', opacity: 0.8, textAlign: 'center' }}>
                                                                                Confirmer le numéro de téléphone
                                                                      </Text>
                                                            </View>
                                                            <View style={{ paddingHorizontal: 10, paddingVertical: 10 }}>
                                                                      <Text style={{ textAlign: 'center', color: '#777', lineHeight: 23}}>
                                                                                Taper un code que nous avons envoyé au <Text style={{ color: '#000', fontWeight: 'bold'}}>12345678</Text> pour vérifier votre numéro
                                                                      </Text>
                                                            </View>
                                                            <Input
                                                                      placeholder="Code"
                                                                      backgroundColor={"#fff"}
                                                                      borderRadius={8}
                                                                      py={3}
                                                                      value={code}
                                                                      onChangeText={(em) => setCode(em)}
                                                                      keyboardType='numeric'
                                                                      margin={2}
                                                            />
                                                            <View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
                                                                      <Button.Group space={2} justifyContent={"center"}>
                                                                                <Button variant="unstyled" colorScheme="coolGray" onPress={onClose} ref={cancelRef} flex={1}>
                                                                                          {intl.formatMessage({ id: "Infractions.ReponseModal.cancel" })}
                                                                                </Button>
                                                                                <Button colorScheme="info" backgroundColor={"#071E43"} borderRadius={10} flex={1} isDisabled={code == ''}>
                                                                                          {intl.formatMessage({ id: "Infractions.ReponseModal.confirm" })}
                                                                                </Button>
                                                                      </Button.Group>
                                                            </View>
                                                  </Animated.View>
                                        </TouchableWithoutFeedback>
                              </View>
                    </TouchableWithoutFeedback>
          )
}

export default function RegisterScreen() {
          const { width, height } = useWindowDimensions()
          const [showPassword, setShowPassword] = useState(false)
          const [nom, setNom] = useState("");
          const [prenom, setPrenom] = useState("");
          const [telephone, setTelephone] = useState("");
          const [cni, SetCni] = useState("");
          const [password, setPassword] = useState("");
          const [loading, setLoading] = useState(false);
          const [confirmPassword, setConfirmPassword] = useState("");
          const [errors, setErrors] = useState(null);
          const [sexe, setSexe] = useState(null)
          const [location, setLocation] = useState(null)
          const navigation = useNavigation()
          const toast = useToast()
          const dispatch = useDispatch()
          const intl = useIntl()
          const [showOtpModal, setShowOtpModal] = useState(false)

          const handleRegistre = async () => {
                    setErrors(null)
                    if (telephone.length != 8) {
                              setErrors(t => {
                                        return {
                                                  ...t,
                                                  numero: [{
                                                            [intl.locale]: intl.formatMessage({ id: "RegistreScreenError.invalidNumber" })
                                                  }]
                                        }
                              })
                              return false
                    }
                    if (password != confirmPassword) {
                              setErrors(t => {
                                        return {
                                                  ...t,
                                                  confirmPassword: [{
                                                            [intl.locale]: intl.formatMessage({ id: "RegistreScreenError.confirm" })
                                                  }]
                                        }
                              })
                              return false
                    }
                    setLoading(true)
                    if(!location) {
                              let { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
                              if (locationStatus !== 'granted') {
                                        return setLoading(false)
                              }
                              var loc = await Location.getCurrentPositionAsync({});
                              setLocation(loc)
                    }
                    try {
                              const token = await registerPushNotification()
                              const userData = await fetchApi("/users", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                                  password: password,
                                                  nom: nom,
                                                  prenom: prenom,
                                                  numero: telephone,
                                                  cni: cni,
                                                  sexe: sexe,
                                                  lat: location?.coords?.latitude,
                                                  long: location?.coords?.longitude,
                                                  PUSH_NOTIFICATION_TOKEN: token?.data,
                                                  DEVICE: Platform.OS === 'ios' ? 1 : 0
                                        }),
                              });
                              await AsyncStorage.setItem("user", JSON.stringify(userData));
                              dispatch(setUserAction(userData));
                              toast.show({
                                        title: "Enregistrement faite avec succes",
                                        type: "success",
                                        duration: 2000
                              })
                    } catch (error) {
                              console.log(error)
                              setErrors(error.errors)
                    }
                    setLoading(false);

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
          return (
                    <Host>
                              {showOtpModal &&
                                        <Portal>
                                                  <OTPModal onClose={() => setShowOtpModal(false)} />
                                        </Portal>
                              }
                              <ImageBackground style={styles.container} source={require('../../../assets/images/Bg.png')}>
                                        <ScrollView keyboardShouldPersistTaps="handled">
                                                  <View style={{ flex: 1, minHeight: height - 34 }}>
                                                            <View style={styles.header}>
                                                                      <View style={styles.appImage}>
                                                                                <Image source={require('../../../assets/icon.png')} style={{ width: "90%", height: "90%", marginBottom: 5 }} />
                                                                      </View>
                                                                      <Text style={styles.appName}>
                                                                                {intl.formatMessage({ id: "RegistreScreen.title" })}
                                                                      </Text>
                                                                      <Text style={styles.bottomTitle}>
                                                                                {intl.formatMessage({ id: "RegistreScreen.Soustitle" })}
                                                                      </Text>
                                                            </View>
                                                            <View style={styles.bottomSide}>
                                                                      <View style={styles.inputs}>
                                                                                <View style={styles.input}>
                                                                                          <Text style={styles.inputLabel}>{intl.formatMessage({ id: "RegistreScreen.Nom" })}</Text>
                                                                                          <Input
                                                                                                    placeholder={intl.formatMessage({ id: "RegistreScreen.NomHolder" })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    value={nom}
                                                                                                    onChangeText={(em) => setNom(em)}
                                                                                                    InputLeftElement={
                                                                                                              <Icon
                                                                                                                        as={<EvilIcons name="user" size={30} color="#777" />}
                                                                                                                        size={6}
                                                                                                                        ml="2"
                                                                                                                        color="muted.400"
                                                                                                              />}
                                                                                          />
                                                                                          {errors && errors.nom && (<Text style={styles.error}>{errors.nom[0]}</Text>)}

                                                                                          <Text style={styles.inputLabel}>{intl.formatMessage({ id: "RegistreScreen.Prénom" })}</Text>
                                                                                          <Input
                                                                                                    placeholder={intl.formatMessage({ id: "RegistreScreen.PrenomHolder" })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    value={prenom}
                                                                                                    onChangeText={(em) => { setPrenom(em) }}
                                                                                                    InputLeftElement={
                                                                                                              <Icon
                                                                                                                        as={<EvilIcons name="user" size={20} color="#777" />}
                                                                                                                        size={6}
                                                                                                                        ml="2"
                                                                                                                        color="muted.400"
                                                                                                              />}
                                                                                          />
                                                                                          {errors && errors.prenom && (<Text style={styles.error}>{errors.prenom[0]}</Text>)}
                                                                                          <Text style={styles.inputLabel}>{intl.formatMessage({ id: "RegistreScreen.Téléphone" })}</Text>
                                                                                          <Input
                                                                                                    placeholder={intl.formatMessage({ id: "RegistreScreen.numeroHolder" })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    keyboardType="number-pad"
                                                                                                    value={telephone}
                                                                                                    onChangeText={(em) => setTelephone(em)}
                                                                                                    InputLeftElement={
                                                                                                              <Icon
                                                                                                                        as={<Ionicons name="ios-call-outline" size={20} color="#777" />}
                                                                                                                        size={6}
                                                                                                                        ml="2"
                                                                                                                        color="muted.400"
                                                                                                              />}
                                                                                          />
                                                                                          {errors && errors.numero && (<Text style={styles.error}>{errors.numero[0][intl.locale]}</Text>)}
                                                                                          <Text style={styles.inputLabel}>{intl.formatMessage({ id: "RegistreScreen.Carte" })}</Text>
                                                                                          <Input
                                                                                                    placeholder={intl.formatMessage({ id: "RegistreScreen.cniHolder" })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    value={cni}
                                                                                                    onChangeText={(em) => SetCni(em)}
                                                                                                    InputLeftElement={
                                                                                                              <Icon
                                                                                                                        as={<Ionicons name="ios-card-outline" size={20} color="#777" />}
                                                                                                                        size={6}
                                                                                                                        ml="2"
                                                                                                                        color="muted.400"
                                                                                                              />}
                                                                                          />
                                                                                          {errors && errors.cni && (<Text style={styles.error}>{errors.cni}</Text>)}
                                                                                </View>
                                                                                <View style={{ marginTop: 10 }}>
                                                                                          <Text style={styles.inputLabel}>{intl.formatMessage({ id: "RegistreScreen.MotDePasse" })}</Text>
                                                                                          <Input
                                                                                                    placeholder={intl.formatMessage({ id: "RegistreScreen.passwordHolder" })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    secureTextEntry={!showPassword}
                                                                                                    value={password}
                                                                                                    onChangeText={(em) => setPassword(em)}
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
                                                                                          {errors && errors.password && (<Text style={styles.error}>{errors.password[0][intl.locale]}</Text>)}
                                                                                          {/* <Text>{showPassword ? 'true' : 'false'}</Text> */}
                                                                                          <Text style={styles.inputLabel}>{intl.formatMessage({ id: "RegistreScreen.ConfirmewPasseWord" })}</Text>
                                                                                          <Input
                                                                                                    placeholder={intl.formatMessage({ id: "RegistreScreen.ConfirmpasswordHolder" })}
                                                                                                    backgroundColor={"#fff"}
                                                                                                    borderRadius={8}
                                                                                                    py={3}
                                                                                                    secureTextEntry={!showPassword}
                                                                                                    value={confirmPassword}
                                                                                                    onChangeText={(em) => setConfirmPassword(em)}

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
                                                                                          {errors && errors.confirmPassword && (<Text style={styles.error}>{errors.confirmPassword[0][intl.locale]}</Text>)}
                                                                                          {/* <Text>{showPassword ? 'true' : 'false'}</Text> */}
                                                                                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 10 }}>
                                                                                                    <Text style={{ color: '#9e9b9b' }}>{intl.formatMessage({ id: "RegistreScreen.Sexe" })}</Text>
                                                                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                                                              <TouchableWithoutFeedback onPress={() => setSexe(0)}>
                                                                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 15 }} >
                                                                                                                                  <Text style={{ color: "#369c69" }}>{intl.formatMessage({ id: "RegistreScreen.Masculin" })}</Text>
                                                                                                                                  {sexe == 0 ? <MaterialCommunityIcons name="radiobox-marked" size={20} color="#007bff" style={{ marginLeft: 5 }} /> :
                                                                                                                                            <MaterialCommunityIcons name="radiobox-blank" size={20} color="#777" style={{ marginLeft: 5 }} />}
                                                                                                                        </View>
                                                                                                              </TouchableWithoutFeedback>
                                                                                                              <TouchableWithoutFeedback s onPress={() => setSexe(1)}>
                                                                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 15 }}>
                                                                                                                                  <Text style={{ color: "#369c69" }}>{intl.formatMessage({ id: "RegistreScreen.Féminin" })}</Text>
                                                                                                                                  {sexe == 1 ? <MaterialCommunityIcons name="radiobox-marked" size={20} color="#007bff" style={{ marginLeft: 5 }} /> :
                                                                                                                                            <MaterialCommunityIcons name="radiobox-blank" size={20} color="#777" style={{ marginLeft: 5 }} />}
                                                                                                                        </View>
                                                                                                              </TouchableWithoutFeedback>
                                                                                                    </View>
                                                                                          </View>
                                                                                </View>
                                                                      </View>
                                                                      <Button
                                                                                onPress={() => handleRegistre()}
                                                                                borderRadius={30}
                                                                                isLoading={loading}
                                                                                isDisabled={nom == "" || prenom == "" || telephone == "" || cni == "" || password == "" || confirmPassword == "" || sexe == null}
                                                                                px={0}
                                                                                py={3}
                                                                                width={"60%"}
                                                                                marginTop={5}
                                                                                size="lg"
                                                                                backgroundColor={"#369c69"}
                                                                                marginBottom={15}
                                                                                _text={{
                                                                                          fontWeight: 'bold'
                                                                                }}
                                                                      >
                                                                                {intl.formatMessage({ id: "RegistreScreen.Bouton" })}
                                                                      </Button>
                                                            </View>
                                                  </View>
                                        </ScrollView>
                              </ImageBackground>
                              {loading && <Loading />}
                    </Host>
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
                    marginTop: -35
          },
          bottomTitle: {
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 17,
                    marginVertical: 10,
                    marginTop: 20,
                    // marginBottom: 30
          },
          inputs: {
                    width: '100%',
                    marginTop: 50,
          },
          inputLabel: {
                    color: '#fff',
                    fontWeight: 'bold',
                    marginVertical: 5
          },
          error: {
                    color: 'red'
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
                    width: '90%',
                    maxWidth: 400,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    overflow: 'hidden'
          },
})