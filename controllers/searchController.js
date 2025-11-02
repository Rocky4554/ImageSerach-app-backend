import axios from 'axios';
import Search from '../models/Search.js';

export const getTopSearches = async (req, res) => {
  try {
    const topSearches = await Search.aggregate([
      { $group: { _id: '$term', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { term: '$_id', count: 1, _id: 0 } },
    ]);
    res.json(topSearches);
  } catch (error) {
    console.error('Error fetching top searches:', error);
    res.status(500).json({ error: 'Failed to fetch top searches' });
  }
};

export const searchImages = async (req, res) => {
  try {
    const { term, page = 1 } = req.body;

    if (!term?.trim()) return res.status(400).json({ error: 'Search term is required' });
    const pageNum = parseInt(page);
    if (pageNum < 1) return res.status(400).json({ error: 'Invalid page number' });

    if (pageNum === 1) await Search.create({ userId: req.user._id, term: term.trim() });

    const unsplashResponse = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: term,
        per_page: 20,
        page: pageNum,
        client_id: process.env.UNSPLASH_ACCESS_KEY,
      },
    });

    const images = unsplashResponse.data.results.map(img => ({
      id: img.id,
      url: img.urls.regular,
      thumb: img.urls.small,
      alt: img.alt_description || term,
      author: img.user.name,
      authorUrl: img.user.links.html,
    }));

    res.json({
      term,
      total: unsplashResponse.data.total,
      totalPages: unsplashResponse.data.total_pages,
      currentPage: pageNum,
      images,
    });
  } catch (error) {
    console.error('Error searching images:', error.message);
    if (error.response)
      return res.status(error.response.status).json({
        error: error.response.data.errors?.[0] || 'Failed to search images',
      });
    res.status(500).json({ error: 'Failed to search images' });
  }
};
