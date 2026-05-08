// Single import surface for all Mongoose models. Importing this file ensures
// every model is registered before connectMongo() resolves the first query
// that uses populate() across collections.
export { default as Hospital } from './Hospital';
export { default as Department } from './Department';
export { default as Staff, deriveStaffType } from './Staff';
export { default as Schedule } from './Schedule';
export { default as Assignment } from './Assignment';
