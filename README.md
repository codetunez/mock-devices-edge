# mock-devices-edge v1 (Edge Module)

mock-devices-edge is an Azure IoT Edge module that enables basic control of mock-devices when the latter is deployed as a simulation engine Edge module. This module can be used to integrate adapters, connectors or anything that can interface with an Edge module. This repo details the steps to add this and instances of mock-device-de as modules in an Edge deployment manifest

Please visit the links to learn more about [mock-devices *(desktop edition)*](https://github.com/codetunez/mock-devices) and [mock-devices-de *(docker edition)*](https://github.com/codetunez/mock-devices-de)

These docs assume the Edge runtime has already been installed on the Edge Device host PC

# Additions to the Edge deployment manifest

To use mock-devices-de in an Edge deployment add the following modules

**mock-devices-edge** is a support module Docker container that is used to control any running module instance of mock-devices-de in the same runtime. A mock-devices state file is passed to an instance of mock-devices-de via this module. The state file will need to be downloaded by this module via a public endpoint. This module has a desired twin the can be used to provide the URI. The recommendation here is to use blob storage with a short expire sas token'd url. This module can also start/stop/restart any running mock-devices engine within the same runtime. This is the configuration for the the deployment manifest

```
  "mockDevicesEdge": {
      "version": "1.0",
      "type": "docker",
      "status": "running",
      "restartPolicy": "always",
      "settings": {
          "image": "codetunez/mock-devices-edge:latest",
          "createOptions": "{}"
      }
  },
```
See [man.js](/main.js) for full capabilities of this module

**mock-devices-de** is the mock-devices simulation engine Docker container and is used to run simulated Edge modules. A module instance logically maps to a board or sensor(s) in a single device and therefore multiple instances of this container can be added to the Edge deployment to simulate multiple boards/sensors/devices for the Edge Device. The mock-devices engine for the given module instance will only run the mock-devices module that matches the host module id and device id of the running Edge runtime. This is the configuration for the the deployment manifest

```
  "mockDevicesDe<instance_number>": {
      "version": "1.0",
      "type": "docker",
      "status": "running",
      "restartPolicy": "always",
      "settings": {
          "image": "codetunez/mock-devices-de:latest",
          "createOptions": "{}"
      }
  },
```
Any non modules in the same state file will also run when the mock-devices engine is started. If the state file contains devices and modules, it is not recommended to share the state file between module instances of mock-devices-de. Any non-modules should be removed from the state file if shared state file is required

### Example createOptions as stringified JSON.
The HostPort should be changed per module instance of mock-devices-de 
```
"createOptions": "{\"HostConfig\":{\"PortBindings\":{\"9000*/tcp\":[{\"HostPort\":\"8787\"}]}}"
```

### Referencing the correct instance of the mock-devices-de engine
Examples
- Within Edge runtime (module to module) - http://mockDevicesDe1:9000
- On same host Edge PC - http://127.0.0.1:8787
- On same LAN PC - http://192.168.0.0:8787

### Routes

The Edge manifest must still be manually maintained for routes, properties and module naming and tshis must all be aligned through the ecosystem-runtime-manifest. This basic route will ensure all telemetry is sent to the hub connected to the Edge device and should be added o the manifest json

 ```
  "routes": {
      "routes1": "FROM /* INTO $upstream"
  },
```
## Adding a UX module into the deployment manifest
mock-device-de can be controlled directly by REST, via the mock-device-edge module or using the UX. V6 of the mock-devices UX allows connecting to different mock-devices engines via IP address or DNS. The UX can also be deployed as the following module

**mdux**  is a Docker container build of the desktop edition. It is designed to run inside containers with no access to file systems. It is a fully functional UX + engine mock-devices instance and is useful for localhost scenarios. It can be launched at http://127.0.0.1:9000 on the host machine. It can also be used to connect to any mock-devices engine using IP or DNS i.e. mock-devices-de modules within the same Edge runtime

```
  "mockDevicesUx": {
      "version": "1.0",
      "type": "docker",
      "status": "running",
      "restartPolicy": "always",
      "settings": {
          "image": "codetunez/mdux:latest",
          "createOptions": "{}"
      }
  },
```
Configure the appropriate createOptions to allow the UX to be accessed off box via LAN and/or external (configure firewall separately)

# How to use in an IoT Central Edge device template
The mock-devices-edge module can be added to an IoT Central device template to use mock-devices with module simulation inside an application

## DTDLv1 Device Capability Model
Import the following capability model into a new IoT Central device template. Once imported, add a module for every instance of mock-devices to match the Edge manifest. When adding the instance update the identity and set "Relationship name" and "Name" to the instance values used in the Edge manifest

[DCM](/dcm.json)

```
{
  "@id": "urn:codetunez:edgeDevice:1",
  "@type": "CapabilityModel",
  "implements": [],
  "displayName": {
    "en": "Edge Device"
  },
  "contents": [
    {
      "@id": "urn:codetunez:edgeDevice:EdgeDeviceTemplate_4zg:1",
      "@type": [
        "Relationship",
        "SemanticType/EdgeModule"
      ],
      "name": "mockDeviceEdgeModule",
      "maxMultiplicity": 1,
      "target": [
        {
          "@id": "urn:codetunez:mockDeviceEdgeModule:1",
          "@type": "CapabilityModel",
          "implements": [
            {
              "@id": "urn:codetunez:mockDeviceEdgeModule:fqghobkce:1",
              "@type": "InterfaceInstance",
              "displayName": {
                "en": "Control Plane"
              },
              "name": "mockDeviceEdge",
              "schema": {
                "@id": "urn:codetunez:mockDeviceEdge:1",
                "@type": "Interface",
                "displayName": {
                  "en": "Control Plane"
                },
                "contents": [
                  {
                    "@id": "urn:codetunez:mockDeviceEdge:fileURI:1",
                    "@type": "Property",
                    "displayName": {
                      "en": "fileURI"
                    },
                    "name": "fileURI",
                    "writable": true,
                    "schema": "string"
                  },
                  {
                    "@id": "urn:codetunez:mockDeviceEdge:start:1",
                    "@type": "Command",
                    "commandType": "synchronous",
                    "durable": false,
                    "request": {
                      "@id": "urn:codetunez:mockDeviceEdge:start:req:1",
                      "@type": "SchemaField",
                      "displayName": {
                        "en": "req"
                      },
                      "name": "req",
                      "schema": "string"
                    },
                    "response": {
                      "@id": "urn:codetunez:mockDeviceEdge:start:res:1",
                      "@type": "SchemaField",
                      "displayName": {
                        "en": "res"
                      },
                      "name": "res",
                      "schema": "string"
                    },
                    "displayName": {
                      "en": "start"
                    },
                    "name": "start"
                  },
                  {
                    "@id": "urn:codetunez:mockDeviceEdge:stop:1",
                    "@type": "Command",
                    "commandType": "synchronous",
                    "durable": false,
                    "request": {
                      "@id": "urn:codetunez:mockDeviceEdge:stop:req:1",
                      "@type": "SchemaField",
                      "displayName": {
                        "en": "req"
                      },
                      "name": "req",
                      "schema": "string"
                    },
                    "response": {
                      "@id": "urn:codetunez:mockDeviceEdge:stop:res:1",
                      "@type": "SchemaField",
                      "displayName": {
                        "en": "res"
                      },
                      "name": "res",
                      "schema": "string"
                    },
                    "displayName": {
                      "en": "stop"
                    },
                    "name": "stop"
                  },
                  {
                    "@id": "urn:codetunez:mockDeviceEdge:restart:1",
                    "@type": "Command",
                    "commandType": "synchronous",
                    "durable": false,
                    "request": {
                      "@id": "urn:codetunez:mockDeviceEdge:restart:req:1",
                      "@type": "SchemaField",
                      "displayName": {
                        "en": "req"
                      },
                      "name": "req",
                      "schema": "string"
                    },
                    "response": {
                      "@id": "urn:codetunez:mockDeviceEdge:restart:res:1",
                      "@type": "SchemaField",
                      "displayName": {
                        "en": "res"
                      },
                      "name": "res",
                      "schema": "string"
                    },
                    "displayName": {
                      "en": "restart"
                    },
                    "name": "restart"
                  }
                ]
              }
            }
          ],
          "displayName": {
            "en": "codetunez/mock-devices-edge"
          },
          "@context": [
            "http://azureiot.com/v1/contexts/IoTModel.json"
          ]
        }
      ]
    }    
  ],
  "@context": [
    "http://azureiot.com/v1/contexts/IoTModel.json"
  ]
}

```

## Developers
mock-devices-de can be fully controlled via REST and therefore this module can be forked to enable more functionality. Visit [the docs](https://github.com/codetunez/mock-devices-de/blob/master/readme.MD) to see the full API

### Docker build and deploy
Building the container\
`docker build -t <namespace>\mock-devices-edge .`

Local run\
`docker run -p <port>:9005 -d <namespace>\mock-devices-edge`

Push the container\
`docker push <namespace>\mock-devices-edge`
