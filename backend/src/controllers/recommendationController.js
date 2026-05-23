const asyncHandler = require('../utils/asyncHandler');
const recommendationService = require('../services/recommendationService');

const simulate = asyncHandler(async (req, res) => {
  const result = await recommendationService.recommend(req.body);
  res.json(result);
});

module.exports = { simulate };
