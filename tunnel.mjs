import { startTunnel } from 'untun';

async function main() {
  console.log('Starting Cloudflare tunnel...');
  const tunnel = await startTunnel({ url: 'http://localhost:5173' });
  const url = await tunnel.getURL();
  console.log('CLOUDFLARE_TUNNEL_URL:', url);
}

main().catch(err => {
  console.error('Tunnel error:', err);
});
