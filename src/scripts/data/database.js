import { openDB } from 'idb';
     
const DATABASE_NAME = 'story';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'bookmarks';
 
const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: 'id',
    });
  },
});

const Database = {
  async putBookmark(story) {
    if (!story.id) {
      throw new Error('`id` is required.');
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async getBookmarkById(id) {
    if (!id) {
      throw new Error('`id` is required.');
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllBookmarks() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async deleteBookmark(id) {
    if (!id) {
      throw new Error('`id` is required.');
    }
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  }
};

export default Database;