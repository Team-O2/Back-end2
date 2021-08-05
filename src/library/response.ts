export const response = (res, status, message) => {
  res.status(status).json({
    status: status,
    message: message,
  });
};

export const dataResponse = (res, status, message, data) => {
  res.status(status).json({
    status: status,
    message: message,
    data: data,
  });
};

export const tokenResponse = (res, status, message, token) => {
  res.status(status).json({
    status: status,
    message: message,
    token: token,
  });
};

export const dataTokenResponse = (res, status, message, data, token) => {
  res.status(status).json({
    status: status,
    message: message,
    data: data,
    token: token,
  });
};
