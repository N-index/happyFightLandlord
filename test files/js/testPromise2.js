const getPromise = (callback, seconds) => {
  return new Promise(resolve => {
    setTimeout(() => {
      callback();
      resolve();
    }, seconds * 1000);
  });
};
const callbacks = [
  () => {
    console.log('过去了1秒');
  },
  () => {
    console.log('又过去了2秒');
  },
  () => {
    console.log('又过去了3秒');
  },
  () => {
    console.log('又过去了4秒');
  },
  () => {
    console.log('又过去了5秒');
  },
];
const durations = [1, 2, 3, 4, 5, 6];
(function (callbacks, durations) {
  // 能不能通过 for 循环生成很多个 .then 呢？每个then中执行的回调由参数传入
  getPromise(callbacks[0], durations[0])
    .then(() => {
      return getPromise(callbacks[1], durations[1]);
    })
    .then(() => {
      return getPromise(callbacks[2], durations[2]);
    })
    .then(() => {
      return getPromise(callbacks[3], durations[3]);
    })
    .then(() => {
      return getPromise(callbacks[4], durations[4]);
    })
    .then(() => {
      return getPromise(callbacks[5], durations[5]);
    });
})(callbacks, durations);
