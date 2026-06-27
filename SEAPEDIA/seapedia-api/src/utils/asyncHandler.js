// Membungkus controller async: error yang dilempar (atau promise yang
// reject) otomatis diteruskan ke middleware errorHandler lewat next(err),
// jadi setiap controller tidak perlu nulis try/catch sendiri-sendiri.
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
