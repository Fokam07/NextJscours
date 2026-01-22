import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

const SALT_ROUNDS = 10;

export const userService = {
  /**
   * Créer un nouvel utilisateur
   */
  async createUser({ email, username, password }) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    return await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  },

  /**
   * Trouver un utilisateur par email
   */
  async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  /**
   * Trouver un utilisateur par ID
   */
  async findById(id) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  },

  /**
   * Vérifier le mot de passe
   */
  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  /**
   * Authentifier un utilisateur
   */
  async authenticate(email, password) {
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    const isValid = await this.verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new Error('Mot de passe incorrect');
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  },
};