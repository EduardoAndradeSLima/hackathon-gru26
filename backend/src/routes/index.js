const router = require('express').Router();
const authRoutes = require('./authRoutes');
const resourceRoutes = require('./resourceRoutes');
const triageRoutes = require('./triageRoutes');
const recommendationRoutes = require('./recommendationRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const reportRoutes = require('./reportRoutes');

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    name: 'FacilitaGRU API',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);
router.use('/users', resourceRoutes.users);
router.use('/oscs', resourceRoutes.oscs);
router.use('/vagas', resourceRoutes.vagas);
router.use('/cidadaos', resourceRoutes.cidadaos);
router.use('/solicitacoes', resourceRoutes.solicitacoes);
router.use('/encaminhamentos', resourceRoutes.encaminhamentos);
router.use('/dashboard', dashboardRoutes);
router.use('/relatorios', reportRoutes);
router.use('/triagem', triageRoutes);
router.use('/recomendacoes', recommendationRoutes);

module.exports = router;
