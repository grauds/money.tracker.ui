import baseConfig from '../../eslint.config.mjs';
import eslintPluginHtml from 'eslint-plugin-html';

export default [...baseConfig, { plugins: { html: eslintPluginHtml } }];
