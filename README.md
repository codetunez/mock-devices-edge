# mock-devices-edge - v1 Beta

mock-devices-edge is an Azure IoT Edge module that enables basic control of mock-devices when it is deployed as an Edge module

Please visit the links to learn more about mock-devices [for desktop](https://github.com/codetunez/mock-devices/tree/v6) and mock-devices [for docker](https://github.com/codetunez/mock-devices-de/tree/v6) **Ensure the branch is V6**

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

When deploying modules, please configure ports to desired settings. The recommendation is to stick to docker guidelines

## How to use in an IoT Central Edge device template (DTDLv1 Device Capability Model)
Import the following module (dcm) to your IoT Central device template. Ensure the device template has a module for each instance of mock-devices required. When adding the instance update the identity and set "Relationship name" and "Name" to the instance used in the Edge manifest

Where template import is not required, the following json can be remodelled into a custom module definition

```
{
  "@id": "urn:codetunezdcm:mockDevicesEdge:1",
  "@type": "CapabilityModel",
  "implements": [
    {
      "@id": "urn:codetunezdcm:mockDevicesEdge:edgeinstance:1",
      "@type": "InterfaceInstance",
      "displayName": {
        "en": "Init and Control"
      },
      "name": "EdgeModule1",
      "schema": {
        "@id": "urn:globalns:IMockDevicesEdge:1",
        "@type": "Interface",
        "displayName": {
          "en": "Control plane"
        },
        "contents": [
          {
            "@id": "urn:globalns:IMockDevicesEdge:fileURI:1",
            "@type": "Property",
            "displayName": {
              "en": "fileURI"
            },
            "name": "fileURI",
            "writable": true,
            "schema": "string"
          },
          {
            "@id": "urn:globalns:IMockDevicesEdge:start:1",
            "@type": "Command",
            "commandType": "synchronous",
            "durable": false,
            "request": {
              "@id": "urn:globalns:IMockDevicesEdge:start:server:1",
              "@type": "SchemaField",
              "displayName": {
                "en": "server"
              },
              "name": "server",
              "schema": "string"
            },
            "response": {
              "@id": "urn:globalns:IMockDevicesEdge:start:res:1",
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
            "@id": "urn:globalns:IMockDevicesEdge:stop:1",
            "@type": "Command",
            "commandType": "synchronous",
            "durable": false,
            "request": {
              "@id": "urn:globalns:IMockDevicesEdge:stop:server:1",
              "@type": "SchemaField",
              "displayName": {
                "en": "server"
              },
              "name": "server",
              "schema": "string"
            },
            "response": {
              "@id": "urn:globalns:IMockDevicesEdge:stop:res:1",
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
            "@id": "urn:globalns:IMockDevicesEdge:restart:1",
            "@type": "Command",
            "commandType": "synchronous",
            "durable": false,
            "request": {
              "@id": "urn:globalns:IMockDevicesEdge:restart:server:1",
              "@type": "SchemaField",
              "displayName": {
                "en": "server"
              },
              "name": "server",
              "schema": "string"
            },
            "response": {
              "@id": "urn:globalns:IMockDevicesEdge:restart:res:1",
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
    "en": "codetunezdcm/mock-devices-edge"
  },
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
