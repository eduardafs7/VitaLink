class MemoryStore {
  constructor() {
    this.patients = [];
    this.users = [];
    this.appointments = [];
    this.exams = [];
    this.notifications = [];
    this.actionLogs = [];
  }

  nextId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  getCollection(name) {
    if (!this[name]) {
      throw new Error(`Coleção desconhecida: ${name}`);
    }

    return this[name];
  }

  list(name) {
    return [...this.getCollection(name)];
  }

  find(name, id) {
    return this.getCollection(name).find((item) => item.id === id) || null;
  }

  create(name, entity) {
    this.getCollection(name).push(entity);
    return entity;
  }

  update(name, id, updater) {
    const collection = this.getCollection(name);
    const index = collection.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    collection[index] = updater(collection[index]);
    return collection[index];
  }

  delete(name, id) {
    const collection = this.getCollection(name);
    const index = collection.findIndex((item) => item.id === id);

    if (index === -1) {
      return null;
    }

    const [deleted] = collection.splice(index, 1);
    return deleted;
  }
}

module.exports = {
  MemoryStore,
};
