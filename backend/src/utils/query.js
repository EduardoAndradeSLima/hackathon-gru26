function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function applyQuery(items, query, searchableFields = []) {
  let result = [...items];

  if (query.search && searchableFields.length) {
    const term = normalizeText(query.search);
    result = result.filter((item) =>
      searchableFields.some((field) => normalizeText(item[field]).includes(term))
    );
  }

  Object.entries(query).forEach(([key, value]) => {
    if (!value || ['search', 'page', 'limit', 'sortBy', 'order'].includes(key)) {
      return;
    }

    result = result.filter((item) => String(item[key] || '') === String(value));
  });

  const sortBy = query.sortBy || 'created_at';
  const order = query.order === 'asc' ? 1 : -1;

  result.sort((a, b) => {
    const left = a[sortBy] || '';
    const right = b[sortBy] || '';
    return String(left).localeCompare(String(right)) * order;
  });

  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const start = (page - 1) * limit;
  const paginated = result.slice(start, start + limit);

  return {
    data: paginated,
    meta: {
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit) || 1
    }
  };
}

module.exports = { applyQuery, normalizeText };
