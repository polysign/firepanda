import { Collection, Repository } from '../../src/Firepanda';
import { BlogPostComment } from './BlogPostComment';

@Collection({
  name: 'blog-posts',
  schema: {
    author: { type: 'string', required: true },
    title: { type: 'string', required: true },
    content: { type: 'text', required: true },
    publicationDate: { type: 'datetime', transform: { handler: (context) => {
      return Date.now();
    }, on: 'create' }},
    comments: { type: 'collection', name: 'blog-post-comments', className: 'BlogPostComment' }
  },
  hooks: {
    updateAuthorName: { functionName: 'updateAuthor', on: 'create' }
  }
})
export class BlogPost extends Repository { }
