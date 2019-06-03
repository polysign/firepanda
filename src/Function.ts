import * as firebase from 'firebase';

export interface Auth {
  uid: string;
  token: {
    name?: string;
    picture?: string;
    email?: string;
  }
}