# Firepanda 🔥🐼

[![Build Status](https://travis-ci.com/wovalle/firepanda.svg?token=KsyisFHzgCusk2sapuJe&branch=master)](https://travis-ci.com/polysign/firepanda)
[![NPM Version](https://img.shields.io/npm/v/firepanda.svg?style=flat)](https://www.npmjs.com/package/firepanda)
[![Typescript lang](https://img.shields.io/badge/Language-Typescript-Blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/npm/l/firepanda.svg?style=flat)](https://www.npmjs.com/package/firepanda)

Firepanda is a development framework for Firebase and the Google Cloud (a few selected services are supported). The main goal of Firepanda is to simplify and accelerate the development of backend services powered by Firebase (Firestore, Authentication, Storage, ...), and some selected Google Cloud services.

### CLI

Firepanda comes with a small CLI to handle the project structure and build the necessary files in order to deploy to Firebase and other Google Cloud services.

## Installation

```bash
npm install firepanda
```

## Usage

First, make sure you have a Firebase app setup and initialized. [Follow this guide](https://firebase.google.com/docs/firestore/quickstart#initialize) if you are new to Firebase.

### Setup

```typescript
import * as firebase from 'firebase';

firebase.initializeApp({... your credentials});
```

### Define schema/collection
```typescript
import { Collection, Repository } from 'firepanda';

@Collection({
  name: 'posts',
  schema: {
    publicationDate: { type: 'datetime', default: Date.now, mutable: false },
    title: { type: 'string', required: true },
    content: { type: 'string', required: true },
    comments: { type: 'collection', schema: {
      date: { type: 'datetime', default: Date.now }
      author: { type: 'string' },
      comment: { type: 'string' },
      approved: { type: 'boolean', default: false }
    }}
  }
});
class Post extends Repository {
  // Implement your custom model logic here
  //
  // - Supports event hooks (before/after save, update, delete, ...)
  // - Access to low level features, expose observable data, ...

  async addComment(author, comment) {
    // Access to sub-collection
    this.data.comments.add({
      author: author,
      comment: comment
    })
  }
}
```

## Documentation
