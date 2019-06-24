# Firepanda 🔥🐼

[![Build Status](https://api.travis-ci.org/polysign/firepanda.svg?branch=master)](https://travis-ci.com/polysign/firepanda)
[![NPM Version](https://img.shields.io/npm/v/firepanda.svg?style=flat)](https://www.npmjs.com/package/firepanda)
[![Typescript lang](https://img.shields.io/badge/Language-Typescript-Blue.svg)](https://www.typescriptlang.org)
[![License](https://img.shields.io/npm/l/firepanda.svg?style=flat)](https://www.npmjs.com/package/firepanda)

Firepanda is a development framework for Firebase and the Google Cloud (a few selected services are supported). The main goal of Firepanda is to simplify and accelerate the development of applications powered by Firebase (Firestore, Authentication, Storage, ...), and some selected Google Cloud services.

## CLI

Firepanda comes with a small CLI to handle the project structure and build the necessary files in order to deploy to Firebase and other Google Cloud services.

# Installation

```bash
npm install firepanda
```

# Usage

```bash
firepanda init my-project folder-name
```

This will generate a new folder structure, install all required base dependencies and copy all files to start developing a new application.

# Setup

Setup firebase in your new project folder

```bash
firebase login
OR
firebase use --add # follow instructions
```

# Development

## Firestore

To get started, Firepanda provides an easy framework to develop custom models using Firestore.

### Collections

#### Add a new collection

1. Create a new file **src/firestore/Users.ts***
3. Create a new collection class and use the Firepanda decorator to define the collection schema:

```typescript
import { Collection, Firepanda } from 'firepanda';

@Firepanda({
  name: 'users',
  id: {
    from: 'uid'
  },
  schema: {
    uid: { type: 'string', required: true },
    displayName: { type: 'string' },
    email: { type: 'string' },
    photoUrl: { type: 'string', default: 'http://www.gravatar.com/avatar/1337?d=identicon' },
    active: { type: 'boolean' },
    createdAt: { type: 'timestamp', transform: { on: 'beforeAdd' } },
  }
})
export class UsersCollection extends Collection {
  // Implement any custom methods here
}

```

#### Schema

The collection schema is defined using the Firepanda decorator.

| Field | Type | Description |
|-|-|-|
| name | string | Name of the collection used within Firestore |
| id.from | object | Data to use the ID from another field |
| schema | object | All the fields the collection uses |
