const getPromise = function (timeout) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      console.log(`${timeout}秒过去了！`);
      resolve(timeout);
    }, timeout * 1000);
  });
};

(async () => {
  const res = await Promise.race([getPromise(3), getPromise(6)]);
  console.log(res);
})();

// 经过测试，race中，有选手胜出后，其他选手仍然会跑至终点！不会被裁判赶出场外
