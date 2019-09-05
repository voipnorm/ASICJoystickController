"use strict";

const util = require("util");
const EventEmitter = require('events');
const HID = require('node-hid');
//var devices = HID.devices();
/*
var component;
var joyStick = [255,0];
var button = [47,31,143,79];
var currentState;
var prevState = [127,127,15];
*/


module.exports = class GameControls extends EventEmitter {

    constructor() {

        super();

        this.vendorId = 121;
        this.productId = 6;
        this.component ='';
        this.joyStick = [255, 0];
        this.button = [47, 31, 143, 79, 1, 2, 8, 4, 32, 16];
        this.currentState =[];
        this.prevState = [127, 127, 15, 0];
        this.device;
        this.launch();
    }

    launch() {
        try{
            console.log('Creating new HID instance');
            this.device = new HID.HID(this.vendorId, this.productId);
            this.poll();
        }catch(e){
            console.error(e);
            this.emit('status', {state:'down'});
        }
    }
    poll(){
        console.log("Starting Polling data");
        this.device.on("data", (data) => {
            //console.log(data);
            let dataArr = Array.prototype.slice.call(new Uint8Array(data, 0, 8));
            //build new array with data
            console.log(dataArr);
            const x = dataArr[0];
            const y = dataArr[1];
            const button = dataArr[5];
            const button2 = dataArr[6];

            const contArr = [x,y,button,button2];
            this.controller(contArr);
        })
        this.device.on('error', (err) => {
            console.error(err);
        })
    }
    controller(data) {
        this.currentState = data;
        const currentValue = this.currentState.reduce((a, b) => a + b, 0);
        const prevValue = this.prevState.reduce((a, b) => a + b, 0);

        if(currentValue != prevValue){
            this.prevState = this.currentState;
            if(currentValue === 269){
                return this.emit('status', {
                    device: this.component,
                    action: 'released'
                });
            }
            for(var i=0; i < this.currentState.length; i++){

                for(var j=0; j < this.joyStick.length; j++){

                    if(this.currentState[i]=== this.joyStick[j]){
                        return this.processJoyStick([i,this.joyStick[j]]);
                    }
                }
                if(i===2){
                    return this.processButton([this.currentState[i],this.currentState[3]]);
                }

            }
        }
        return;

    }
    processJoyStick(arr) {
        this.component = 'joystick';
        if(arr[0] === 0 ){
            if(arr[1] === 255){
                this.emit('status',{
                    device: 'joystick',
                    action:'right'
                });
            }else{
                this.emit('status',{
                    device : 'joystick',
                    action : 'left'
                })
            }
        }
        if(arr[0] === 1){
            if(arr[1] === 255){
                this.emit('status',{
                    device : 'joystick',
                    action : 'down'
                });
            }else{
                this.emit('status',{
                    device : 'joystick',
                    action : 'up'})
            }
        }
    }
    processButton(val) {
        console.log(val);
        var buttonVal = [
            'Top Left',
            'Bottom Left',
            'Top Right',
            'Bottom Right',
            'Top Middle',
            'Bottom Middle',
            'Top FarRight',
            'Bottom FarRight',
            'Top Side',
            'Bottom Side'
        ];

        this.component = 'button';

        for(var i=0; i < this.button.length; i++){

            for(var j=0; j < val.length; j++){

                if(this.button[i] === val[j]){
                    this.emit('status',{
                        device: buttonVal[i],
                        action : 'pressed'
                    })
                }
            }
        }

    }
    closeDevice(){
        this.device.close();
    }

};






