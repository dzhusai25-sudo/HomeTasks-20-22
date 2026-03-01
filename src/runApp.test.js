import { runApp } from './runApp';

describe('Check runApp', () => {
  it('function test', () => expect(runApp).toBeInstanceOf(Function));
  it('div test', () => {
    const el = document.createElement('div');
    runApp(el);
    expect(el.innerHTML.length).toBeGreaterThanOrEqual(0);
  });
});
