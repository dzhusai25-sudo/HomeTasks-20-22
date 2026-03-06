import {
  promisify,
  Parallel,
  fetchRetry,
  debounce,
  serialProcess,
} from "./HomeTask-22";

describe("promisify", () => {
  it("преобразует функцию с колбэком в функцию, возвращающую промис", () => {
    function sum(a, b, cb) {
      cb(null, a + b);
    }
    const promisified = promisify(sum);
    expect(promisified(2, 3)).toBeInstanceOf(Promise);
  });

  it("резолвит промис при успешном выполнении (error = null)", async () => {
    function successFunction(cb) {
      cb(null, "успех");
    }
    const promisified = promisify(successFunction);
    const result = await promisified();
    expect(result).toBe("успех");
  });

  it("резолвит промис при error = undefined", async () => {
    function successFunction(cb) {
      cb(undefined, "результат");
    }

    const promisified = promisify(successFunction);
    const result = await promisified();
    expect(result).toBe("результат");
  });

  it("реджектит промис при наличии ошибки", async () => {
    function errorFunction(cb) {
      cb("ошибка");
    }

    const promisified = promisify(errorFunction);

    await expect(promisified()).rejects.toBe("ошибка");
  });

  it("корректно передаёт аргументы исходной функции", async () => {
    function multiply(a, b, c, cb) {
      cb(null, a * b * c);
    }

    const promisified = promisify(multiply);
    const result = await promisified(2, 3, 4);
    expect(result).toBe(24);
  });

  it("работает с асинхронными функциями (setTimeout)", async () => {
    function asyncFunction(delay, cb) {
      setTimeout(() => {
        cb(null, `задержка ${delay} мс завершена`);
      }, delay);
    }

    const promisified = promisify(asyncFunction);
    const result = await promisified(100);
    expect(result).toBe("задержка 100 мс завершена");
  });
});

