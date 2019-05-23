import * as firebase from 'firebase';

export interface Query {
  where?: WhereClause[];
  limit?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface WhereClause {
  field: string;
  value: any;
  comparator: '<' | '<=' | '==' | '>=' | '>' | 'array_contains';
}
