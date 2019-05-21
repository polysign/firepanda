import * as firebase from 'firebase';

export interface WhereClause {
  field: string;
  value: any;
  comparator: '<' | '<=' | '==' | '>=' | '>' | 'array_contains';
}

export { WhereClause }
