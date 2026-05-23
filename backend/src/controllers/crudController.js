const asyncHandler = require('../utils/asyncHandler');
const crudService = require('../services/crudService');
const { logAction } = require('../services/auditService');

function createCrudController(collection) {
  return {
    list: asyncHandler(async (req, res) => {
      const result = await crudService.list(collection, req.query);
      res.json(result);
    }),

    get: asyncHandler(async (req, res) => {
      const item = await crudService.get(collection, req.params.id);
      res.json(item);
    }),

    create: asyncHandler(async (req, res) => {
      const item = await crudService.create(collection, req.body);
      await logAction(req, 'CRIAR', collection, item.id, { after: item });
      res.status(201).json(item);
    }),

    update: asyncHandler(async (req, res) => {
      const before = await crudService.get(collection, req.params.id);
      const item = await crudService.update(collection, req.params.id, req.body);
      await logAction(req, 'ATUALIZAR', collection, item.id, { before, after: item });
      res.json(item);
    }),

    remove: asyncHandler(async (req, res) => {
      const item = await crudService.remove(collection, req.params.id);
      await logAction(req, 'REMOVER', collection, item.id, { before: item });
      res.status(204).send();
    })
  };
}

module.exports = createCrudController;
