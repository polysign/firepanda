import { Config } from '@stencil/core';
import { postcss } from '@stencil/postcss';
import { sass } from '@stencil/sass';

export const config: Config = {
  globalStyle: 'src/global/app.css',
  globalScript: 'src/global/app.ts',
  plugins: [
    sass(),
    postcss()
  ],
  outputTargets: [
    {
      type: 'www',
      dir: '../../lib/web',
      serviceWorker: null,
      baseUrl: 'https://myapp.local/'
    }
  ]
};
