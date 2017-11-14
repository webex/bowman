import {glob as _glob} from 'glob';
import denodeify from 'denodeify';

export {default as spawn} from './spawn';

export const glob = denodeify(_glob);
// eslint-disable-next-line object-curly-spacing
export * as git from './git';
