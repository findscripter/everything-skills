import { summarize } from '../../packages/core/index.mjs';

// A relative import keeps this tiny fixture runnable without npm install.
const notes = [{ minutes: 25 }, { minutes: 15 }, { minutes: 20 }];
console.log(JSON.stringify(summarize(notes)));
