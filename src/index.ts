import http from 'http';
import app from './server/app';

const server = http.createServer(app);
const port = app.get('port');

server.listen(port, () => {
    console.log(`Server listen on port ${port}`);
});

