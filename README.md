# RemoteConsoleTransmitter
Provides a socket connection to allow client connections to transmit console events

## Client application
Import the ./js/RemoteConsoleTransmitter:
```import RemoteConsoleTransmitter from 'js/RemoteConsoleTransmitter';```
And initialize it via ```const remoteConsoleTransmitter = new RemoteConsoleTransmitter("http://localhost:3000");```

## Server application
To run the server, from console execute command ```npm run start``` and try accessing the display page via the URL: http://localhost:3000
