import { createServer } from '../server.js';

const app = createServer();

export default function handler(request, response) {
  app.emit('request', request, response);
}
