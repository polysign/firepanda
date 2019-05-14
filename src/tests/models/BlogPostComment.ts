import { Collection, Repository } from '../../index';
import { BlogPost } from './BlogPost';

@Collection({
  name: 'blog-post-comments',
  schema: {
    author: { type: 'string', required: true },
    content: { type: 'text', required: true },
    publicationDate: { type: 'datetime', transform: (context) => {
      return Date.now();
    }, on: 'create' },
    parent: { type: 'document', name: 'blog-post', class: BlogPost }
  }
})
export class BlogPostComment extends Repository { }
