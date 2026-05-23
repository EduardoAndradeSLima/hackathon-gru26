const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const env = require('../config/env');
const getSupabaseClient = require('../config/supabase');

class JsonStore {
  constructor() {
    this.dbPath = path.join(__dirname, 'db.json');
    this.seedPath = path.join(__dirname, '..', 'data', 'seed.json');
  }

  async ensure() {
    try {
      await fs.access(this.dbPath);
    } catch {
      const seed = JSON.parse(await fs.readFile(this.seedPath, 'utf8'));
      const data = await this.normalizeSeed(seed);
      await this.write(data);
    }
  }

  async normalizeSeed(seed) {
    const data = { ...seed };
    data.users = await Promise.all(
      seed.users.map(async (user) => ({
        ...user,
        senha_hash: user.senha_hash || await bcrypt.hash(user.senha_temporaria || 'Admin@123', 10),
        senha_temporaria: undefined
      }))
    );

    return data;
  }

  async read() {
    await this.ensure();
    return JSON.parse(await fs.readFile(this.dbPath, 'utf8'));
  }

  async write(data) {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  async list(collection) {
    const data = await this.read();
    return data[collection] || [];
  }

  async findById(collection, id) {
    const items = await this.list(collection);
    return items.find((item) => item.id === id) || null;
  }

  async create(collection, payload) {
    const data = await this.read();
    const now = new Date().toISOString();
    const item = {
      id: randomUUID(),
      ...payload,
      created_at: payload.created_at || now,
      updated_at: payload.updated_at || now
    };

    data[collection] = [item, ...(data[collection] || [])];
    await this.write(data);
    return item;
  }

  async update(collection, id, payload) {
    const data = await this.read();
    const items = data[collection] || [];
    const index = items.findIndex((item) => item.id === id);

    if (index < 0) {
      return null;
    }

    const updated = {
      ...items[index],
      ...payload,
      id,
      updated_at: new Date().toISOString()
    };

    items[index] = updated;
    data[collection] = items;
    await this.write(data);
    return updated;
  }

  async remove(collection, id) {
    const data = await this.read();
    const items = data[collection] || [];
    const found = items.find((item) => item.id === id);

    if (!found) {
      return null;
    }

    data[collection] = items.filter((item) => item.id !== id);
    await this.write(data);
    return found;
  }
}

class SupabaseStore {
  constructor() {
    this.client = getSupabaseClient();
  }

  async ensure() {
    if (!this.client) {
      throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar configurados.');
    }
  }

  async list(collection) {
    await this.ensure();
    const { data, error } = await this.client.from(collection).select('*');
    if (error) throw error;
    return data || [];
  }

  async findById(collection, id) {
    await this.ensure();
    const { data, error } = await this.client.from(collection).select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(collection, payload) {
    await this.ensure();
    const { data, error } = await this.client.from(collection).insert(payload).select('*').single();
    if (error) throw error;
    return data;
  }

  async update(collection, id, payload) {
    await this.ensure();
    const { data, error } = await this.client.from(collection).update(payload).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    return data;
  }

  async remove(collection, id) {
    await this.ensure();
    const current = await this.findById(collection, id);
    if (!current) return null;

    const { error } = await this.client.from(collection).delete().eq('id', id);
    if (error) throw error;
    return current;
  }
}

module.exports = env.dbDriver === 'supabase' ? new SupabaseStore() : new JsonStore();
