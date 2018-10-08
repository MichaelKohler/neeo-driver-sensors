NEEO Sensors - Add as textlabel
=====

**Disclaimer: don't even try, it won't work yet ;)**

This "driver" searches for all configured sensors in the NEEO project and exposes them as regularly updating text labels to show them on shortcut pages.

**Note:** This currently does not work with the current public SDK release. It will work with > 0.52.0.

Setup
-----

For now, you need to specify your BRAIN_IP in the configuration file. Copy the sample and adjust it:

```
$ cp config.sample.json config.json
```

Alternatively you can use the BRAIN_IP environment variable.

```
$ npm install
```

Run locally
-----

```
$ DEBUG=neeo:* BRAIN_IP=YOUR_BRAIN_IP npm start
```

Run in production (not yet implemented)
-----

```
$ npm install -g @neeo/cli
$ npm install neeo-driver-sensors
$ neeo-cli start
```
