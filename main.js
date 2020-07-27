var Protocol = require('azure-iot-device-mqtt').Mqtt;
var ModuleClient = require('azure-iot-device').ModuleClient;
var axios = require('axios');
var pjson = require('./package.json');

/*
  client must be abe to implement

  -----------------------------------------------------------------------
  | type                          | name             | desc             |
  -----------------------------------------------------------------------
  | twin desired string           | fileURI          | download a json  |
  | direct command + params       | restart(string)  | send json to md  |
  | direct command + params       | start(string)    | start md engine  |
  | direct command + params       | stop(string)     | stop md engine   |
  -----------------------------------------------------------------------

  (string) should be a URI inc ports within docker i.e. http://mockDeviceDe1:9000

*/

console.log('mock-devices-edge starting up - version' + pjson.version);

let latestState = {};
ModuleClient.fromEnvironment(Protocol, function (err, client) {
    if (err) {
        console.error('Could not create client from Environment: ' + err.toString());
        process.exit(-1);
    } else {
        client.on('error', function (err) {
            console.error(`Client fatal error: ${err.message}`);
            process.exit(-1);
        });

        client.open(function (err) {

            if (err) {
                console.error('Client open error: ' + err.toString());
                console.error(err.message);
                process.exit(-1);
            };

            console.log('Starting client');

            client.onMethod('start', (request, response) => {

                const methodName = request['methodName'];
                const methodPayload = request['payload'];

                if (methodName === 'start') {
                    const url = `${methodPayload}/api/devices/start`;
                    console.log('Server requested: ' + url);
                    axios.get(url)
                        .then((res) => {
                            response.send(200, 'Start success'), (err) => {
                                if (err) { console.log('Start response error:' + err.message); return; }
                            }
                            console.log('Start completed');
                        })
                        .catch((err) => {
                            console.error(`Start post error: ${err.message}`);
                        })
                } else {
                    console.error('Start method received bad params');
                }
            });

            client.onMethod('stop', (request, response) => {

                const methodName = request['methodName'];
                const methodPayload = request['payload'];

                if (methodName === 'stop') {
                    const url = `${methodPayload}/api/devices/stop`;
                    console.log('Server requested: ' + url);
                    axios.get(url)
                        .then((res) => {
                            response.send(200, 'Stop success'), (err) => {
                                if (err) { console.log('Stop response error:' + err.message); return; }
                            }
                            console.log('Stop completed');
                        })
                        .catch((err) => {
                            console.error(`Stop post error: ${err.message}`);
                        })
                } else {
                    console.error('Stop method received bad params');
                }
            });

            client.onMethod('restart', (request, response) => {

                const methodName = request['methodName'];
                const methodPayload = request['payload'];

                if (methodName === 'restart') {
                    const url = `${methodPayload}/api/state`;
                    console.log('Server requested: ' + url);
                    axios.post(url, latestState)
                        .then((res) => {
                            response.send(200, 'Restart success'), (err) => {
                                if (err) { console.log('Restart response error:' + err.message); return; }
                            }
                            console.log('Restart completed');
                        })
                        .catch((err) => {
                            console.error(`Restart post error: ${err.message}`);
                        })
                } else {
                    console.error('Restart method received bad params');
                }
            });

            client.getTwin(function (err, twin) {
                if (err) {
                    console.error('could not get twin');
                } else {
                    twin.on('properties.desired', function (delta) {
                        if (delta && delta['fileURI'] && delta['fileURI'] != '') {
                            console.log('fetching: ' + delta['fileURI']);
                            axios.get(delta['fileURI'])
                                .then((res) => {
                                    latestState = res.data;
                                })
                                .catch((err) => {
                                    console.error(`Fetch get error: ${err.message}`);
                                })
                        }
                    });
                }
            });

        })
    }
})