const { error } = require('../utils/response');

// Central error handler. Registered last in the app.
// IMPORTANT: full details are logged to the terminal for debugging, but the
// client only ever receives a safe, generic message for unexpected (500) errors.
// Known/operational errors (validation 422, auth 401/403, 404, 409, etc.) keep
// their friendly message because the caller controls them.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Always log the full detail (message + stack) to the server terminal.
  console.error('\n[error]', err.message);
  if (err.stack) console.error(err.stack);
  if (err.code) console.error('[prisma] code:', err.code);

  const status = err.status || 500;

  // Operational errors: return their friendly, user-safe message.
  // Unexpected errors: never leak internals to the client.
  const message =
    status === 500
      ? 'Something went wrong. Please try again later.'
      : err.message || 'Something went wrong.';

  return error(res, status, message);
}

// 404 fallback for unknown routes.
function notFound(req, res) {
  return error(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

module.exports = { errorHandler, notFound };
