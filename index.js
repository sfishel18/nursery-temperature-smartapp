const SmartApp = require('@smartthings/smartapp');

const smartapp = new SmartApp()
  .publicKey('@smartthings_rsa.pub')
  .enableEventLogging(2) // logs all lifecycle event requests and responses as pretty-printed JSON. Omit in production
  .configureI18n()
  .page('mainPage', (context, page, configData) => {
    page.section('sensors', section => {
      section
        .deviceSetting('contactSensor')
        .capabilities(['contactSensor'])
        .required(false);
    });
    page.section('lights', section => {
      section
        .deviceSetting('lights')
        .capabilities(['switch'])
        .multiple(true)
        .permissions('rx');
    });
  });

exports.index = (req, res) => {
  req.url = '/st-handler';
  smartapp.handleHttpCallback(req, res);
};
