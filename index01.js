const aws  = require('aws-iot-device-sdk'),
      process = require('process');

var Device = function(o) {

    var aws_host = "{AWS Host}";
    
    var thing = aws.thingShadow({
        "host": aws_host,
        "region": "eu-central-1",
        "port": 8883,
        "clientId": o.name,
        "thingName": o.name,
        "caPath": "./certs/aws-root-CA.crt",
        "clientCert": "./certs/"+o.name+".cert.pem",
        "privateKey": "./certs/"+o.name+".private.key"
    });      
    

    thing.on('connect', function(connack) {
        console.log(o.name, 'is now connected to AWS');
    });

}

var dev = new Device({
	name: process.argv[2]
})