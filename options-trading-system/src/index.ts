import { createApp } from './app/create-app.js';

async function main() {
  const app = createApp();
  await app.start();
}

main().catch((error) => {
  console.error('[options-trading-system] fatal error', error);
  process.exit(1);
});
