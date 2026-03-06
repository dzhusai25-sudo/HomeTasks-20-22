import { greet, User, ForceConstructor, curry } from "./HomeTask-20";

describe("Test greet()", () => {
  it("greet is function", () => expect(greet).toBeInstanceOf(Function));
  it("greet.myBind is function", () =>
    expect(greet.myBind).toBeInstanceOf(Function));
  it("greet.myBind returns a function", () =>
    expect(greet.myBind()).toBeInstanceOf(Function));
  it("test greet.myBind without additional params", () => {
    const person = { name: "Алиса" };
    const greetAlice = greet.myBind(person);
    expect(greetAlice("Привет", "!")).toEqual("Привет, Алиса!");
  });
  it("test greet.myBind with additional params", () => {
    const person = { name: "Алиса" };
    const greetAlice = greet.myBind(person, "Добрый день");
    expect(greetAlice(".")).toEqual("Добрый день, Алиса.");
  });
});

describe("Test User()", () => {
  const userName = "Alex";
  const userAge = 20;
  global.prompt = jest
    .fn()
    .mockReturnValueOnce(userName)
    .mockReturnValueOnce(userAge);
  global.alert = jest.fn();
  global.console.log = jest.fn();

  it("User is object", () => expect(User).toBeInstanceOf(Object));
  it("User has methods", () => {
    const user = new User();
    expect(user).toHaveProperty("askName");
    expect(user.askName).toBeInstanceOf(Function);
    expect(user).toHaveProperty("askAge");
    expect(user.askAge).toBeInstanceOf(Function);
    expect(user).toHaveProperty("showAgeInConsole");
    expect(user.showAgeInConsole).toBeInstanceOf(Function);
    expect(user).toHaveProperty("showNameInAlert");
    expect(user.showNameInAlert).toBeInstanceOf(Function);
  });
  it("Test User methods", () => {
    prompt.mockClear();
    alert.mockClear();

    const user = new User();
    user.askName().askAge().showAgeInConsole().showNameInAlert();

    expect(prompt).toHaveBeenCalledTimes(2);
    expect(prompt).toHaveBeenCalledWith("Введите ваше имя:");
    expect(prompt).toHaveBeenCalledWith("Введите ваш возраст:");

    expect(user).toHaveProperty("name");
    expect(user.name).toBe(userName);
    expect(user).toHaveProperty("age");
    expect(user.age).toBe(userAge);

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(`Имя: ${userName}`);

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(`Возраст: ${userAge}`);
  });
});

describe("Test ForceConstructor()", () => {
  it("ForceConstructor is function", () =>
    expect(ForceConstructor).toBeInstanceOf(Function));
  it("ForceConstructor() returns Object", () =>
    expect(ForceConstructor()).toBeInstanceOf(Object));
  it("ForceConstructor() returns {}", () =>
    expect(ForceConstructor()).toEqual({}));
  it("ForceConstructor('abc', 1, ['a', 'b', 'c'], {a: 5, b: 'text'}) returns object with properties", () => {
    const testParams = ["abc", 1, ["a", "b", "c"], { a: 5, b: "text" }];
    const result = ForceConstructor(...testParams);
    expect(result).toMatchInlineSnapshot(`
     ForceConstructor {
       "param1": "abc",
       "param2": 1,
       "param3": [
         "a",
         "b",
         "c",
       ],
       "param4": {
         "a": 5,
         "b": "text",
       },
     }
    `);
  });
});

describe("Test curry()", () => {
  it("curry is a function", () => expect(curry).toBeInstanceOf(Function));
  it("curry has one param", () => expect(curry.length).toBe(1));
  it("curry calls sum0", () => {
    function sum0() {
      return 0;
    }
    expect(curry(sum0)()).toBe(0);
    expect(curry(sum0)(123)).toBe(0);
  });
  it("curry calls sum2", () => {
    function sum2(x, y) {
      return x + y;
    }
    expect(curry(sum2)(11)(22)).toBe(33);
  });
  it("curry calls sum4", () => {
    function sum4(a, b, c, d) {
      return a + b + c + d;
    }
    expect(curry(sum4)(11)(22)(33)(44)).toBe(110);
  });
});
