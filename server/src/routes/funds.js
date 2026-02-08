import express from 'express';

const router = express.Router();

// Get all funds
router.get('/funds', (req, res) => {
  res.json({ 
    data: [
      { id: 1, name: 'Fund A', value: 10000 },
      { id: 2, name: 'Fund B', value: 25000 }
    ] 
  });
});

// Get fund by ID
router.get('/funds/:id', (req, res) => {
  const { id } = req.params;
  res.json({ 
    data: { id, name: `Fund ${id}`, value: 10000 + (id * 5000) } 
  });
});

// Create new fund
router.post('/funds', (req, res) => {
  const { name, value } = req.body;
  res.status(201).json({ 
    data: { id: 3, name, value } 
  });
});

export default router;
