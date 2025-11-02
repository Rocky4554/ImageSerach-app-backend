import Search from '../models/search.js';

export const getHistory = async (req, res) => {
  try {
    const history = await Search.find({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .select('term timestamp');
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
};
