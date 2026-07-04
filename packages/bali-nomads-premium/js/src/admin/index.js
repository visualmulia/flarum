import app from 'flarum/admin/app';

app.initializers.add('visualmulia-bali-nomads-premium', () => {
  app.extensionData
    .for('visualmulia-bali-nomads-premium')
    .registerSetting({
      setting: 'visualmulia-bali-nomads-premium.require_phone',
      label: 'Require phone number for KYC verification',
      type: 'boolean'
    });
});
