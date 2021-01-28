const oldArr = [1, 2, 3, 4, 5];
const newArr = [];

const callback = function () {
  newArr = oldArr.pop();
};

const oneStep = function (seconds, callback, param1, param2) {
  return new Promise(resolve => {
    setTimeout(() => {
      callback(param1, param2);
      resolve();
    }, seconds * 1000);
  });
};

oneStep(2, console.log, 'msg', 'hello world').then(() => {
  console.log('两秒过了');
});

const getPromise = function (seconds) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000);
  });
};

const callbacks = [
  callback1,
  callback2,
  callback3,
  callback4,
  callback5,
  callback6,
];
const allSteps = function (callbacks) {
  getPromise(2)
    .then(() => {
      callbacks[0]();
      getPromise(1);
    })
    .then(() => {
      callbacks[1]();
      getPromise(2);
    })
    .then(() => {
      callbacks[2]();
      getPromise(3);
    })
    .then(() => {
      callbacks[3]();
      getPromise(1);
    })
    .then(() => {
      callbacks[4]();
      getPromise(2);
    })
    .then(() => {
      callbacks[5]();
      getPromise(3);
    });
};
allSteps(6, callbacks);
