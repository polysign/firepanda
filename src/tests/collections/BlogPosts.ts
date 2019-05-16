import { Collection, Firepanda } from '../../index';
import { BlogPostComments } from './BlogPostComments';

@Firepanda({
  name: 'blog-posts',
  schema: {
    author: { type: 'string', required: true },
    title: { type: 'string', required: true },
    content: { type: 'text', required: true },
    publicationDate: { type: 'datetime', transform: { handler: (context) => {
      return Date.now();
    }, on: 'create' }},
    comments: { type: 'collection', name: 'blog-post-comments', className: 'BlogPostComments' }
  },
  hooks: {
    updateAuthorName: { functionName: 'updateAuthor', on: 'create' }
  }
})
export class BlogPost extends Collection { }
