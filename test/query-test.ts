import axios from 'axios';
import { expect } from 'chai';

describe('Hello Query', () => {
  it('should return Hello, Wordl!', async () => {
    console.log('Hello Query Test');
    const hello = {
      query: `
          query {
            hello
          }
        `,
    };

    const response = await axios.post('http://localhost:4000', hello);
    console.log('Response:', response.data);
    expect(response.data.data.hello).to.be.eq('Hello, World!');});
});
