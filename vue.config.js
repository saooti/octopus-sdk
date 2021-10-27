/* eslint-disable */
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');

module.exports = {
  configureWebpack: {
      output: {
          globalObject: 'this',
      },
      plugins:[
        new MomentLocalesPlugin({
            localesToKeep: ['fr'],
        }),
      ],
  },
};
/* eslint-enable */