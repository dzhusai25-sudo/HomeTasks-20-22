// myBind

Function.prototype.myBind = function (context, ...params) {
  const originalFunction = this;

  return function (...callParams) {
    const allParams = [...params, ...callParams];
    return originalFunction.apply(context, allParams);
  };
};

export function greet(greeting, punctuation) {
  return greeting + ", " + this.name + punctuation;
}

const person = { name: "Алиса" };
const greetAlice = greet.myBind(person, "Привет");

console.log(greetAlice("!")); // Ожидаемый результат: "Привет, Алиса!"

// Цепочка

export function User() {
  this.name = null;
  this.age = null;
}

User.prototype.askName = function () {
  this.name = prompt("Введите ваше имя:");
  return this;
};

User.prototype.askAge = function () {
  const ageInput = prompt("Введите ваш возраст:");
  this.age = parseInt(ageInput, 10);
  return this;
};

User.prototype.showAgeInConsole = function () {
  console.log(`Возраст: ${this.age}`);
  return this;
};

User.prototype.showNameInAlert = function () {
  alert(`Имя: ${this.name}`);
  return this;
};

const u = new User();
u.askName().askAge().showAgeInConsole().showNameInAlert();

// ForceConstructor

export function ForceConstructor(...params) {
  if (!(this instanceof ForceConstructor)) {
    return new ForceConstructor(...params);
  }
  params.forEach((value, index) => {
    this[`param${index + 1}`] = value;
  });
}

// curry

export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

function sum2(x, y) {
  return x + y;
}
function sum4(a, b, c, d) {
  return a + b + c + d;
}

curry(sum2)(1)(2); // 3
curry(sum4)(2)(3)(4)(5); // 14
