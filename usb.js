const util = require("util");
const EventEmitter = require('events');
const usbDetect =  require('usb-detection');

usbDetect.startMonitoring();

module.exports = class UsbDetection extends EventEmitter {
    constructor() {

        super();

        this.launch();
    }

    launch() {

        this.detectOnStartUp();
        this.detect();
        this.removal();

    }
    detectOnStartUp() {
        usbDetect.find(121, 6, (err, device) => {
            if (err) {
                console.log("failed to find USB devices")
            };
            console.log('find', device);
            if(device.length == 0){
                console.log("Device not found. Please plug it in and restart the app if required.")
            }else{
                return this.emit('status', {state: 'online'});
            }

        });
    }
    detect(){
        usbDetect.on('add', (device) =>{
            console.log('add', device);
            if(device.vendorId === 121){
                console.log("About to emit status");
                return this.emit('status',{state:'online'});
            }else{
                console.log('Not a joystick');
            }
        });
    }

    removal() {
        usbDetect.on('remove', (device) =>{
            console.log('remove', device);
            if(device.vendorId === 121){
                console.log("About to emit status");
                return this.emit('status',{state:'down'});
            }else{
                console.log('Not a joystick');
            }

        });
    }
    onExit(){
        usbDetect.stopMonitoring();
    }

};