describe('Razorpay environment helpers', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  it('throws descriptive error when keys are missing', () => {
    process.env = { ...originalEnv };
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;

    jest.isolateModules(() => {
      const { getRazorpayCredentials } = require('../lib/env.js');
      expect(() => getRazorpayCredentials()).toThrow(/Missing Razorpay configuration/);
    });
  });

  it('returns credentials when keys are provided', () => {
    process.env = {
      ...originalEnv,
      RAZORPAY_KEY_ID: 'rzp_test_123',
      RAZORPAY_KEY_SECRET: 'secret_456',
    };

    jest.isolateModules(() => {
      const { getRazorpayCredentials } = require('../lib/env.js');
      expect(getRazorpayCredentials()).toEqual({
        RAZORPAY_KEY_ID: 'rzp_test_123',
        RAZORPAY_KEY_SECRET: 'secret_456',
      });
    });
  });
});
