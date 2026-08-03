export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export const route = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function errorHandler(err, _req, res, _next) {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: err.message || "Something went wrong on our side.",
    detail: err.detail,
  });
}
