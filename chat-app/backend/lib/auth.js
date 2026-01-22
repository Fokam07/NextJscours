// backend/lib/auth.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Hashage du mot de passe
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Vérification du mot de passe
export async function verifyPassword(password, hash)  {
  return await bcrypt.compare(password, hash);
}

// Génération du token JWT
export function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Vérification du token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Récupérer l'utilisateur depuis le token (pour API Routes)
export async function getUserFromToken()  {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return null;
  
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}

// Définir le token dans les cookies
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: '/',
  });
}

// Supprimer le token
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
}