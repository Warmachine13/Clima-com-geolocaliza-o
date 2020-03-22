import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Text, View, FlatList, Button, AsyncStorage, ToastAndroid } from 'react-native';
// import {
//   AdMobBanner,

// } from 'react-native-admob'

export default () => {
  let [dados, setdados] = useState([]);
  let [network, setNetwork] = useState(false);
  let [local, setlocal] = useState(null);
  let [locais, setLocais] = useState(null);
  let [localData, setlocalData] = useState(null);

  let { setItem, getItem, removeItem } = AsyncStorage;

  useEffect(async () => {
    let { show } = ToastAndroid;


    let localmr = await getItem('local')
    setlocal(localmr)

    if (!local) {
      let { request, check } = PermissionsAndroid;
      let permission = await check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (!permission)
        permission = await request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

      if (permission === PermissionsAndroid.RESULTS.GRANTED)
        permission = 'granted'
    } else {
      await updateDados(local)
    }

    navigator.geolocation.getCurrentPosition(value => {
      fetch(`https://www.metaweather.com/api/location/search/?lattlong=${value.coords.latitude},${value.coords.longitude}`).then(value => {
        value.json().then(value => setLocais(value))
      })
    }, err => alert('Não foi possivel pegar a geolocalização')
    )
  }, [])

  let updateDados = (local) => {
    //  console.warn(local);

    fetch(`https://www.metaweather.com/api/location/${local}/`).then(value => {
      value.json().then(value => {

        let dadosLocal = {
          time: new Date(value.time).getDay() + '/' + new Date(value.time).getMonth() + '/' + new Date(value.time).getDay(),
          sunRise: new Date(value.sun_rise).getHours(),
          sunSet: new Date(value.sun_set).getHours(),
          title: value.title,
          localType: value.location_type,
          latLong: value.latt_long,
          timezone: value.timezone
        }

        setdados(value.consolidated_weather);
        setlocalData(dadosLocal);

        setItem('localData', JSON.stringify(dadosLocal));
        setItem('dados', JSON.stringify(value.consolidated_weather));
      }
      )
    }).catch(err => {
      alert(err);

      getItem('localData', (err, value) => {
        if (err)
          alert('Não há dados salvos')

        setlocalData(JSON.parse(value));
      })

      getItem('dados', (err, value) => {
        if (err)
          alert('Não há dados salvos')

        setdados(JSON.parse(value));
      })
    })
  }

  if (!local && locais) return (
    <View style={{ flex: 1, backgroundColor: 'yellow' }}>
      <FlatList
        data={locais}
        extraData={locais}
        keyExtractor={(i, index) => `${index}`}
        renderItem={(data) => {
          return (
            <View style={{ padding: 10 }}>
              <Button title={`${data.item.title}`} color={'blue'} onPress={() => {
                setItem('local', JSON.stringify(data.item.woeid));
                setlocal(data.item.woeid);
                updateDados(data.item.woeid);
              }
              } />
            </View>
          )
        }
        }
      />
    </View>)


  return (
    <View style={{ backgroundColor: 'gray', flex: 1 }} >

      <Button title={'trocar local'} color={'lightred'} onPress={() => {
        removeItem('local');
        setlocal(null);
      }} />

      {localData &&
        <View style={{ flex: 0.25, backgroundColor: 'lightblue', padding: 20 }}>
          <Text>Local: {localData.title}</Text>
          <Text>{localData.time}</Text>
          <Text>{localData.timezone}</Text>
          <Text>{localData.latLong}</Text>
          <View style={{}}>
            <Text>Hora do nacer do sol : {localData.sunRise}</Text>
            <Text>Hora do por do sol :{localData.sunSet}</Text>
          </View>
        </View>
      }


      <View style={{ flex: 1, backgroundColor: 'lightgray' }}>
        <FlatList
          data={dados}
          extraData={dados}
          keyExtractor={(i, index) => `${index}`}
          renderItem={(data) =>
            (

              <View key={data.item.id} style={{ backgroundColor: 'lightgray', padding: 20 }}>
                <Text >Estado do tempo: {data.item.weather_state_name} </Text>
                <Text >Direção do vento compaço: {data.item.wind_direction_compass} </Text>

                <Text >Temperatura: {data.item.the_temp} </Text>
                <Text >Temperatura Maxima: {data.item.max_temp} </Text>
                <Text >Temperatura Minima: {data.item.min_temp} </Text>

                <Text >Velocidade do vento:  {data.item.wind_speed} </Text>
                <Text >Direção do vento: {data.item.wind_direction} </Text>

                <Text >Pressão do ar: {data.item.air_pressure} </Text>
                <Text >Humidade: {data.item.humidity} </Text>
                <Text >Visibilidade: {data.item.visibility} </Text>
                <Text >Data a ser aplicada: {data.item.applicable_date} </Text>
                <Text >Data: {data.item.created} </Text>

              </View>
            )
          }
        />
      </View>
    </View >
  );
}
