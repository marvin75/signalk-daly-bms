const path = require('path');
const { container } = require('webpack');
const { ModuleFederationPlugin } = container;
const pkg = require('./package.json');

const moduleName = pkg.name.replace(/[-@/]/g, '_');

module.exports = {
  mode: 'production',

  entry: './src/configpanel/index.js',

  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'bundle.js',
    clean: true
  },

  resolve: {
    extensions: ['.js']
  },

  plugins: [
    new ModuleFederationPlugin({
      name: moduleName,

      library: {
        type: 'var',
        name: moduleName
      },

      filename: 'remoteEntry.js',

      exposes: {
        './PluginConfigurationPanel':
          './src/configpanel/PluginConfigurationPanel.js'
      },

      shared: {
        react: {
          singleton: true
        },

        'react-dom': {
          singleton: true
        }
      }
    })
  ]
};
