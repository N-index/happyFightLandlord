// Promise.all([
//   Promise.resolve('success all'),
//   Promise.reject('error'),
//   Promise.resolve('another success.'),
// ]).then(console.log);

Promise.allSettled([
  Promise.resolve('success'),
  Promise.reject('error'),
  Promise.resolve('another success.'),
]).then(console.log);
