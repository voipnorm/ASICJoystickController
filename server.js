const gamePad = require('./gamePad2');
const TPXapi = require('./endpoint2');
const UsbDetection = require('./usb');

var endpoint = {
    username: process.env.TPADMIN,
    password: process.env.TPADMINPWD,
    ipAddress: "10.27.42.120",
}

var usb = new UsbDetection();

var joyStick = null;

var tp = new TPXapi(endpoint);



usb.on('status',(status) =>{
    console.log(status);



    if(status.state == 'online'){
        console.log("joystick online");

        joyStick  = new gamePad();

        joyStick.on('status', (report) => {
            console.log(report);
            return tp.localRemote(report);
        });

    }
    if(status.state == 'down'){
        if(!joyStick|| joyStick === null){
            return console.log("Joystick Unplugged before initialization")
        }
        joyStick.closeDevice();
        //usb.onExit();

    }
});


process.on('SIGINT', function() {
    console.log('server : stoppping...');
    usb.onExit();
    process.exit();
});
