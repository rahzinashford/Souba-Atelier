const memoryStorage = new Map();

const isStorageAvailable = () => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

const storageAvailable = isStorageAvailable();

export const safeStorage = {
  getItem: (key) => {
    if (storageAvailable) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return memoryStorage.get(key) ?? null;
      }
    }
    return memoryStorage.get(key) ?? null;
  },

  setItem: (key, value) => {
    if (storageAvailable) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch (e) {
        memoryStorage.set(key, value);
      }
    } else {
      memoryStorage.set(key, value);
    }
  },

  removeItem: (key) => {
    if (storageAvailable) {
      try {
        localStorage.removeItem(key);
        return;
      } catch (e) {
        memoryStorage.delete(key);
      }
    } else {
      memoryStorage.delete(key);
    }
  },

  getJSON: (key, defaultValue = null) => {
    const value = safeStorage.getItem(key);
    if (value === null) return defaultValue;
    try {
      return JSON.parse(value);
    } catch (e) {
      return defaultValue;
    }
  },

  setJSON: (key, value) => {
    try {
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Failed to stringify value for storage:', e);
    }
  }
};

export default safeStorage;
