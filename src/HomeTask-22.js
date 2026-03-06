//Promisify
export function promisify(fn) {
  return function (...params) {
    return new Promise((resolve, reject) => {
      const callback = (error, result) => {
        error ? reject(error) : resolve(result);
      };
      fn(...params, callback);
    });
  };
}

/* Пример функции на колбэках
function sum(a, b, cb) {
  setTimeout(() => {
    if (Math.random() < 0.5) {
      cb(null, a + b); // успех
    } else {
      cb("Ошибка"); // ошибка
    }
  }, 100);
}



// Преобразуем с помощью promisify
const promisifiedSum = promisify(sum);

promisifiedSum(2, 3)
  .then((result) => console.log(result)) // 5
  .catch((err) => console.log(err)); // "Ошибка"

  */

//Parallel
export class Parallel {
  constructor(limitJobs = Infinity) {
    this.limitJobs = limitJobs;
    this.jobs = [];
  }

  job(fn) {
    this.jobs.push(fn);
    return this;
  }

  done(cb) {
    if (this.jobs.length === 0) {
      setTimeout(() => cb([]), 0);
      return;
    }

    const results = new Array(this.jobs.length);
    let completed = 0;
    let running = 0;

    const startNextJobs = () => {
      while (running < this.limitJobs && this.jobs.length > 0) {
        const index = this.jobs.length - 1;
        const job = this.jobs.pop();
        running++;

        job((result) => {
          results[index] = result;
          completed++;
          running--;

          if (completed === results.length) {
            cb(results);
            return;
          }
          startNextJobs();
        });
      }
    };
    startNextJobs();
  }
}

//fetchRetry
export function fetchRetry(url, retries, delay) {
  function attempt(attemptNumber) {
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
      })
      .catch((error) => {
        if (attemptNumber >= retries) {
          throw error;
        }
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            attempt(attemptNumber + 1)
              .then(resolve)
              .catch(reject);
          }, delay);
        });
      });
  }
  return attempt(1);
}

//debounce
export function debounce(func, delay) {
  let timeoutId = null;
  return function (...args) {
    const context = this;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, delay);
  };
}

//serialProcess
export function serialProcess(array, handler) {
  return new Promise((resolve) => {
    const results = [];
    let currentIndex = 0;
    function processNext() {
      if (currentIndex >= array.length) {
        resolve(results);
        return;
      }
      const currentEl = array[currentIndex];
      const currentIndexValue = currentIndex;
      function done(result) {
        results[currentIndexValue] = result;
        currentIndex++;
        processNext();
      }
      handler(currentEl, currentIndexValue, array, done);
    }
    processNext();
  });
}
