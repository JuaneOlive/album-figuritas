import StickerType from '../models/TipoFigurita.js';

export async function initializeStickerTypes() {
  const existingTypeCount = await StickerType.count();

  if (existingTypeCount > 0) {
    console.log('Ya existen tipos cargados, no se inicializa.');
    return;
  }

  console.log('Inicializando los tipos de figuritas...');

  await StickerType.bulkCreate([
    { nombre: 'Jugador' },
    { nombre: 'Escudo' },
    { nombre: 'Formación' },
    { nombre: 'Coca-Cola' },
    { nombre: 'FWC' }
  ]);

  console.log('Tipos inicializados con éxito.');
}
