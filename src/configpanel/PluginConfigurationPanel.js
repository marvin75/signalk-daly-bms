const React = require('react');
const { useState } = React;

const h = React.createElement;

function PluginConfigurationPanel({
  configuration = {},
  save
}) {
  const legacyBatteries =
    Array.isArray(configuration.batteries) &&
    configuration.batteries.length
      ? configuration.batteries
      : configuration.device
        ? [
            {
              device:
                configuration.device,

              name: '',

              batteryId:
                configuration.batteryId ||
                'house'
            }
          ]
        : [];

  const [config, setConfig] =
    useState({
      batteries:
        legacyBatteries.map(
          battery => ({
            device:
              battery.device || '',

            name:
              battery.name || '',

            batteryId:
              battery.batteryId || ''
          })
        ),

      pollInterval:
        configuration.pollInterval || 5,

      publishBasic:
        configuration.publishBasic !== false,

      publishCells:
        configuration.publishCells !== false,

      publishTemperatures:
        configuration.publishTemperatures !== false,

      publishStatus:
        configuration.publishStatus !== false,

      publishCapacity:
        configuration.publishCapacity !== false,

      publishBalancing:
        configuration.publishBalancing !== false,

      publishAlarms:
        configuration.publishAlarms !== false
    });

  const [devices, setDevices] =
    useState([]);

  const [scanning, setScanning] =
    useState(false);

  const [scanMessage, setScanMessage] =
    useState('');

  const [selectedDevice, setSelectedDevice] =
    useState('');

  const [customMac, setCustomMac] =
    useState('');

  const [newBatteryId, setNewBatteryId] =
    useState('');

  function update(key, value) {
    setConfig(old => ({
      ...old,
      [key]: value
    }));
  }

  function updateBattery(
    index,
    key,
    value
  ) {
    setConfig(old => {
      const batteries =
        [...old.batteries];

      batteries[index] = {
        ...batteries[index],
        [key]: value
      };

      return {
        ...old,
        batteries
      };
    });
  }

  function removeBattery(index) {
    setConfig(old => ({
      ...old,

      batteries:
        old.batteries.filter(
          (_, i) => i !== index
        )
    }));
  }

  async function scan() {
    setScanning(true);

    setScanMessage(
      'Scanning for Daly BMS devices...'
    );

    try {
      const response =
        await fetch(
          '/plugins/signalk-daly-bms/scan',
          {
            credentials: 'include'
          }
        );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        );
      }

      const result =
        await response.json();

      const found =
        result.devices || [];

      setDevices(found);

      if (found.length) {
        setSelectedDevice(
          found[0].address
        );

        setScanMessage(
          `Found ${found.length} Daly BMS device(s)`
        );
      } else {
        setSelectedDevice(
          '__custom__'
        );

        setScanMessage(
          'No Daly BMS devices found'
        );
      }

    } catch (err) {
      setScanMessage(
        `Scan failed: ${err.message}`
      );

    } finally {
      setScanning(false);
    }
  }

  function addDevice() {
    const device =
      selectedDevice === '__custom__'
        ? customMac.trim()
        : selectedDevice;

    if (!device) {
      setScanMessage(
        'Select a Daly device or enter a custom MAC'
      );
      return;
    }

    const batteryId =
      newBatteryId.trim();

    if (!batteryId) {
      setScanMessage(
        'Enter Battery ID before adding the device'
      );
      return;
    }

    const duplicateDevice =
      config.batteries.some(
        battery =>
          battery.device
            .toUpperCase() ===
          device.toUpperCase()
      );

    if (duplicateDevice) {
      setScanMessage(
        'That Daly device is already configured'
      );
      return;
    }

    const duplicateId =
      config.batteries.some(
        battery =>
          battery.batteryId ===
          batteryId
      );

    if (duplicateId) {
      setScanMessage(
        'That Battery ID is already in use'
      );
      return;
    }

    const found =
      devices.find(
        item =>
          item.address === device
      );

    setConfig(old => ({
      ...old,

      batteries: [
        ...old.batteries,

        {
          device,

          name:
            found
              ? found.name
              : '',

          batteryId
        }
      ]
    }));

    setNewBatteryId('');

    setScanMessage(
      `Added ${found ? found.name : device}`
    );
  }

  function handleSave() {
    const cleaned = {
      ...config,

      batteries:
        config.batteries
          .map(battery => ({
            device:
              String(
                battery.device || ''
              ).trim(),

            name:
              String(
                battery.name || ''
              ).trim(),

            batteryId:
              String(
                battery.batteryId || ''
              ).trim()
          }))
          .filter(
            battery =>
              battery.device &&
              battery.batteryId
          )
    };

    save(cleaned);
  }

  const inputStyle = {
    width: '100%',
    maxWidth: '550px',
    padding: '8px',
    marginTop: '5px'
  };

  const smallInputStyle = {
    width: '260px',
    padding: '8px'
  };

  const labelStyle = {
    display: 'block',
    fontWeight: '600',
    marginBottom: '4px'
  };

  const sectionStyle = {
    marginBottom: '24px'
  };

  const publishedOptions = [
    [
      'publishBasic',
      'Basic battery data'
    ],

    [
      'publishCells',
      'Cell voltages'
    ],

    [
      'publishTemperatures',
      'Temperatures'
    ],

    [
      'publishStatus',
      'MOSFET / status'
    ],

    [
      'publishCapacity',
      'Capacity / cycles'
    ],

    [
      'publishBalancing',
      'Balancing'
    ],

    [
      'publishAlarms',
      'Alarms / errors'
    ]
  ];

  return h(
    'div',
    {
      style: {
        maxWidth: '850px'
      }
    },

    h(
      'div',
      {
        style: sectionStyle
      },

      h(
        'label',
        {
          style: labelStyle
        },
        'Configured Daly devices'
      ),

      config.batteries.length === 0
        ? h(
            'div',
            {
              style: {
                marginBottom: '10px'
              }
            },
            'No Daly devices configured.'
          )
        : null,

      ...config.batteries.map(
        (battery, index) =>
          h(
            'div',
            {
              key:
                `${battery.device}-${index}`,

              style: {
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '10px',
                padding: '10px',
                border:
                  '1px solid #ccc'
              }
            },

            h(
              'div',
              {
                style: {
                  flex: '1'
                }
              },

              h(
                'div',
                {
                  style: {
                    fontWeight: '600'
                  }
                },

                battery.name
                  ? `${battery.name} (${battery.device})`
                  : battery.device
              )
            ),

            h('input', {
              style:
                smallInputStyle,

              type: 'text',

              value:
                battery.batteryId,

              placeholder:
                'house.balancer',

              onChange: e =>
                updateBattery(
                  index,
                  'batteryId',
                  e.target.value
                )
            }),

            h(
              'button',
              {
                type: 'button',

                onClick: () =>
                  removeBattery(index),

                style: {
                  padding:
                    '8px 12px'
                }
              },
              'Remove'
            )
          )
      )
    ),

    h(
      'div',
      {
        style: sectionStyle
      },

      h(
        'label',
        {
          style: labelStyle
        },
        'Add Daly Bluetooth device'
      ),

      h(
        'button',
        {
          type: 'button',

          onClick: scan,

          disabled:
            scanning,

          style: {
            padding:
              '8px 18px',
            marginBottom:
              '10px'
          }
        },

        scanning
          ? 'Scanning...'
          : 'Scan'
      ),

      devices.length > 0
        ? h(
            'div',
            {
              style: {
                marginBottom:
                  '10px'
              }
            },

            h(
              'select',
              {
                style:
                  inputStyle,

                value:
                  selectedDevice,

                onChange: e =>
                  setSelectedDevice(
                    e.target.value
                  )
              },

              ...devices.map(
                device =>
                  h(
                    'option',
                    {
                      key:
                        device.address,

                      value:
                        device.address
                    },

                    `${device.name} (${device.address})`
                  )
              ),

              h(
                'option',
                {
                  value:
                    '__custom__'
                },
                'Custom MAC'
              )
            )
          )
        : null,

      (
        selectedDevice ===
        '__custom__'
      )
        ? h(
            'input',
            {
              style:
                inputStyle,

              type:
                'text',

              value:
                customMac,

              placeholder:
                'XX:XX:XX:XX:XX:XX',

              onChange: e =>
                setCustomMac(
                  e.target.value
                )
            }
          )
        : null,

      (
        devices.length > 0 ||
        selectedDevice ===
          '__custom__'
      )
        ? h(
            'div',
            {
              style: {
                display: 'flex',
                gap: '8px',
                alignItems:
                  'center',
                marginTop:
                  '10px'
              }
            },

            h('input', {
              style:
                smallInputStyle,

              type:
                'text',

              value:
                newBatteryId,

              placeholder:
                'Battery ID, e.g. house.balancer',

              onChange: e =>
                setNewBatteryId(
                  e.target.value
                )
            }),

            h(
              'button',
              {
                type:
                  'button',

                onClick:
                  addDevice,

                style: {
                  padding:
                    '8px 18px'
                }
              },
              'Add'
            )
          )
        : null,

      scanMessage
        ? h(
            'div',
            {
              style: {
                marginTop:
                  '8px'
              }
            },
            scanMessage
          )
        : null
    ),

    h(
      'div',
      {
        style:
          sectionStyle
      },

      h(
        'label',
        {
          style:
            labelStyle
        },
        'Poll interval'
      ),

      h('input', {
        style: {
          ...inputStyle,
          maxWidth:
            '120px'
        },

        type:
          'number',

        min:
          1,

        max:
          60,

        value:
          config.pollInterval,

        onChange: e =>
          update(
            'pollInterval',
            Number(
              e.target.value
            )
          )
      }),

      h(
        'span',
        {
          style: {
            marginLeft:
              '8px'
          }
        },
        'seconds'
      )
    ),

    h(
      'div',
      {
        style:
          sectionStyle
      },

      h(
        'label',
        {
          style:
            labelStyle
        },
        'Published data'
      ),

      ...publishedOptions.map(
        ([key, title]) =>
          h(
            'label',
            {
              key,

              style: {
                display:
                  'block',

                margin:
                  '7px 0'
              }
            },

            h('input', {
              type:
                'checkbox',

              checked:
                config[key],

              onChange: e =>
                update(
                  key,
                  e.target.checked
                )
            }),

            h(
              'span',
              {
                style: {
                  marginLeft:
                    '8px'
                }
              },
              title
            )
          )
      )
    ),

    h(
      'button',
      {
        type:
          'button',

        onClick:
          handleSave,

        style: {
          padding:
            '9px 22px',

          fontWeight:
            '600'
        }
      },
      'Save'
    )
  );
}

module.exports =
  PluginConfigurationPanel;

module.exports.default =
  PluginConfigurationPanel;
