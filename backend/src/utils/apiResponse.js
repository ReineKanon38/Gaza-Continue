export const sendSuccess = (res, {
  status = 200,
  message,
  data,
  ...rest
} = {}) => {
  const payload = {
    success: true,
    ...(message ? { message } : {}),
    ...(data !== undefined ? { data } : {}),
    ...rest
  };

  return res.status(status).json(payload);
};

export const sendError = (res, {
  status = 500,
  message = 'Error interno del servidor',
  error,
  ...rest
} = {}) => {
  const payload = {
    success: false,
    message,
    ...(error ? { error } : {}),
    ...rest
  };

  return res.status(status).json(payload);
};
