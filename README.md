# ASIC_VideoEndpoint_Joystick

Joystick camera control for Cisco CE video devices used in Telehealth

# Business/Technical Challenge

Local and far end camera control are very common features used in the healthcare industries with video endpoints such as the Webex Room Kit.This is used in telehealth cases where the patient is remote from the caregiver and the caregiver is trying to zoom in on the patient over the video call. Cisco video endpoints require the use of a touch 10 controller to perform this function. For a caregiver this can be difficult to operate. Adding the capability of a Joystick to operate camera control will not only simplify the user experience but enhance it by providing a more granular control of both near and far end cameras.

Although there are solutions available today to do camera control using a joystick they are costly to provided and require complex network setups beyond that of the video endpoints themselves.

# Proposed Solution

Our solution encompass a low cost hardware joystick leveraging the video endpoint APIs removing the requirement to build a separate camera control network to add joystick capabilities. All camera control would be across call signaling between the Cisco video endpoints.

# Cisco Products Technologies/ Services

Our solution will levegerage the following technologies

    Cisco Webex Room Devices
    Cisco Webex Cloud
    Cisco Webex Room API's
    Joystick hardware available on Amazon
    Raspberry PI
    Nodejs

# Team Members

    Steve Greenberg stgreenb@cisco.com - America's Partner Org
    Chris Norman christno@cisco.com - Enterprise

# Solution Components
# Usage

# Installing and using this project
There are a number of steps to installing and using this project successfully:

1. Purchase parts
2. Install your PI and Joystick components
3. Installing NodeJS and Node HID
4. Installing PM2 to monitor and restart your project should a failure occur.

* Installing and setting up NodeJs on a PI:
https://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/#apply-updates

* Installing and compiling from source Node-HID on a Raspberry PI:
https://github.com/node-hid/node-hid#compiling-from-source

* Installing PM2 for continued monitoring and restarting application after a error:
http://pm2.keymetrics.io/

* Enabling PM2 to restart your application after a machine restart:
https://pm2.io/doc/en/runtime/guide/startup-hook/?utm_source=pm2&utm_medium=website&utm_campaign=rebranding


* Installing Node-USB-Detection
https://github.com/MadLittleMods/node-usb-detection


# Documentation

Pointer to reference documentation for this project.
# License

Provided under Cisco Sample Code License, for details see LICENSE

# Code of Conduct

Our code of conduct is available here

# Contributing

See our contributing guidelines here

