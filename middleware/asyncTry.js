/**
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise} func
 */
function asyncTry(func) {
  /** @type {(req: import('express').Request, res: import('express').Response) => void} */
  return function asyncTry(req, res, next) {
    func(req, res)
      .then(next)
      .catch(err => {
        const code = err.status || err.statusCode;
        if (res.headersSent) {
          res.end(err.message);
        } else if (code !== undefined) {
          res.sendStatus(code);
        } else {
          res.status(500).send(err.message);
        }
      });
  };
}

module.exports = asyncTry;
