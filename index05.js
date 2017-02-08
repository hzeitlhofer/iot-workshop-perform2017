const aws  = require('aws-iot-device-sdk'),
      process = require('process'),
      dtapi = require('./include/dynatrace-mobile-adk-js/index.js');

var Device = function(o) {

    dt = dtapi.Dynatrace({
        appId:              "{Dynatrace Application ID}", 
        appName:            "Dynatrace IoT Workshop",
        appVersionName:     "1.0",
        appVersionBuild:    "1000",
        appPackage:         "main",
        agentType:          "DT", 
        agentHost:          "{Dynatrace URL}",
        agentPort:          null,
        manufacturer:       "Dynatrace",
        modelId:            "IOT_DEMO_1.0",
        deviceName:         o.name,
        refreshRate:        10
    });

    dt.on('connect', function() {
        console.log(o.name,'is now connected to Dynatrace');
    });
    dt.on('data', function(o) {
        console.log(o);
    });
    dt.on('success', function(o) {
        console.log(o);
    });
    dt.on('error', function(e) {
        console.log('error', e);
    });
    dt.on('timesync', function(ts) {
        console.log('timesync', ts);
    });

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

        var dta_getTemp = dt.enterAction('process Temperature');

        var temp = (Math.random() * 10) + 20;
        console.log ("Temperature:", temp);

        var topic = '/dynatrace/temperature/'+o.name;
        var dtw_sendTemp = dt.startWebRequest('send Temperature', dta_getTemp);

        thing.publish(topic, JSON.stringify({ temp: temp }), null, function(err) {
            dt.endWebRequest(dtw_sendTemp, {
                agent: { protocol: 'mqtt:'},
                connection: { _host: aws_host },
                path: topic,
                res: { statusCode: 200 }
            });
            dt.reportValue(dta_getTemp, {
                "module": o.name,
                "temperature": temp
            });
            dt.leaveAction(dta_getTemp);
        });

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