describe("Parallel class", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("создаёт экземпляр с заданным лимитом параллельности", () => {
    const runner1 = new Parallel(3);
    expect(runner1.limitJobs).toBe(3);

    const runner2 = new Parallel();
    expect(runner2.limitJobs).toBe(Infinity);
  });

  it("метод job добавляет задачи и поддерживает чейнинг", () => {
    const runner = new Parallel(2);
    const jobFn = jest.fn();

    const result = runner.job(jobFn);

    expect(runner.jobs).toHaveLength(1);
    expect(runner.jobs[0]).toBe(jobFn);
    expect(result).toBe(runner);
  });

  test("корректно обрабатывает синхронные задачи", async () => {
    const runner = new Parallel(2);

    runner
      .job((doneCb) => doneCb("sync1"))
      .job((doneCb) => doneCb("sync2"))
      .job((doneCb) => doneCb("sync3"));

    const results = await runner.done((finalResults) => finalResults);
    expect(results).toEqual(["sync1", "sync2", "sync3"]);
  }, 5000);

  test("обрабатывает ошибки в задачах", async () => {
    const runner = new Parallel(2);

    runner
      .job((doneCb) => doneCb("success"))
      .job((doneCb) => {
        const error = new Error("task failed");
        doneCb(error);
      })
      .job((doneCb) => doneCb("another success"));

    const results = await runner.done((finalResults) => finalResults);

    expect(results).toHaveLength(3);
    expect(results[0]).toBe("success");
    expect(results[1]).toBeInstanceOf(Error);
    expect(results[1].message).toBe("task failed");
    expect(results[2]).toBe("another success");
  }, 5000);

  describe("fetchRetry", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("успешный запрос с первой попытки", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: "test" }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const result = await fetchRetry("https://otus.ru", 3, 100);
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResponse);
    });

    test("не делает лишних попыток после успеха", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ data: "success" }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse);

      const promise = fetchRetry("https://otus.ru", 5, 100);
      jest.runAllTimers();
      await promise;

      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("при retries = 1 выполняется только одна попытка", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Single try fail"));

      await expect(fetchRetry("https://otus.ru", 1, 100)).rejects.toThrow(
        "Single try fail",
      );
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("корректно передаёт URL в fetch", async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true });

      await fetchRetry("https://otus.ru", 2, 100);
      expect(global.fetch).toHaveBeenCalledWith("https://otus.ru");
    });
  });

  describe("debounce", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("вызывает функцию только один раз после задержки", () => {
      const mockFunc = jest.fn();
      const debounced = debounce(mockFunc, 100);

      debounced("arg1", "arg2");
      expect(mockFunc).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFunc).toHaveBeenCalledTimes(1);
      expect(mockFunc).toHaveBeenLastCalledWith("arg1", "arg2");
    });

    it("отменяет предыдущие таймеры при повторном вызове", () => {
      const mockFunc = jest.fn();
      const debounced = debounce(mockFunc, 100);

      // Первый вызов
      debounced("first");
      // Второй вызов до истечения задержки
      debounced("second");

      jest.advanceTimersByTime(50);
      expect(mockFunc).not.toHaveBeenCalled();

      jest.advanceTimersByTime(60);
      expect(mockFunc).toHaveBeenCalledTimes(1);
      expect(mockFunc).toHaveBeenLastCalledWith("second"); // вызван с последними аргументами
    });

    it("передаёт все аргументы в исходную функцию", () => {
      const mockFunc = jest.fn();
      const debounced = debounce(mockFunc, 100);

      debounced(1, "string", { key: "value" }, [1, 2, 3]);

      jest.advanceTimersByTime(100);

      expect(mockFunc).toHaveBeenCalledTimes(1);
      expect(mockFunc).toHaveBeenLastCalledWith(
        1,
        "string",
        { key: "value" },
        [1, 2, 3],
      );
    });

    it("при частых вызовах функция вызывается только один раз", () => {
      const mockFunc = jest.fn();
      const debounced = debounce(mockFunc, 100);

      for (let i = 0; i < 5; i++) {
        debounced(i);
      }

      jest.advanceTimersByTime(90);
      expect(mockFunc).not.toHaveBeenCalled();

      jest.advanceTimersByTime(20);
      expect(mockFunc).toHaveBeenCalledTimes(1);
      expect(mockFunc).toHaveBeenLastCalledWith(4);
    });

    it("работает с нулевым delay", () => {
      const mockFunc = jest.fn();
      const debounced = debounce(mockFunc, 0);

      debounced("test");
      jest.runAllTimers();

      expect(mockFunc).toHaveBeenCalledTimes(1);
      expect(mockFunc).toHaveBeenLastCalledWith("test");
    });

    it("каждый экземпляр debounce имеет свой таймер", () => {
      const mockFunc1 = jest.fn();
      const mockFunc2 = jest.fn();

      const debounced1 = debounce(mockFunc1, 100);
      const debounced2 = debounce(mockFunc2, 100);

      debounced1("from1");
      debounced2("from2");

      jest.advanceTimersByTime(100);

      expect(mockFunc1).toHaveBeenCalledTimes(1);
      expect(mockFunc1).toHaveBeenLastCalledWith("from1");

      expect(mockFunc2).toHaveBeenCalledTimes(1);
      expect(mockFunc2).toHaveBeenLastCalledWith("from2");
    });

    it("корректно работает с разными задержками", () => {
      const mockFunc = jest.fn();

      const debouncedShort = debounce(mockFunc, 50);
      const debouncedLong = debounce(mockFunc, 200);

      debouncedShort("short");
      debouncedLong("long");

      jest.advanceTimersByTime(60);
      expect(mockFunc).toHaveBeenCalledWith("short");

      jest.advanceTimersByTime(150);
      expect(mockFunc).toHaveBeenCalledWith("long");
    });
  });

  describe("serialProcess", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("обрабатывает пустой массив", async () => {
      const result = await serialProcess([], jest.fn());
      expect(result).toEqual([]);
    });

    test("последовательно обрабатывает элементы массива", async () => {
      const array = [1, 2, 3];
      const results = [];

      await serialProcess(array, (el, index, list, done) => {
        results.push(el);
        done(el * 2);
      });

      expect(results).toEqual([1, 2, 3]);
    });

    test("возвращает массив результатов в правильном порядке", async () => {
      const array = ["a", "b", "c"];

      const result = await serialProcess(array, (el, index, list, done) => {
        done(el.toUpperCase());
      });

      expect(result).toEqual(["A", "B", "C"]);
    });

    test("корректно передаёт аргументы в обработчик", async () => {
      const array = [10, 20];
      const callData = [];

      await serialProcess(array, (el, index, list, done) => {
        callData.push({ el, index, listLength: list.length });
        done(el);
      });

      expect(callData).toEqual([
        { el: 10, index: 0, listLength: 2 },
        { el: 20, index: 1, listLength: 2 },
      ]);
    });

    it("обрабатывает синхронные задачи", async () => {
      const array = [1, 2, 3];

      const result = await serialProcess(array, (el, index, list, done) => {
        done(el * el);
      });

      expect(result).toEqual([1, 4, 9]);
    });

    test("корректно работает с одним элементом", async () => {
      const result = await serialProcess([555], (el, index, list, done) => {
        done(`single-${el}`);
      });

      expect(result).toEqual(["single-555"]);
    });

    test("не пропускает элементы при обработке", async () => {
      const array = [1, 2, 3, 4, 5];
      const processedIndices = new Set();

      await serialProcess(array, (el, index, list, done) => {
        processedIndices.add(index);
        done(el);
      });

      expect(processedIndices).toEqual(new Set([0, 1, 2, 3, 4]));
      expect(processedIndices.size).toBe(5);
    });
  });
});
