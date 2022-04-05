const fs = require('fs');
const axios = require('axios');

class Busquedas {
  historial = [];
  dbPath = './db/database.json';
  constructor() {
    this.leerDB();
  }

  get paramsMapbox() {
    return {
      proximity: 'ip',
      language: 'es',
      access_token: process.env.MAPBOX_KEY,
      limit: 5
    };
  }

  get paramsWeather() {
    return {
      appid: process.env.OPENWEATHER_KEY,
      units: 'metric',
      lang: 'es'
    };
  }

  get historialCapitalizado() {
    const historialCapitalizado = this.historial.map(lugar => {
      let capitalizado = '';
      lugar.split(' ').forEach(palabra => {
        capitalizado += `${palabra.charAt(0).toUpperCase()}${palabra.slice(1)} `;
      });

      return capitalizado.trim();
    });

    return historialCapitalizado;
  }

  async ciudad(lugar = '') {
    try {
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
        params: this.paramsMapbox
      });
      const resp = await instance.get();

      return resp.data.features.map(lugar => ({
        id: lugar.id,
        nombre: lugar.place_name,
        lat: lugar.center[0],
        lng: lugar.center[1]
      }));
    } catch (error) {
      return [];
    }
  }

  async climaLugar(lat, lon) {
    try {
      const instance = axios.create({
        baseURL: 'https://api.openweathermap.org/data/2.5/weather',
        params: { ...this.paramsWeather, lat, lon }
      });

      const resp = await instance.get();
      const { main, weather } = resp.data;
      return {
        desc: weather[0].description,
        min: main.temp_min,
        max: main.temp_max,
        temp: main.temp
      };
    } catch (error) {
      return [];
    }
  }

  agregarHistorial(lugar) {
    if (this.historial.includes(lugar.toLowerCase())) return;
    this.historial = this.historial.slice(0, 5);
    this.historial.unshift(lugar.toLowerCase());
    // TODO: guardar en DB
    this.guardarDB();
  }

  guardarDB() {
    const payload = {
      historial: this.historial
    };

    fs.writeFileSync(this.dbPath, JSON.stringify(payload));
  }

  leerDB() {
    if (!fs.existsSync(this.dbPath)) return;

    const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
    const data = JSON.parse(info);
    this.historial = data.historial;
  }
}

module.exports = Busquedas;
