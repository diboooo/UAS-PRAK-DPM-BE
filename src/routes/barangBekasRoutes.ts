import express, { Request, Response } from 'express';
import { ManajemenBarangBekas } from '../models/BarangBekas';
import authenticateToken from '../middleware/authenticateToken';

const router = express.Router();

interface AuthRequest extends Request {
  userId?: string;
}

router.get('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const records = await ManajemenBarangBekas.find({ userId });
    res.json(records);
  } catch (err) {
    console.error('Error fetching records:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, quantity, dateAdded } = req.body;
  const userId = req.userId;

  if (!name || !description || !quantity || !dateAdded) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const newRecord = new ManajemenBarangBekas({ name, description, quantity, dateAdded, userId });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (err) {
    console.error('Error saving record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, quantity, dateAdded } = req.body;
  const userId = req.userId;

  if (!name || !description || !quantity || !dateAdded) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  try {
    const updatedRecord = await ManajemenBarangBekas.findOneAndUpdate(
      { _id: id, userId },
      { name, description, quantity, dateAdded },
      { new: true }
    );

    if (!updatedRecord) {
      res.status(404).json({ error: 'Record not found or unauthorized' });
      return;
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error('Error updating record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const record = await ManajemenBarangBekas.findOneAndDelete({ _id: id, userId });
    if (!record) {
      res.status(404).json({ error: 'Record not found or unauthorized' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting record:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;