/**
 * @param {Object} parsed
 * @param {string} key
 * @param {number=} def - default
 */
function getInt(parsed, key, def) {
  const sVal = parsed[key];
  if (sVal === undefined) {
    if (def === undefined) {
      const err = new Error(`${key} is required`);
      err.status = 400;
      throw err;
    }
    return def;
  }
  const nVal = Number(sVal);
  if (Number.isInteger(nVal)) {
    return nVal;
  }
  const err = new Error(`${key} must be an integer`);
  err.status = 400;
  throw err;
}

/**
 * @param {Object} parsed
 * @param {string} key
 * @param {string=} def - default
 */
function getString(parsed, key, def) {
  const val = parsed[key];
  if (val === undefined) {
    if (def === undefined) {
      const err = new Error(`${key} is required`);
      err.status = 400;
      throw err;
    }
    return def;
  }
  if (typeof val === 'string') {
    return val;
  }

  const err = new Error(`${key} must be a string`);
  err.status = 400;
  throw err;
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function requestParser(req, res, next) {
  req.queryInt = function queryInt(key, def) {
    return getInt(req.query, key, def);
  };
  req.paramInt = function paramInt(key, def) {
    return getInt(req.params, key, def);
  };
  req.bodyInt = function bodyInt(key, def) {
    return getInt(req.body, key, def);
  };

  req.queryString = function queryString(key, def) {
    return getString(req.query, key, def);
  };
  req.paramString = function paramString(key, def) {
    return getString(req.params, key, def);
  };
  req.bodyString = function bodyString(key, def) {
    return getString(req.body, key, def);
  };

  next();
}

module.exports = requestParser;
