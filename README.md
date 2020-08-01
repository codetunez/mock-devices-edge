# mock-devices-edge - v1 Beta

mock-devices-edge is an Azure IoT Edge module that enables basic control of mock-devices when it is deployed as an Edge module

Please visit the links to learn more about mock-devices [for desktop](https://github.com/codetunez/mock-devices) and mock-devices [for docker](https://github.com/codetunez/mock-devices-de)

## Additions to the Edge deployment manifest

mock-devices-edge acts as a sidecar module that controls a running instance of a mock-devices module. The mock-devices state (simulation) file is passed to it via this module and requires the file to be downloaded from a public endpoint. The recommendation here is to use blob storage with a short expire sas token'd url (downloaded via fileURI desired twin). View the main.js file in this repo to see the desired twin and direct commands needed to control the module. Use the following config in the deployment manifest json.

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

Add as many instances of mock-devices as needed with each representing one module on the Edge device. When the mock-devices engine is running, the module in mock-devices must match the module id and device id as given by the runtime environment for the module's data to be sent or received.

```
  "mockDevicesDe<instance>": {
      "version": "1.0",
      "type": "docker",
      "status": "running",
      "restartPolicy": "always",
      "settings": {
          "image": "codetunez/mock-devices:latest",
          "createOptions": "{}"
      }
  },
```

The Edge manifest must still be manually maintained for routes, properties and module naming. This must all be aligned through the ecosystem of choice. This basic route will ensure all telemetry is sent to the hub connected to the Edge device and can be added to the manifest json.

 ```
  "routes": {
      "routes1": "FROM /* INTO $upstream"
  },
```

When configuring modules, please set ports to desired settings. The recommendation is to stick to docker guidelines

## Adding a UX
The following module configuration will add the mock-devices UX as a module. Use the options in the UX to switch to view any of the other modules running the mock-devices engine. To use the UX, RDP to the local Edge box and launch a browser to http://127.0.0.1:9000. By setting the appropriate createOptions, the UX module on Edge box can be accessed via the local network using the IP and same port i.e. http://192.168.0.2:9000

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



## How to use in an IoT Central Edge device template (DTDLv1 Device Capability Model)
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
mock-devices can be fully controlled via REST endpoint and curl and therefore this module can be forked to enable more functionality or just bypassed for a custom implementation. Visit [the docs](https://github.com/codetunez/mock-devices-de/blob/master/readme.MD) to see the full API

### Docker build and deploy
Building the container\
`docker build -t <namespace>\mock-devices-edge .`

Local run\
`docker run -p <port>:9005 -d <namespace>\mock-devices-edge`

Push the container\
`docker push <namespace>\mock-devices-edge`
