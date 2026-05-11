import TipoFigurita from '../models/TipoFigurita.js';

export async function inicializarTipos() {
  const cantidad = await TipoFigurita.count();

  if (cantidad > 0) {
    console.log('Ya existen tipos cargados, no se inicializa.');
    return;
  }

  console.log('Inicializando los tipos de figuritas...');

  await TipoFigurita.bulkCreate([
    { nombre: 'jugador' },
    { nombre: 'escudo' },
    { nombre: 'formación' },
    { nombre: 'coca-cola' },
    { nombre: 'fwc' }
  ]);

  console.log('Tipos inicializados con éxito.');
}
