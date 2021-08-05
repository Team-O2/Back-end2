export function stringToArray(str: String) {
  let arrayStr = str.toLowerCase().replace("[", "").replace("]", "");

  let resultArr = [];
  let tmp = "";
  let cnt = 0;
  for (let i = 0; i < arrayStr.length; i++) {
    if (arrayStr.charAt(i) == '"') {
      cnt++;
      if (cnt % 2 == 1) {
        tmp = "";
      }
      if (tmp === "") {
        continue;
      }
      resultArr.push(tmp);
      tmp = "";
      i++;
    }
    tmp += arrayStr.charAt(i);
  }

  return resultArr;
}
