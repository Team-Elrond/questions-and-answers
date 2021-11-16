/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise} func
 * @returns {(req: import('express').Request, res: import('express').Response) => void}
 */
function asyncTry(func) {
  return function asyncTry(req, res, next) {
    func(req, res)
      .then(next)
      .catch(err => {
        const code = err.status || err.statusCode;
        if (code !== undefined) {
          res.sendStatus(code);
        } else {
          next(err);
        }
      });
  };
}

module.exports = asyncTry;
