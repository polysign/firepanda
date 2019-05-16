import { Collection, Firepanda } from '../../index';
import { BlogPosts } from './BlogPosts';

@Firepanda({
  name: 'blog-post-comments',
  schema: {
    author: { type: 'string', required: true },
    content: { type: 'text', required: true },
    publicationDate: { type: 'datetime', transform: (context) => {
      return Date.now();
    }, on: 'create' },
    parent: { type: 'document', name: 'blog-post', class: BlogPosts }
  }
})
export class BlogPostComments extends Collection { }
