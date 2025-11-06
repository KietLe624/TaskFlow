const e = require("express");
const { Activity } = require("../models/index.model");

const logActivity = async ({
  userId,
  entityType,
  entityId,
  action,
  description,
  tx,
}) => {
  return Activity.create(
    {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId,
      action,
      description: description ?? null,
    },
    { transaction: tx }
  );
};

module.exports = {
  logActivity,
};
