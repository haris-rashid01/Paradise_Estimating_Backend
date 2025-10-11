const Joi = require('joi');

const contactValidation = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 255 characters'
    }),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[0-9][\d\s\-\(\)]{0,20}$/)
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  company: Joi.string()
    .trim()
    .max(255)
    .allow('')
    .messages({
      'string.max': 'Company name cannot exceed 255 characters'
    }),

  trade: Joi.string()
    .trim()
    .max(255)
    .allow('')
    .messages({
      'string.max': 'Trade service cannot exceed 255 characters'
    }),

  message: Joi.string()
    .trim()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Message is required',
      'string.min': 'Message must be at least 10 characters long',
      'string.max': 'Message cannot exceed 2000 characters'
    })
});

module.exports = {
  contactValidation
};