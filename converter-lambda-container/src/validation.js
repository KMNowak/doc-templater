const Joi = require('joi');

const fileNameRegex = /[^\/].*/

const paramsSchema = Joi.object({
  sourceBucketName: Joi.string().required(),
  targetBucketName: Joi.string().required(),
  fileName: Joi.string().regex(fileNameRegex).required(),
  ACL: Joi.string().allow('public-read', 'private', 'public-read-write').optional(),
});

module.exports = {
  paramsSchema,
};
