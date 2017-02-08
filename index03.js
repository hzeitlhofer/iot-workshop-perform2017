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
   

    var processTemp = function() {
        var temp = (Math.random() * 10) + 20;
        console.log ("Temperature:", temp);

        var topic = '/dynatrace/temperature/'+o.name;

        thing.publish(topic, JSON.stringify({ temp: temp }));

    }

    var startTimer = function() {
        processTemp();
        this.timer = setInterval(function() {
            processTemp();
        }, 1000);
    }

    var init = function() {
        thing.register(o.name, {
            persistentSubscribe: true
        });
        console.log ('subscribe to topics');
        thing.subscribe('/dynatrace/'+o.name+'/#');
        thing.subscribe('/dynatrace/broadcast/#');
        startTimer();
    }


    thing.on('connect', function(connack) {
        console.log(o.name, 'is now connected to AWS');
        init();
    });

    thing.on('message', function(topic, payload) {
    	console.log('incoming MQTT message:', topic, payload);
    });
 
}

var dev = new Device({
    name: process.argv[2]

})