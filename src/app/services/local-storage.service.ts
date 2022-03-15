import {Injectable} from '@angular/core';
import {
  LOCAL_STORAGE_AUTH_TOKEN_KEY,
  LOCAL_STORAGE_CURRENT_REPO_KEY,
  LOCAL_STORAGE_GRAPHDB_KEY,
} from 'src/app/utils/constants';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {
  }

  getGraphDB() {
    let graphDB = localStorage.getItem(LOCAL_STORAGE_GRAPHDB_KEY);
    if (!graphDB) {
      graphDB = environment.graphDB;
      if (graphDB) {
        this.setGraphDB(graphDB);
      }
    }
    return graphDB;
  }

  setGraphDB(graphDB) {
    localStorage.setItem(LOCAL_STORAGE_GRAPHDB_KEY, graphDB);
  }

  getCurrentRepository() {
    return localStorage.getItem(LOCAL_STORAGE_CURRENT_REPO_KEY);
  }

  setCurrentRepository(repository) {
    localStorage.setItem(LOCAL_STORAGE_CURRENT_REPO_KEY, repository);
  }

  getAuthToken() {
    return localStorage.getItem(LOCAL_STORAGE_AUTH_TOKEN_KEY);
  }
}
