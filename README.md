# signalk-daly-bms-ble

Signal K plugin for Daly Smart BMS devices over Bluetooth LE.

## Features

- Reads Daly Smart BMS data over BLE
- Supports multiple Daly devices
- BLE scan from the Signal K plugin configuration
- Manual MAC address configuration
- Publishes battery data to Signal K
- Individual cell voltages
- Temperatures
- SOC, voltage, current and power
- MOSFET and BMS status
- Remaining capacity and cycle count
- Balancing status
- Alarm/error status
- Automatic reconnect

## Signal K paths

Each Daly device is assigned a Battery ID.

Examples:

    house
    house.balancer
    starter.balancer

These result in paths such as:

    electrical.batteries.house.voltage
    electrical.batteries.house.cells.1.voltage
    electrical.batteries.house.balancer.voltage
    electrical.batteries.house.balancer.cells.1.voltage

## Installation

This project is currently under development.

Requirements:

- Signal K Server
- Linux with BlueZ
- Node.js 22 or newer
- Bluetooth LE adapter
- Daly Smart BMS with BLE

## Development

Install dependencies:

    npm install

Build the Signal K configuration UI:

    npm run build

## Configuration

Open Signal K Admin and go to:

    Server -> Plugin Config -> Daly BMS

Use **Scan** to discover Daly BLE devices.

Each device needs a unique Battery ID.

The Battery ID may contain dots, for example:

    house.balancer

A custom Bluetooth MAC address can also be entered manually.

## Status

Early development version.

Tested with Daly BLE protocol commands 0x90-0x98.

## License

MIT
