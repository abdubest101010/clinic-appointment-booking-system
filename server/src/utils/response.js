// Small helpers to keep controller responses consistent across the API.

function ok(res, data, message = 'Success') {
  return res.status(200).json({ success: true, message, data });
}

function created(res, data, message = 'Created') {
  return res.status(201).json({ success: true, message, data });
}

function error(res, status, message, details = null) {
  return res.status(status).json({ success: false, message, details });
}

module.exports = { ok, created, error };
