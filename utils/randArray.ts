export default (array: any[]) => {
  array[(array.length * Math.random()) | 0];
};
