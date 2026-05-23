const asyncHandler = require('../utils/asyncHandler');
const dashboardService = require('../services/dashboardService');

const show = asyncHandler(async (_req, res) => {
  const dashboard = await dashboardService.getDashboard();
  res.json(dashboard);
});

module.exports = { show };
