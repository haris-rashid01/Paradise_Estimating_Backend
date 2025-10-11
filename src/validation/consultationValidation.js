const Joi = require('joi');

const consultationValidation = Joi.object({
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

  projectType: Joi.string()
    .valid('residential', 'commercial', 'industrial', 'renovation', 'new-construction', 'other')
    .required()
    .messages({
      'any.only': 'Please select a valid project type',
      'any.required': 'Project type is required'
    }),

  budgetRange: Joi.string()
    .valid('under-50k', '50k-100k', '100k-250k', '250k-500k', '500k-1m', 'over-1m')
    .allow('', null)
    .optional()
    .messages({
      'any.only': 'Please select a valid budget range'
    }),

  preferredDate: Joi.date()
    .min('now')
    .required()
    .messages({
      'date.base': 'Please provide a valid date',
      'date.min': 'Preferred date must be in the future',
      'any.required': 'Preferred date is required'
    }),

  preferredTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid time in HH:MM format',
      'any.required': 'Preferred time is required'
    }),

  message: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Message cannot exceed 1000 characters'
    })
});

module.exports = {
  consultationValidation
};