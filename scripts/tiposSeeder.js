import TipoFigurita from '../models/TipoFigurita.js';

export async function inicializarTipos() {
  const cantidad = await TipoFigurita.count();

  if (cantidad > 0) {
    console.log('Ya existen tipos cargados, no se inicializa.');
    return;
  }

  console.log('Inicializando los tipos de figuritas...');

  await TipoFigurita.bulkCreate([
    { nombre: 'Jugador' },
    { nombre: 'Escudo' },
    { nombre: 'Formación' },
    { nombre: 'Coca-Cola' },
    { nombre: 'FWC' }
  ]);

  console.log('Tipos inicializados con éxito.');
}
