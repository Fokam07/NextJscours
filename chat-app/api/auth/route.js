import { userService } from '../../services/userService.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const { action, email, username, password } = req.body;

      // INSCRIPTION
      if (action === 'register') {
        const user = await userService.createUser({ email, username, password });
        return res.status(201).json({ success: true, user });
      }

      // CONNEXION
      if (action === 'login') {
        const user = await userService.authenticate(email, password);
        return res.status(200).json({ success: true, user });
      }

      return res.status(400).json({ error: 'Action invalide' });
    }

    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    return res.status(401).json({ success: false, message: error.message });
  }
}
