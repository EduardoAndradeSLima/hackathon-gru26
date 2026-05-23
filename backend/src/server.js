const app = require('./app');
const env = require('./config/env');
const store = require('./database/store');

async function bootstrap() {
  await store.ensure();

  app.listen(env.port, () => {
    console.log(`Guarulhos Social Vagas API rodando em http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Falha ao iniciar a API', error);
  process.exit(1);
});
