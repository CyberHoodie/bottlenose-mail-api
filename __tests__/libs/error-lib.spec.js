import { NotFoundError } from "../../libs/error-lib";

describe('#NotFoundError', () => {
  it('responds to status code', () => {
    try {
      throw new NotFoundError('test message');
    } catch (error) {
      expect(typeof error.statusCode).toBe('number');
    }
  });

  it('has a 404 status code', () => {
    try {
      throw new NotFoundError('test message');
    } catch (error) {
      expect(error.statusCode).toBe(404);
    }
  });
});