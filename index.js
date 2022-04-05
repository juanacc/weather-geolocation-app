require('dotenv').config();
const { inquirerMenu, pausa, leerInput, listarLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');

const main = async () => {
  const busquedas = new Busquedas();
  let opt;
  do {
    opt = await inquirerMenu();
    switch (opt) {
      case 1:
        // Mostrar mensaje
        const termino = await leerInput('Ciudad: ');
        // Buscar los lugares
        const lugares = await busquedas.ciudad(termino);
        // Seleccionar el lugar
        const id = await listarLugares(lugares);
        if (id === '0') continue; // volver al menu. Sigue la siguiente iteracion
        const lugarSel = lugares.find(lugar => lugar.id === id);
        // Guardar en DB
        busquedas.agregarHistorial(lugarSel.nombre);
        // Clima
        const clima = await busquedas.climaLugar(lugarSel.lat, lugarSel.lng);
        // Mostrar resultados
        console.clear();
        console.log('\nInformacion de la ciudad.\n'.green);
        console.log('Ciudad: ', lugarSel.nombre.green);
        console.log('Lat: ', lugarSel.lat);
        console.log('Lng: ', lugarSel.lng);
        console.log('Temperatura: ', clima.temp);
        console.log('Minima: ', clima.min);
        console.log('Maxima: ', clima.max);
        console.log('Como esta el clima: ', clima.desc.green);
        break;
      case 2:
        // Mostrar mensaje
        // busquedas.historialCapitalizado.forEach(lugar => console.log(lugar.toUpperCase()));
        busquedas.historialCapitalizado.forEach((lugar, i) => {
          const idx = `${i + 1}.`.green;
          console.log(idx + lugar.green);
        });
        break;
    }
    if (opt !== 0) await pausa();
  } while (opt !== 0);
};

main();
