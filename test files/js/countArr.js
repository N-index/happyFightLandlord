// function getCounts(cards) {
//   let counts = {};
//   for (let card of cards) {
//     counts[card] = counts[card] ? counts[card] + 1 : 1;
//   }
//   return counts;
// }

// function filterCountsUnderLimit(counts, limit) {
//   for (let number in counts) {
//     if (counts[number] < limit) delete counts[number];
//   }
// }

// const arr = [88, 77, 77, 2, 2, 2, 1, 99, 99];
// const counts = getCounts(arr);
// console.log(counts);

// const arr1 = Object.entries(counts);
// console.log(arr1);

// const arr2 = arr1.filter(([, count]) => count === 3);
// console.log(arr2);

// const arr3 = arr2.map(([prop]) => parseInt(prop));
// console.log(arr3);

let arr = [9, 8, 7, 6, 5, 4, 3, 2, 1];
