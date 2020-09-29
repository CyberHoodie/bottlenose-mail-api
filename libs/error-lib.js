export class NotFoundError extends Error {
  statusCode;

  constructor(message) {
    super();
    this.message = message;
    this.statusCode = 404;
  }
}