import {Injectable} from '@angular/core';
import {LOCAL_STORAGE_AUTH_TOKEN_KEY, LOCAL_STORAGE_CURRENT_REPO_KEY} from 'src/app/utils/constants';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {
  }

  getCurrentRepository() {
    return localStorage.getItem(LOCAL_STORAGE_CURRENT_REPO_KEY);
  }

  getAuthToken() {
    return localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  }
}
