const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');

const getRows = asyncHandler(async (req, res) => {
  const rows = await reportService.rowsFor(req.query.tipo || 'ocupacao');
  res.json({ data: rows });
});

const getCsv = asyncHandler(async (req, res) => {
  const type = req.query.tipo || 'ocupacao';
  const csv = await reportService.csv(type);
  res.header('Content-Type', 'text/csv');
  res.attachment(`relatorio-${type}.csv`);
  res.send(csv);
});

const getPdf = asyncHandler(async (req, res) => {
  const type = req.query.tipo || 'ocupacao';
  const pdf = await reportService.pdf(type);
  res.header('Content-Type', 'application/pdf');
  res.attachment(`relatorio-${type}.pdf`);
  res.send(pdf);
});

module.exports = { getRows, getCsv, getPdf };
