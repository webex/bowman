import chalk from 'chalk';
import debug from 'debug';

/**
 * Wrapper around debug to ensure consistent namespacing
 * @param {string} filename
 * @returns {Function}
 */
export function makeDebug(filename) {
  return debug(`bowman${filename
    .split('bowman/src')[1]
    .replace(/\//g, ':')
    .replace(/.js$/, '')}`);

}

/**
 * Use chalk to colorize a packageName
 * @param {string} packageName
 * @returns {string}
 */
export function colorizePackageName(packageName) {
  return chalk.blue(packageName);
}

/**
 * Use chalk to colorize a filename
 * @param {string} filename
 * @returns {string}
 */
export function colorizeFileName(filename) {
  return chalk.red(filename);
}

/**
 * Use chalk to colorize a number
 * @param {string} number
 * @returns {string}
 */
export function colorizeNumber(number) {
  return chalk.green(number);
}

/**
 * Use chalk to colorize an arbitrary variable
 * @param {string} variable
 * @returns {string}
 */
export function formatVariable(variable) {
  return chalk.grey(variable);
}

export {formatVariable as v};
