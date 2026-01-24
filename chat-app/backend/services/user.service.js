import prisma from '../lib/prisma.js';

const SALT_ROUNDS = 10;

export const userService = {
  /**
   * Créer un nouvel utilisateur
   */
  async createUser({ email, username, id }) {
    
    return await prisma.user.create({
      data: {
        email,
        username,
        id
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
   *  mettre a jour un utilisateur
   */
  async updateUser(id, { email, username }) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    return await prisma.user.update({
      where: { id },
      data: {
        email,
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });
  },

  /**  * Supprimer un utilisateur
   */
  async deleteUser(id) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    } 
    return await prisma.user.delete({
      where: { id },
    });
  },
};