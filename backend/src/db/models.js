const mongoose = require('mongoose');
const { dbConn } = require('./connect');

const entitySchema = new mongoose.Schema({
  entityName: String,
  VATIN: String,
  statisticalNumber: String,
  courtRegisterNumber: String,
  street: String,
  postalCode: String,
  city: String,
  country: String,
  www: String,
  email: String,
});

entitySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, unique: true },
  hash: { type: String, required: true },

  roles: { type: [String], required: true, default: ['basic'] },

  entity: { type: entitySchema, required: true, default: {} },

  code: String,

  jobTitle: String,

  agreedToMarketingCommunication: Boolean,
  agreedToPersonalDataProcessing: Boolean,
});

userSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const User = dbConn.model('User', userSchema);

const clientSchema = new mongoose.Schema({
  owner: { type: String, required: true, index: true },

  entity: { type: entitySchema, required: true, default: {} },

  entityType: String,
  entitySubtype: String,
  employeeCount: Number,
  contractorCount: Number,
});

clientSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

const Client = dbConn.model('Client', clientSchema);

module.exports = { User, Client };
