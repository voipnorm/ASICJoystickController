"use strict";

const jsxapi = require('jsxapi');

let camera1active = false;

module.exports = class TPXapi {

    constructor(endpoint) {
        //super();

        this.xapi;

        this.fecc = 'false';

        this.endpoint = endpoint;

        this.connectedStatus = 'false';

        this.callID = 'unknown';

        this.callStatus = 'false';

        this.init();


    }

    init() {
        try {
            (async () => {
                await this.connect();
                await this.onReady();
                this.checkCallStatus();
            })();
        } catch (e) {
            console.error(e);
        }
    };

    connect() {
        return new Promise((resolve, reject) => {
            try {
                (async () => {
                    this.xapi = jsxapi.connect(`ssh://${this.endpoint.ipAddress || this.endpoint.url}`, {
                        username: this.endpoint.username,
                        password: this.endpoint.password,
                        keepaliveInterval: 4000,
                    }).on('error', (e) => this.sshError(e));
                    await this.onError();
                    resolve();
                })();
            } catch (e) {
                reject(e);
            }
        });
    };

    closeConnect() {
        return new Promise((resolve, reject) => {
            try {
                (async () => {
                    this.connectedStatus = 'false';
                    await this.xapi.close();
                    console.log(`connexion closed for ${this.endpoint.ipAddress || this.endpoint.url}`);
                    resolve();
                })();
            } catch (e) {
                reject(e);
            }
        });
    };

    checkCallStatus() {
        this.xapi.status.get('Call')
            .then((data) => {
                if(!data){
                    this.callStatus = 'false';
                    return;
                }else{
                    this.callID = data[0].id;
                    this.callStatus = 'true';
                    console.log(this.callID);
                }

            })
            .catch(e => {
                console.log(e);
            })
    }
    //if in a call set callID for possible FECC
    monitorCallStatus() {
        this.xapi.status.on('Call', (data) => {
            console.log(JSON.stringify(data));
            this.callID = data.id;
            this.callStatus = 'true';
            console.log(this.callID);
        })
        this.xapi.event.on('CallDisconnect', (data) => {
            console.log(JSON.stringify(data));
            this.callID = 'unknown';
            this.callStatus = 'false';
            console.log(this.callStatus);
        })

    }

    //decide if in local or remote mode, remote mode only available in a call
    localRemote(data) {
        if (data.device === 'Top Right'&& data.action === 'pressed') {
            console.log("FECC mode off");
            this.fecc = "false";
            return this.xapi.command('UserInterface Message Alert Display', {
                Title: "FECC ALERT",
                Text: "Far End Camera Control has been disabled. Local camera control mode.",
                Duration: "10",
            })
        }
        if (data.device === 'Bottom Right'&& data.action === 'pressed') {
            if (this.callStatus === 'true') {
                console.log("FECC mode on");
                this.fecc = "true";
                return this.xapi.command('UserInterface Message Alert Display', {
                    Title: "FECC ALERT",
                    Text: "Far End Camera Control is now enabled during this video call.",
                    Duration: "10",
                })
                    .then(() => {
                        return console.log("FECC Alert. No call available");
                    })
                    .catch(err => console.error(err));
            } else {
                return this.xapi.command('UserInterface Message Alert Display', {
                    Title: "FECC ALERT",
                    Text: "Far End Camera Control is only available during a video call.",
                    Duration: "10",
                })
                    .then(() => {
                        return console.log("FECC Alert. No call available");
                    })
                    .catch(err => console.error(err));
            }

        }
        if (this.fecc === 'true') {
            //FECC commands invoked control remote camera
            if (data.device === 'joystick') {
                console.log("Joystick remote mode command issued");
                this.joyStickRemote(data.action)
            } else {
                console.log("Buttons remote mode command issued");
                this.buttonsRemote(data);
            }
        } else {
            //local mode only adjust camera attached to codec
            if (data.device === 'joystick') {
                console.log("Joystick local mode command issued");
                this.joyStickLocal(data.action)
            } else {
                console.log("Buttons local mode command issued");
                this.buttonsLocal(data);
            }
        }
    }
    //joystick commands for local
    joyStickLocal(action) {
        if(action === 'released'){
            return this.xapi.command("Camera Ramp", {CameraId: 1, Tilt: 'Stop',Pan: 'Stop'})
                .catch(e => console.error(e));
        }else if(action === 'up'||action==='down'){
            return this.xapi.command("Camera Ramp", {CameraId: 1, Tilt: action})
                .catch(e => console.error(e));
        }else{
            return this.xapi.command("Camera Ramp", {CameraId: 1, Pan: action})
                .catch(e => console.error(e));
        }

    }
    //joystick remote commands
    joyStickRemote(action) {
        if(action === 'released'){
            this.xapi.command("Call FarEndControl Camera Stop",{CallId: this.callID})
                .catch(e => console.error(e));
        }else{
            this.xapi.command('Call FarEndControl Camera Move', {CallId: this.callID, Value: action})
                .catch(e => console.error(e));
        }
    }
    //local button commands
    buttonsLocal(btn) {

        switch (btn.action) {
            case 'pressed':
                //Zoom in
                if (btn.device === "Top Left") {
                    return this.xapi.command('Camera Ramp ', {CameraId: 1, Zoom: 'In'})
                        .catch(e => console.error(e));
                }
                if(btn.device === "Bottom Left") {
                    return this.xapi.command('Camera Ramp ', {CameraId: 1, Zoom: 'Out'})
                        .catch(e => console.error(e));
                }else{
                    return this.xapi.command('UserInterface Message Alert Display', {
                        Title: "Button ALERT",
                        Text: "Preset Buttons are only available during a video call to control the remote endpoint.",
                        Duration: "10",
                    })
                        .then(() => {
                            return console.log("FECC Alert. No call available");
                        })
                        .catch(err => console.error(err));
                }
                break;
            case 'released':
                this.xapi.command("Camera Ramp", {CameraId: 1, Zoom: 'Stop'})
                    .catch(e => console.error(e));
                break;
            default:
                break;
        }

    }
    //Remote button commands
    buttonsRemote(btn) {

        switch (btn.action) {
            case 'pressed':
                //Zoom in
                if (btn.device === "Top Left") {
                    return this.xapi.command('Call FarEndControl Camera Move', {CallId: this.callID, Value: 'ZoomIn'})
                        .catch(e => console.error(e));
                }
                if(btn.device === "Bottom Left"){
                    return this.xapi.command('Call FarEndControl Camera Move', {CallId: this.callID, Value: 'ZoomOut'})
                        .catch(e => console.error(e));
                } else {
                    console.log("Preset buttons pressed "+JSON.stringify(btn));
                    this.presetsRemote(btn);
                }
                break;
            case 'released':
                this.xapi.command('Call FarEndControl Camera Stop', {CallId: this.callID})
                    .catch(e => console.error(e));
                break;

            default:
                break;
        }
    }
    presetsRemote(btn){
        let buttonVal = [
            {device:'Top Middle', preset:1},
            {device:'Bottom Middle', preset:2},
            {device:'Top FarRight', preset:3},
            {device:'Bottom FarRight', preset: 4},
            {device:'Top Side', preset: 5},
            {device:'Bottom Side', preset: 6},
        ];
        for (var i = 0; i < buttonVal.length; i++) {
            if (buttonVal[i].device === btn.device) {
                this.xapi.command('Call FarEndControl RoomPreset Activate', {CallId: this.callID, PresetId: buttonVal[i].preset})
                    .then(response => console.log("This is the response",response))
                    .catch(e => console.error(e));

                console.log("Match preset "+buttonVal[i].preset);

            }

        }



    }
    //Setup functions and Events to monitor from endpoint
    onReady() {
        this.xapi.on('ready', () => {
            console.log(`connexion successful for ${this.endpoint.ipAddress || this.endpoint.url}`);
            this.connectedStatus = 'true';
            this.monitorCallStatus();
            return this;
        });
    };

    //Correct errors with connections to endpoint
    onError() {
        this.xapi.on('error', (err) => {
            if (err === 'client-socket' || err === 'client-timeout') {
                console.log(`Error handled by SSH: ${err}`);
            } else {
                try {
                    (async () => {
                        console.error(`Endpoint error for ${this.endpoint.ipAddress || this.endpoint.url}: ${err}`);
                        await this.closeConnect();
                        setTimeout(() => {
                            console.log(`resetting connection for ${this.endpoint.ipAddress || this.endpoint.url}`);
                            this.init();
                        }, 40000);
                    })();
                } catch (e) {
                    console.error(e);
                }
            }
        });
    };

    sshError(e) {
        if (e === 'client-socket' || e === 'client-timeout') {
            try {
                (async () => {
                    console.error(`sshEndpoint error for ${this.endpoint.ipAddress || this.endpoint.url}: ${e}`);
                    await this.closeConnect();
                    setTimeout(() => {
                        console.log(`resetting connection for ${this.endpoint.ipAddress || this.endpoint.url}`);
                        this.init();
                    }, 40000);
                })();
            } catch (e) {
                console.error(e);
            }
        } else {
            console.error(e);
        }

    };
};