const e = require("express");
const { Activity } = require("../models/index.model");

const logActivity = async (payload, transaction) => {
  const { user_id, entity_type, entity_id, action, description } = payload;

  // Debug để chắc chắn không bị undefined/null
  console.log("🔎 logActivity payload:", {
    user_id,
    entity_type,
    entity_id,
    action,
  });

  if (!user_id || !entity_type || !entity_id || !action) {
    throw new Error(
      "logActivity: missing required fields (user_id, entity_type, entity_id, action)"
    );
  }

  return Activity.create(
    { user_id, entity_type, entity_id, action, description },
    { transaction }
  );
};

module.exports = { logActivity };

