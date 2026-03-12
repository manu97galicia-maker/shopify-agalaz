module.exports = (req, res) => {
  res.json({
    plans: [
      { id: 'starter', name: 'Agalaz Starter', price: 49, renders: 500, interval: 'monthly' },
      { id: 'growth', name: 'Agalaz Growth', price: 149, renders: 2000, interval: 'monthly' },
      { id: 'enterprise', name: 'Agalaz Enterprise', price: 399, renders: 10000, interval: 'monthly' },
    ],
  });
};
