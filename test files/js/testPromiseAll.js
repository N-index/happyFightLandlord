let one = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('2秒过去：one被resolve了。');
      resolve('one');
    }, 2000);
  });
};

let two = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('3秒过去：two被resolve了。');
      resolve('two ');
    }, 3000);
  });
};

Promise.all([one(), two()]).then(res => {
  console.log('全部resolve了', res);
});
