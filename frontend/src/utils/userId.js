import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'menuchat_user_id';

export function getUserId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
