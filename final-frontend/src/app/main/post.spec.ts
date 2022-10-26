import { Post } from './post';

describe('Post', () => {
  it('should create an instance', () => {
    expect(new Post(-1, "", "", "", -1)).toBeTruthy();
  });
});
