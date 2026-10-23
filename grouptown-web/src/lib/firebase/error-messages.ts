type UserFacingFirebaseError = {
  audience: 'user' | 'system';
  message: string;
  code?: string;
};

function getFirebaseErrorCode(error: unknown) {
  if (error && typeof error === 'object' && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }

  return undefined;
}

function fallbackMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

export function toWebAuthError(error: unknown, fallback: string): UserFacingFirebaseError {
  const code = getFirebaseErrorCode(error);

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return {
        audience: 'user',
        code,
        message: 'The email or password is incorrect. Check the details and try again.',
      };
    case 'auth/invalid-email':
      return {
        audience: 'user',
        code,
        message: 'Enter a valid email address before continuing.',
      };
    case 'auth/network-request-failed':
      return {
        audience: 'system',
        code,
        message: 'The admin console could not reach Firebase. Check the connection and try again.',
      };
    case 'auth/too-many-requests':
      return {
        audience: 'system',
        code,
        message: 'Too many attempts were detected. Wait a moment and try again.',
      };
    default:
      return {
        audience: 'system',
        code,
        message: fallbackMessage(error, fallback),
      };
  }
}
