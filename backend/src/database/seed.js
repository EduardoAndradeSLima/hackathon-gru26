const fs = require('fs/promises');
const store = require('./store');

async function seed() {
  try {
    await fs.rm(store.dbPath, { force: true });
    await store.ensure();
    console.log('Base local recriada com sucesso.');
  } catch (error) {
    console.error('Erro ao recriar base local', error);
    process.exit(1);
  }
}

seed();
