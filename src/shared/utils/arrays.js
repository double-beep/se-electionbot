/**
 * @template {unknown} T
 *
 * @summary checks if item is in the array
 * @param {T[]} arr
 * @param {unknown} item
 * @returns {item is T}
 */
export const isOneOf = (arr, item) => arr.some((e) => e === item);

/**
 * @template {any[]} T
 * @param {T} arr
 * @returns {T[number]|undefined}
 */
export const last = (arr) => arr[arr.length - 1];

/**
 * @template {object} T
 * @template {keyof T} U
 *
 * @summary converts an array to a map keyed on one of the object values
 * @param {T[]} array array to convert
 * @param {U} key key to index the map on
 * @returns {Map<T[U], T>}
 */
export const mapify = (array, key) => {
    const map = new Map();
    array.forEach((elem) => map.set(elem[key], elem));
    return map;
};

/**
 * @summary flattens an array
 * @param {Array<any>} array
 * @returns {Array<any>}
 */
export const flat = (array) => {
    const flattened = /** @type {any[]} */ ([]);
    array.forEach((el) => {
        Array.isArray(el) ?
            flattened.push(...flat(el)) :
            flattened.push(el);
    });
    return flattened;
};

/**
 * @template {unknown} T
 *
 * @summary truthy filter with type guard
 * @param {T} item item to check
 * @returns {item is Exclude<T, 0|""|null|false|undefined>}
 */
export const onlyTruthy = (item) => !!item;

/**
 * @template {unknown} T
 *
 * @summary returns only unique array elements
 * @param {Array<T>} array {@link Array} to uniquify
 * @returns {Array<T>}
 */
export const uniquify = (array) => [...new Set(array)];