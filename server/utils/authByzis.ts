import jwt from 'jsonwebtoken';

export const verifyByzisToken = (event: any) => {
  const authHeader = getHeader(event, 'authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token tidak valid.' });
  }

  const config = useRuntimeConfig();
  try {
    const decoded = jwt.verify(token as string, (config.jwtSecretByzis || 'secret') as string);
    return decoded as any as { id: number, email: string };
  } catch (error) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized: Token tidak valid atau kadaluarsa.' });
  }
};
