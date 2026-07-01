// Ensure a signing secret exists so code that hashes one-time codes/tokens
// (verification-code.ts) works in tests without depending on a real .env.
process.env.BETTER_AUTH_SECRET ??= 'test-better-auth-secret-0123456789abcdef'
