/**
 * Checks if a value is empty
 * @param {*} value - The value to check
 * @returns {boolean} - Returns true if the value is considered empty
 */
const isEmpty = (value) => {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "object" && Object.keys(value).length === 0) ||
    (typeof value === "string" && value.trim().length === 0)
  );
};

export default isEmpty;
