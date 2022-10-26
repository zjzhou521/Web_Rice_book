import { Comment } from './comment';

describe('Comment', () => {
  it('should create an instance', () => {
    expect(new Comment(-1, "", "", -1, "")).toBeTruthy();
  });
});
