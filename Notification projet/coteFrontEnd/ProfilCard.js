import { useFocusEffect, useNavigation } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { View, Text, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { unsetUserAction } from '../../store/actions/userActions'
import { userSelector } from '../../store/selectors/userSelector'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FormattedMessage, useIntl } from 'react-intl'
import { MaterialIcons } from '@expo/vector-icons'; 
import fetchApi from '../../helpers/fetchApi'
import moment from 'moment'
import Loading from '../app/Loading'
import registerPushNotification from '../../helpers/registerPushNotification'


export default function ProfileCard({ type }) {
          const navigation = useNavigation()
          const user = useSelector(userSelector)
          const dispatch = useDispatch()
          const [freshUser, setFreshUser] = useState({})
          const intl = useIntl()
          const [loading, setLoading] = useState(false)
          const btnTitle = type == 'profil' ? intl.formatMessage({id: "auth.ProfileCardScreen.titleBouton"}) : intl.formatMessage({id: "auth.ProfileCardScreen.titleInfo"})

          const onPress = async () => {
              try{
                    if (type == 'profil') {
                              setLoading(true)
                              const token = await registerPushNotification()
                              await fetchApi('/users/logout', {
                                        method: 'POST',
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          PUSH_NOTIFICATION_TOKEN: token?.data,
                                }),
                              })
                              await AsyncStorage.removeItem('user')
                              setLoading(false)
                              dispatch(unsetUserAction())
                    } else {
                              navigation.navigate('ProfileTab')
                    }
              }
              catch(error){
                     console.log(error)
              }
          }

          var fullNames = user.NOM + ' ' + user.PRENOM
          if (user.PROFIL_ID == 7) {
                    fullNames = user.NOM_CITOYEN + ' ' + user.PRENOM_CITOYEN
          }
          useFocusEffect(useCallback(() => {
                    (async () => {
                              try {
                                        const freshUser = await fetchApi('/users/connected')
                                        setFreshUser(freshUser)
                              } catch (error) {
                                        console.log(error)
                              }
                    })()
          }, []))
          return (
                    <>
                    {loading && <Loading />}
                    <View style={styles.profileCard}>
                              <View style={styles.cardUser}>
                                        {user.PHOTO ? <Image source={{ uri: user.PHOTO }} style={styles.userImage} /> :
                                                  <Image source={require('../../../assets/images/user.png')} style={styles.userImage} />}
                                        <View style={styles.userNames}>
                                                  <Text style={styles.username}>{fullNames}</Text>
                                                  {user.PROFIL_ID == 7 ? <Text style={styles.userDesc}>{intl.formatMessage({id: "auth.ProfileCardScreen.titleCitoyen"})}</Text> :
                                                            <Text style={styles.userDesc}>{/* Matricule N° */}{user.NUMERO_MATRICULE}</Text>}
                                        </View>
                              </View>
                             {user.PROFIL_ID != 7 &&  <View style={styles.cardActions}>
                                        <View style={styles.actionPv}>
                                                  <Text style={styles.actionTitle}>{intl.formatMessage({id: "auth.ProfileCardScreen.titlePv"})}</Text>
                                                  <Text style={styles.actionValue}>
                                                            {freshUser.LIEU_EXACTE}
                                                  </Text>
                                        </View>
                                        <View style={styles.actionPv}>
                                                  <Text style={styles.actionTitle}>{intl.formatMessage({id: "auth.ProfileCardScreen.titleDate"})}</Text>
                                                  <Text style={{ ...styles.actionValue, textAlign: 'right' }}>
                                                            {moment(freshUser.DATE_DEBUT).format('DD-MM-Y')}
                                                  </Text>
                                        </View>
                              </View>}
                              <TouchableWithoutFeedback onPress={onPress}>
                                        <View style={styles.moreBtn} >
                                                  {type == 'profil' && <MaterialIcons name="logout" size={20} color="#777" />}
                                                  <Text style={{ ...styles.actionTitle, ...styles.moreInfoBtnText }}>{btnTitle}</Text>
                                        </View>
                              </TouchableWithoutFeedback>
                    </View>
                    </>
          )
}

const styles = StyleSheet.create({

          profileCard: {
                    backgroundColor: '#fff',
                    padding: 20,
                    paddingTop: 10,
                    paddingBottom: 0,
                    borderRadius: 20,
                    width: '90%',
                    alignSelf: 'center',
                    marginTop: -30,
                    elevation: 10,
                    shadowColor: '#c4c4c4',
                    maxWidth: 500
          },
          cardUser: {
                    flexDirection: 'row',
                    alignItems: 'center'
          },
          userNames: {
                    marginLeft: 10
          },
          userImage: {
                    width: 60,
                    height: 60,
                    borderRadius: 50
          },
          username: {
                    fontWeight: 'bold',
                    fontSize: 13,
                    opacity: 0.8
          },
          userDesc: {
                    color: '#777',
                    fontSize: 13,
          },
          cardActions: {
                    marginTop: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center'
          },
           actionTitle: {
                    color: 'blue',
                    color: '#53a4d4',
                    fontWeight: 'bold',
                    opacity: 0.8,
                    fontSize: 10
          },
          moreBtn: {
                    borderTopWidth: 1,
                    borderTopColor: '#ddd',
                    paddingVertical: 20,
                    marginTop: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
          },
          moreInfoBtnText: {
                    textAlign: 'center',
                    marginLeft: 10
          },
          actionValue: {
                    fontWeight: 'bold',
                    fontSize: 10
          }
})