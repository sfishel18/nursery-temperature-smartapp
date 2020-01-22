const SmartApp = require('@smartthings/smartapp');

const { NODE_ENV } = process.env;

const smartapp = new SmartApp()
  .publicKey('@smartthings_rsa.pub')
  .configureI18n()
  .page('mainPage', (context, page, configData) => {
    page.section('tempSensor', section => {
      section
        .deviceSetting('tempSensor')
        .capabilities(['temperatureMeasurement'])
        .required(true)
        .permissions('r');
      section
        .numberSetting('setPoint')
        .required(true);
    });
    page.section('thermostat', section => {
      section
        .deviceSetting('thermostat')
        .capabilities(['switch'])
        .permissions('rx')
        .required(true);
    });
  })
  .updated(async (context, updateData) => {
    await context.api.subscriptions.unsubscribeAll()
    return context.api.subscriptions.subscribeToDevices(context.config.tempSensor, 'temperatureMeasurement', 'temperature', 'myDeviceEventHandler');
  })
  .subscribedEventHandler('myDeviceEventHandler', async (context, event) => {
    const temp = event.value;
    const { thermostat, setPoint } = context.config;
    const thermostatId = thermostat && thermostat.length > 0 && thermostat[0].deviceConfig.deviceId;
    if (thermostatId) {
        const fanState = await context.api.devices.getAttributeValue(thermostatId, 'switch', 'switch');
        if (temp > setPoint && fanState === 'off') {
          console.log('[LOOK HERE] Turning the fan on because the temp is', temp);
          return context.api.devices.sendCommands(thermostat, 'switch', 'on');
        } 
        if (temp < setPoint && fanState === 'on') {
          console.log('[LOOK HERE] Turning the fan off because the temp is', temp);
          return context.api.devices.sendCommands(thermostat, 'switch', 'off');
        }
    }
  });

if (NODE_ENV !== 'production') {
    smartapp.enableEventLogging(2);
}

exports.index = (req, res) => {
  req.url = '/st-handler';
  smartapp.handleHttpCallback(req, res);
};
