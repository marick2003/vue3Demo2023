var CodeMaker = function (o) {
  var options = o || {};
  this.logs = [];
  this.operation_condition = '';
  this.numberList = [];
  this.onLog = function () {};
  this.onError = function () {};
  this.onStart = function () {};
  this.onReset = function () {};
  this.onCompleted = function () {};
  this.options = {
    symbol: options.symbol || 'X',
    isXian: options.isXian || 0,
    firstNumber: options.firstNumber || '',
    secondNumber: options.secondNumber || '',
    thirdNumber: options.thirdNumber || '',
    fourthNumber: options.fourthNumber || '',
    fifthNumber: options.fifthNumber || '',
    numberType: options.numberType || 20,
    positionType: options.positionType || 0,
    positionFilter: options.positionFilter || 0,
    remainFixedFilter: options.remainFixedFilter || 0,
    remainFixedNumbers: options.remainFixedNumbers || [[[], []]],
    remainMatchFilter: options.remainMatchFilter || 0,
    remainMatchNumbers: options.remainMatchNumbers || [],
    remainValueRanges: options.remainValueRanges || [],
    transformNumbers: options.transformNumbers || [],
    upperNumbers: options.upperNumbers || [],
    exceptNumbers: options.exceptNumbers || [],
    fixedPositions: options.fixedPositions || [],
    symbolPositions: options.symbolPositions || [],
    containFilter: options.containFilter || 0,
    containNumbers: options.containNumbers || [],
    multipleFilter: options.multipleFilter || 0,
    multipleNumbers: options.multipleNumbers || [],
    repeatTwoWordsFilter: options.repeatTwoWordsFilter || -1,
    repeatThreeWordsFilter: options.repeatThreeWordsFilter || -1,
    repeatFourWordsFilter: options.repeatFourWordsFilter || -1,
    repeatDoubleWordsFilter: options.repeatDoubleWordsFilter || -1,
    twoBrotherFilter: options.twoBrotherFilter || -1,
    threeBrotherFilter: options.threeBrotherFilter || -1,
    fourBrotherFilter: options.fourBrotherFilter || -1,
    logarithmNumberFilter: options.logarithmNumberFilter || -1,
    logarithmNumbers: options.logarithmNumbers || [[]],
    oddNumberFilter: options.oddNumberFilter || -1,
    oddNumberPositions: options.oddNumberPositions || [],
    evenNumberFilter: options.evenNumberFilter || -1,
    evenNumberPositions: options.evenNumberPositions || [],
    bigNumberFilter: options.bigNumberFilter || -1,
    bigNumberPositions: options.bigNumberPositions || [],
    smallNumberFilter: options.smallNumberFilter || -1,
    smallNumberPositions: options.smallNumberPositions || [],
  };
};

CodeMaker.prototype.getPositionFixed = function () {
  var result = [];
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  var numbers = this.maker(true);
  var positions = [
    [0, options.firstNumber || common.defaultNumber + options.symbol],
    [1, options.secondNumber || common.defaultNumber + options.symbol],
    [2, options.thirdNumber || common.defaultNumber + options.symbol],
    [3, options.fourthNumber || common.defaultNumber + options.symbol],
  ];
  if (options.numberType == 50) {
    positions.push([
      4,
      options.fifthNumber || common.defaultNumber + options.symbol,
    ]);
  }
  for (var i = 0; i < numbers.length; i++) {
    var exist = true;
    for (var j = 0; j < positions.length; j++) {
      var containNumber = positions[j][1].split('');
      var containPosition = positions[j][0];
      if (
        common.indexOf(containNumber, numbers[i].charAt(containPosition)) == -1
      ) {
        exist = false;
      }
    }
    if (exist) {
      curNumbers.push(numbers[i]);
    }
  }
  if (this.options.positionFilter == 0) {
    result = curNumbers;
  } else {
    //if (options.firstNumber.length > 0 || options.secondNumber.length > 0 || options.thirdNumber.length > 0 || options.fourthNumber.length > 0) {
    var list = [];
    numbers = this.maker(true);
    for (var m = 0; m < numbers.length; m++) {
      if (common.indexOf(curNumbers, numbers[m]) == -1) {
        var notExist = true;
        for (var n = 0; n < positions.length; n++) {
          var exceptNumber = positions[n][1];
          var exceptPosition = positions[n][0];
          if (
            exceptNumber.length != 11 &&
            numbers[m].charAt(exceptPosition) == options.symbol
          ) {
            notExist = false;
          }
        }
        if (notExist) {
          list.push(numbers[m]);
        }
      }
    }
    result = list;
    //} else {
    //    result = this.maker(true);
    //}
  }
  return result;
};

CodeMaker.prototype.getPositionMatch = function () {
  var result = [];
  var common = this.common;
  var options = this.options;
  var positions = this.options.fixedPositions;
  if (
    options.numberType == 40 &&
    common.indexOf(positions, 1) != -1 &&
    (options.firstNumber.length > 0 ||
      options.secondNumber.length > 0 ||
      options.thirdNumber.length > 0 ||
      options.fourthNumber.length > 0)
  ) {
    var inputNumbers = [
      options.firstNumber,
      options.secondNumber,
      options.thirdNumber,
      options.fourthNumber,
    ];
    var discarts = common.discart(
      (positions[0] == 1
        ? 'x'
        : options.firstNumber || common.defaultNumber
      ).split(''),
      (positions[1] == 1
        ? 'x'
        : options.secondNumber || common.defaultNumber
      ).split(''),
      (positions[2] == 1
        ? 'x'
        : options.thirdNumber || common.defaultNumber
      ).split(''),
      (positions[3] == 1
        ? 'x'
        : options.fourthNumber || common.defaultNumber
      ).split('')
    );
    var totalNumbers = [];
    for (var i = 0; i < discarts.length; i++) {
      var data = [];
      var permutations = common.permutation(discarts[i], 4);
      for (var j = 0; j < permutations.length; j++) {
        data = data.concat(this.fixedFilter(permutations[j]));
      }
      data = common.unique(data);
      for (var k = 0; k < data.length; k++) {
        var single = data[k].split('');

        var allow = false;
        for (var n = 0; n < positions.length; n++) {
          if (positions[n] == 1 && single[n] != 'x') allow = true;
        }
        if (allow) continue;

        for (var m = 0; m < inputNumbers.length; m++) {
          if (single[m] == 'x') {
            single[m] =
              inputNumbers[m].length == 0
                ? common.defaultNumber
                : inputNumbers[m];
          }
        }

        var combine = [];
        var first = single[0].split('');
        var second = single[1].split('');
        var third = single[2].split('');
        var fourth = single[3].split('');
        var counter = 0;
        for (var a = 0; a < first.length; a++) {
          for (var b = 0; b < second.length; b++) {
            for (var c = 0; c < third.length; c++) {
              for (var d = 0; d < fourth.length; d++) {
                combine[counter] =
                  first[a] + '' + second[b] + '' + third[c] + '' + fourth[d];
                counter++;
              }
            }
          }
        }
        totalNumbers = totalNumbers.concat(combine);
      }
    }
    var uniqueNumbers = common.unique(totalNumbers);

    if (options.positionFilter == 0) {
      result = uniqueNumbers;
    } else {
      var curNumbers = uniqueNumbers;
      if (
        options.firstNumber.length > 0 ||
        options.secondNumber.length > 0 ||
        options.thirdNumber.length > 0 ||
        options.fourthNumber.length > 0
      ) {
        var allNumbers = this.maker(true);
        for (var i = 0; i < allNumbers.length; i++) {
          if (common.indexOf(curNumbers, allNumbers[i]) == -1) {
            result.push(allNumbers[i]);
          }
        }
      } else {
        result = curNumbers;
      }
    }
  } else {
    if (options.positionFilter == 0) {
      result = this.maker();
    } else {
      var curNumbers = this.maker();
      if (
        options.firstNumber.length > 0 ||
        options.secondNumber.length > 0 ||
        options.thirdNumber.length > 0 ||
        options.fourthNumber.length > 0 ||
        options.fifthNumber.length > 0
      ) {
        var allNumbers = this.maker(true);
        for (var i = 0; i < allNumbers.length; i++) {
          if (common.indexOf(curNumbers, allNumbers[i]) == -1) {
            result.push(allNumbers[i]);
          }
        }
      } else {
        result = curNumbers;
      }
    }
  }
  return result;
};

CodeMaker.prototype.getRemainFixed = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var fixedNumbers = options.remainFixedNumbers;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (fixedNumbers.length > 0) {
    var sumNumbers = [];
    for (var i = 0; i < numbers.length; i++) {
      var fixedChecked = true;
      var number = numbers[i];
      for (var j = 0; j < fixedNumbers.length; j++) {
        var sumFixed = -1;
        var data = fixedNumbers[j][1];
        var position = fixedNumbers[j][0];
        if (
          common.isArray(data) &&
          common.isArray(position) &&
          data.length > 0 &&
          common.indexOf(position, 1) != -1
        ) {
          var isValidNumber = true;
          for (var m = 0; m < position.length; m++) {
            if (position[m] == 1 && number.charAt(m) == options.symbol) {
              isValidNumber = false;
              break;
            }
          }
          if (isValidNumber) {
            for (var k = 0; k < position.length; k++) {
              if (position[k] == 1) {
                if (sumFixed == -1) {
                  sumFixed = Number(number.charAt(k));
                } else {
                  sumFixed += Number(number.charAt(k));
                }
              }
            }
          }
          if (
            sumFixed == -1 ||
            (sumFixed >= 0 &&
              common.indexOf(data, Math.round(sumFixed % 10)) == -1)
          ) {
            fixedChecked = false;
            break;
          }
        }
      }
      if (fixedChecked) {
        sumNumbers.push(numbers[i]);
      }
    }
    if (options.remainFixedFilter == 0) {
      result = sumNumbers;
    } else {
      for (var n = 0; n < numbers.length; n++) {
        if (common.indexOf(sumNumbers, numbers[n]) == -1) {
          result.push(numbers[n]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getRemainMatch = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var matchNumbers = common.unique(options.remainMatchNumbers);
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (matchNumbers.length > 0 && options.remainMatchFilter > 0) {
    for (var i = 0; i < numbers.length; i++) {
      var matchChecked = false;
      var pureNumbers = numbers[i]
        .replace(new RegExp(options.symbol, 'gi'), '')
        .split('');
      var combinNumbers = common.combination(
        pureNumbers,
        options.remainMatchFilter
      );
      for (var j = 0; j < combinNumbers.length; j++) {
        var sumCaculate = function (data) {
          var sum = -1;
          for (var k = 0; k < data.length; k++) {
            if (sum == -1) {
              sum = parseInt(data[k]);
            } else {
              sum += parseInt(data[k]);
            }
          }
          return Math.round(sum % 10);
        };
        var sumMatch = sumCaculate(combinNumbers[j]);
        if (sumMatch >= 0 && common.indexOf(matchNumbers, sumMatch) != -1) {
          matchChecked = true;
          break;
        }
      }
      if (matchChecked) {
        result.push(numbers[i]);
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getRemainRange = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var rangeNumbers = options.remainValueRanges;
  var minNumber;
  var maxNumber;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (rangeNumbers.length > 0 && options.numberType == 40) {
    if (rangeNumbers[0] >= 0 && rangeNumbers[1] >= 0) {
      minNumber = rangeNumbers[0];
      maxNumber = rangeNumbers[1];
    } else if (rangeNumbers[0] >= 0) {
      minNumber = rangeNumbers[0];
      maxNumber = rangeNumbers[0];
    } else {
      minNumber = rangeNumbers[1];
      maxNumber = rangeNumbers[1];
    }
    for (var i = 0; i < numbers.length; i++) {
      var sumRange =
        parseInt(numbers[i].charAt(0)) +
        parseInt(numbers[i].charAt(1)) +
        parseInt(numbers[i].charAt(2)) +
        parseInt(numbers[i].charAt(3));
      if (sumRange >= minNumber && sumRange <= maxNumber) {
        result.push(numbers[i]);
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getTransform = function () {
  var result = [];
  var numbers = [];
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.transformNumbers.length > 0) {
    var type = (options.numberType / 10) >> 0;
    if (type == 5) {
      type = 2;
    }
    var permutations = common.permutation(options.transformNumbers, type);
    for (var i = 0; i < permutations.length; i++) {
      curNumbers = curNumbers.concat(this.fixedFilter(permutations[i]));
    }
    for (var j = 0; j < numbers.length; j++) {
      if (common.indexOf(curNumbers, numbers[j]) != -1) {
        result.push(numbers[j]);
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getUpper = function () {
  var result = [];
  var numbers = [];
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  var uppers = options.upperNumbers;
  var data = [];
  var totalNumbers = [];
  var inputNumbers = [
    options.firstNumber,
    options.secondNumber,
    options.thirdNumber,
    options.fourthNumber,
  ];
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.numberType == 50) {
    inputNumbers.push(options.fifthNumber);
  }
  if (uppers.length > 0) {
    var validNumbers = [];
    var numberLength =
      (options.numberType / 10) >> 0 == 5 ? 2 : (options.numberType / 10) >> 0;
    var emptyLength = common.emptyCount(options);
    var allPositionLength = (options.numberType / 10) >> 0 == 5 ? 5 : 4;
    var positionLength =
      numberLength - Math.abs(allPositionLength - emptyLength);
    if (positionLength == 0) {
      result = [];
    } else {
      for (var i = 0; i < numbers.length; i++) {
        var numberRepeat = {};
        var single = numbers[i].split('');
        for (var j = 0; j < single.length; j++) {
          if (!numberRepeat[single[j]]) {
            numberRepeat[single[j]] = 1;
          } else {
            numberRepeat[single[j]]++;
          }
        }

        var upperRepeat = {};
        var existObj = {};

        for (var k = 0; k < uppers.length; k++) {
          if (!upperRepeat[uppers[k]]) {
            upperRepeat[uppers[k]] = 1;
          } else {
            upperRepeat[uppers[k]]++;
          }
        }

        var existNumber = 0;
        for (var j = 0; j < inputNumbers.length; j++) {
          if (inputNumbers[j].length == 0) {
            if (common.indexOf(uppers, single[j]) != -1) {
              existNumber++;
              if (!existObj[single[j]]) {
                existObj[single[j]] = 1;
              } else {
                existObj[single[j]]++;
              }
            }
          }
        }

        var isPass = true;
        var contain = false;
        if (uppers.length < positionLength) {
          //判断上奖位数是否小于空余位数
          for (var r = 0; r < uppers.length; r++) {
            if (
              upperRepeat[uppers[r]] > existObj[uppers[r]] ||
              !existObj[uppers[r]]
            ) {
              //判断是否存在每个上奖号码
              isPass = false;
              break;
            }
          }
          for (var z = 0; z < uppers.length; z++) {
            if (numberRepeat[uppers[z]]) {
              if (existNumber >= uppers.length && isPass) {
                contain = true;
              }
            }
          }
        } else {
          for (var r = 0; r < uppers.length; r++) {
            if (upperRepeat[uppers[r]] < existObj[uppers[r]]) {
              //判断存在的每个上奖号码数量是否符合
              isPass = false;
              break;
            }
          }
          for (var z = 0; z < uppers.length; z++) {
            if (numberRepeat[uppers[z]]) {
              if (existNumber == positionLength && isPass) {
                contain = true;
              }
            }
          }
        }

        if (contain) {
          validNumbers.push(numbers[i]);
        }
      }

      //号码排序
      result = common.unique(validNumbers).sort();
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getExcept = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var excepts = options.exceptNumbers;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (excepts.length > 0) {
    for (var i = 0; i < numbers.length; i++) {
      var contain = false;
      var number = numbers[i];
      for (var j = 0; j < excepts.length; j++) {
        if (common.indexOf(number, excepts[j]) != -1) {
          contain = true;
          break;
        }
      }
      if (!contain) {
        result.push(numbers[i]);
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getSymbol = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var positions = options.symbolPositions;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (common.indexOf(positions, 1) != -1) {
    for (var i = 0; i < numbers.length; i++) {
      var checked = true;
      for (var j = 0; j < positions.length; j++) {
        if (positions[j] == 1 && numbers[i].charAt(j) != options.symbol) {
          checked = false;
        }
      }
      if (checked) {
        result.push(numbers[i]);
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getContain = function () {
  var result = [];
  var numbers = [];
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  var contains = options.containNumbers;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (contains.length > 0) {
    for (var i = 0; i < numbers.length; i++) {
      var contain = false;
      var number = numbers[i];
      for (var j = 0; j < contains.length; j++) {
        if (common.indexOf(number, contains[j]) != -1) {
          contain = true;
          break;
        }
      }
      if (contain) {
        curNumbers.push(numbers[i]);
      }
    }
    if (options.containFilter == 0) {
      result = curNumbers;
    } else {
      for (var k = 0; k < numbers.length; k++) {
        if (common.indexOf(curNumbers, numbers[k]) == -1) {
          result.push(numbers[k]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getMultiple = function () {
  var result = [];
  var numbers = [];
  var discarts = [];
  var curNumbers = [];
  var allNumbers = [];
  var common = this.common;
  var options = this.options;
  var multiples = common.unique(options.multipleNumbers);
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (multiples.length > 0) {
    if (options.numberType == 20 || options.numberType == 21) {
      discarts = common.discart(multiples, multiples);
    } else if (options.numberType == 30 || options.numberType == 31) {
      discarts = common.discart(multiples, multiples, multiples);
    } else if (options.numberType == 40 || options.numberType == 41) {
      discarts = common.discart(multiples, multiples, multiples, multiples);
    } else if (options.numberType == 50) {
      discarts = common.discart(multiples, multiples);
    }
    for (var i = 0; i < discarts.length; i++) {
      allNumbers = allNumbers.concat(this.fixedFilter(discarts[i]));
    }
    allNumbers = common.unique(allNumbers);
    for (var j = 0; j < numbers.length; j++) {
      if (options.multipleFilter == 0) {
        if (common.indexOf(allNumbers, numbers[j]) != -1) {
          result.push(numbers[j]);
        }
      } else {
        if (common.indexOf(allNumbers, numbers[j]) == -1) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getRepeat = function () {
  var repeat = {};
  var result = false;
  var data = arguments[0];
  var time = arguments[1];
  var numbers = data
    .replace(new RegExp(this.options.symbol, 'gi'), '')
    .split('');
  for (var i = 0; i < numbers.length; i++) {
    if (!repeat[numbers[i]]) {
      repeat[numbers[i]] = 1;
    } else {
      repeat[numbers[i]]++;
      if (repeat[numbers[i]] == time) {
        result = true;
        break;
      }
    }
  }
  return result;
};

CodeMaker.prototype.getRepeatTwoWords = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.repeatTwoWordsFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      if (this.getRepeat(numbers[i], 2)) {
        curNumbers.push(numbers[i]);
        intersect[numbers[i]] = 1;
      }
    }
    if (options.repeatTwoWordsFilter == 0) {
      result = curNumbers;
    } else if (options.repeatTwoWordsFilter == 1) {
      for (var j = 0; j < numbers.length; j++) {
        if (!intersect[numbers[j]]) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getRepeatDoubleWords = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.repeatDoubleWordsFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      var repeat = {};
      var repeatCount = 0;
      var isRepeat = false;

      var data = numbers[i]
        .replace(new RegExp(this.options.symbol, 'gi'), '')
        .split('');
      for (var j = 0; j < data.length; j++) {
        if (!repeat[data[j]]) {
          repeat[data[j]] = 1;
        } else {
          repeat[data[j]] = 0;
          repeatCount++;
          if (repeatCount == 2) {
            isRepeat = true;
            break;
          }
        }
      }
      if (isRepeat) {
        intersect[numbers[i]] = 1;
        curNumbers.push(numbers[i]);
      }
    }
    if (options.repeatDoubleWordsFilter == 0) {
      result = curNumbers;
    } else if (options.repeatDoubleWordsFilter == 1) {
      for (var k = 0; k < numbers.length; k++) {
        if (!intersect[numbers[k]]) {
          result.push(numbers[k]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getRepeatThreeWords = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.repeatThreeWordsFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      if (this.getRepeat(numbers[i], 3)) {
        curNumbers.push(numbers[i]);
        intersect[numbers[i]] = 1;
      }
    }
    if (options.repeatThreeWordsFilter == 0) {
      result = curNumbers;
    } else if (options.repeatThreeWordsFilter == 1) {
      for (var j = 0; j < numbers.length; j++) {
        if (!intersect[numbers[j]]) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getRepeatFourWords = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.repeatFourWordsFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      if (this.getRepeat(numbers[i], 4)) {
        curNumbers.push(numbers[i]);
        intersect[numbers[i]] = 1;
      }
    }
    if (options.repeatFourWordsFilter == 0) {
      result = curNumbers;
    } else if (options.repeatFourWordsFilter == 1) {
      for (var j = 0; j < numbers.length; j++) {
        if (!intersect[numbers[j]]) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getBrother = function () {
  var count = 0;
  var data = arguments[0];
  var times = arguments[1];
  var common = this.common;
  var options = this.options;
  var position = 0;
  var numbers = common
    .unique(data.replace(new RegExp(this.options.symbol, 'gi'), '').split(''))
    .sort();
  for (var i = 0; i < numbers.length; i++) {
    if (parseInt(numbers[i + 1]) - parseInt(numbers[i]) == 1) {
      if (times == 2) {
        count++;
      } else if (times == 3) {
        if (position == 0) {
          count++;
          position = numbers[i + 1];
        } else {
          if (numbers[i + 1] - position == 1) {
            count++;
            position = numbers[i + 1];
          }
        }
      } else {
        count++;
      }
    }
  }
  var getNumber = function (n) {
    return parseInt(numbers[n]);
  };
  if (Math.abs(getNumber(0) - getNumber(numbers.length - 1)) == 9) {
    if (times == 2) {
      count++;
    } else if (times == 3) {
      if (
        getNumber(1) - getNumber(0) == 1 ||
        getNumber(numbers.length - 1) - getNumber(numbers.length - 2) == 1
      ) {
        count++;
      }
    } else {
      count++;
    }
  }
  if (count >= times - 1) {
    return true;
  }
};

CodeMaker.prototype.getTwoBrother = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.twoBrotherFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      if (this.getBrother(numbers[i], 2)) {
        curNumbers.push(numbers[i]);
        intersect[numbers[i]] = 1;
      }
    }
    if (options.twoBrotherFilter == 0) {
      result = curNumbers;
    } else if (options.twoBrotherFilter == 1) {
      for (var j = 0; j < numbers.length; j++) {
        if (!intersect[numbers[j]]) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getThreeBrother = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.threeBrotherFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      if (this.getBrother(numbers[i], 3)) {
        curNumbers.push(numbers[i]);
        intersect[numbers[i]] = 1;
      }
    }
    if (options.threeBrotherFilter == 0) {
      result = curNumbers;
    } else if (options.threeBrotherFilter == 1) {
      for (var j = 0; j < numbers.length; j++) {
        if (!intersect[numbers[j]]) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getFourBrother = function () {
  var result = [];
  var numbers = [];
  var intersect = {};
  var curNumbers = [];
  var common = this.common;
  var options = this.options;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  if (options.fourBrotherFilter != -1) {
    for (var i = 0; i < numbers.length; i++) {
      if (this.getBrother(numbers[i], 4)) {
        curNumbers.push(numbers[i]);
        intersect[numbers[i]] = 1;
      }
    }
    if (options.fourBrotherFilter == 0) {
      result = curNumbers;
    } else if (options.fourBrotherFilter == 1) {
      for (var j = 0; j < numbers.length; j++) {
        if (!intersect[numbers[j]]) {
          result.push(numbers[j]);
        }
      }
    }
  } else {
    result = numbers;
  }
  return result;
};

CodeMaker.prototype.getLogarithm = function () {
  var result = [];
  var numbers = [];
  var curNumbers = [];
  var chekNumbers = [];
  var common = this.common;
  var options = this.options;
  var logarithmNumbers = options.logarithmNumbers;
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  var chekLogarithm = function (n) {
    var data = n.replace(new RegExp(options.symbol, 'gi'), '').split('');
    var list = common.permutation(data, 2);
    for (var i = 0; i < list.length; i++) {
      if (Math.abs(parseInt(list[i][0]) - parseInt(list[i][1])) == 5) {
        return true;
      }
    }
  };
  var getContain = function (n) {
    var list = [];
    for (var i = 0; i < numbers.length; i++) {
      var contain = true;
      for (var j = 0; j < n.length; j++) {
        if (common.indexOf(numbers[i], n[j]) == -1) {
          contain = false;
          break;
        }
      }
      if (contain) {
        list.push(numbers[i]);
      }
    }
    return list;
  };
  //判断是否存在对数号码
  if (logarithmNumbers.length > 0) {
    for (var m = 0; m < logarithmNumbers.length; m++) {
      curNumbers = curNumbers.concat(getContain(logarithmNumbers[m]));
    }
  } else {
    curNumbers = numbers.slice(0);
  }

  for (var i = 0; i < curNumbers.length; i++) {
    if (chekLogarithm(curNumbers[i])) {
      chekNumbers.push(curNumbers[i]);
    }
  }
  if (options.logarithmNumberFilter == 0) {
    result = chekNumbers;
  } else if (options.logarithmNumberFilter == 1) {
    for (var j = 0; j < numbers.length; j++) {
      if (chekNumbers.indexOf(numbers[j]) == -1) {
        result.push(numbers[j]);
      }
    }
  }
  return this.common.unique(result);
};

CodeMaker.prototype.getOdd = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var curNumbers = [];
  var positions = options.oddNumberPositions;
  var i,
    len,
    reg,
    str_reg = '';
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  //满足[x, x, x, x]中至少有一个选中且 取 或 除至少选一个
  if (common.indexOf(positions, 1) != -1 && options.oddNumberFilter != -1) {
    for (i = 0, len = positions.length; i < len; i++) {
      str_reg += positions[i] ? '[13579]' : '[\\w\\d]';
    }
    reg = new RegExp(str_reg);
    for (i = 0, len = numbers.length; i < len; i++) {
      if (options.oddNumberFilter == 0) {
        //取
        if (reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      } else {
        if (!reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      }
    }
  }
  return result;
};

CodeMaker.prototype.getEven = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var curNumbers = [];
  var positions = options.evenNumberPositions;
  var i,
    len,
    reg,
    str_reg = '';
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }
  //满足[x, x, x, x]中至少有一个选中且 取 或 除至少选一个
  if (common.indexOf(positions, 1) != -1 && options.evenNumberFilter != -1) {
    for (i = 0, len = positions.length; i < len; i++) {
      str_reg += positions[i] ? '[02468]' : '[\\w\\d]';
    }
    reg = new RegExp(str_reg);
    for (i = 0, len = numbers.length; i < len; i++) {
      if (options.evenNumberFilter == 0) {
        //取
        if (reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      } else {
        if (!reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      }
    }
  }
  return result;
};

CodeMaker.prototype.getBig = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var curNumbers = [];
  var positions = options.bigNumberPositions;
  var i,
    len,
    reg,
    str_reg = '';
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }

  //满足[x, x, x, x]中至少有一个选中且 取 或 除至少选一个
  if (common.indexOf(positions, 1) != -1 && options.bigNumberFilter != -1) {
    for (i = 0, len = positions.length; i < len; i++) {
      str_reg += positions[i] ? '[56789]' : '[\\w\\d]';
    }
    reg = new RegExp(str_reg);
    for (i = 0, len = numbers.length; i < len; i++) {
      if (options.bigNumberFilter == 0) {
        //取
        if (reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      } else {
        if (!reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      }
    }
  }

  return result;
};

CodeMaker.prototype.getSmall = function () {
  var result = [];
  var numbers = [];
  var common = this.common;
  var options = this.options;
  var curNumbers = [];
  var positions = options.smallNumberPositions;
  var i,
    len,
    reg,
    str_reg = '';
  if (arguments.length > 0) {
    numbers = arguments[0];
  } else {
    numbers = this.maker();
  }

  //满足[x, x, x, x]中至少有一个选中且 取 或 除至少选一个
  if (common.indexOf(positions, 1) != -1 && options.smallNumberFilter != -1) {
    for (i = 0, len = positions.length; i < len; i++) {
      str_reg += positions[i] ? '[01234]' : '[\\w\\d]';
    }
    reg = new RegExp(str_reg);
    for (i = 0, len = numbers.length; i < len; i++) {
      if (options.smallNumberFilter == 0) {
        //取
        if (reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      } else {
        if (!reg.test(numbers[i])) {
          result.push(numbers[i]);
        }
      }
    }
  }

  return result;
};

CodeMaker.prototype.generate = function () {
  var numbers = [];
  var options = this.options;
  var canGenerate = false;
  if (this.onStart && typeof this.onStart === 'function') {
    this.onStart(options);
  }
  if (options.positionType == 0) {
    numbers = this.getPositionFixed();
  } else {
    numbers = this.getPositionMatch();
  }
  if (
    options.firstNumber.length > 0 ||
    options.secondNumber.length > 0 ||
    options.thirdNumber.length > 0 ||
    options.fourthNumber.length > 0 ||
    options.fifthNumber.length > 0
  ) {
    canGenerate = true;
  }
  if (options.remainFixedNumbers.length > 0) {
    var fixedNumbers = options.remainFixedNumbers;
    var enter = false;
    for (var i = 0; i < fixedNumbers.length; i++) {
      var data = fixedNumbers[i][1];
      var position = fixedNumbers[i][0];
      if (data.length > 0 && this.common.indexOf(position, 1) != -1) {
        canGenerate = true;
        var enter = true;
      }
    }
    if (enter) {
      numbers = this.getRemainFixed(numbers);
    }
  }
  if (options.remainMatchNumbers.length > 0 && options.remainMatchFilter > 0) {
    canGenerate = true;
    numbers = this.getRemainMatch(numbers);
  }
  if (options.remainValueRanges.length > 0) {
    canGenerate = true;
    numbers = this.getRemainRange(numbers);
  }
  if (options.transformNumbers.length > 0) {
    canGenerate = true;
    numbers = this.getTransform(numbers);
  }
  if (options.upperNumbers.length > 0 && options.positionType == 0) {
    canGenerate = true;
    numbers = this.getUpper(numbers);
  }
  if (options.exceptNumbers.length > 0) {
    canGenerate = true;
    numbers = this.getExcept(numbers);
  }
  if (this.common.indexOf(options.symbolPositions, 1) != -1) {
    canGenerate = true;
    numbers = this.getSymbol(numbers);
  }
  if (options.containNumbers.length > 0) {
    canGenerate = true;
    numbers = this.getContain(numbers);
  }
  if (options.multipleNumbers.length > 0) {
    canGenerate = true;
    numbers = this.getMultiple(numbers);
  }
  if (options.repeatTwoWordsFilter != -1) {
    canGenerate = true;
    numbers = this.getRepeatTwoWords(numbers);
  }
  if (options.repeatThreeWordsFilter != -1) {
    canGenerate = true;
    numbers = this.getRepeatThreeWords(numbers);
  }
  if (options.repeatFourWordsFilter != -1) {
    canGenerate = true;
    numbers = this.getRepeatFourWords(numbers);
  }
  if (options.repeatDoubleWordsFilter != -1) {
    canGenerate = true;
    numbers = this.getRepeatDoubleWords(numbers);
  }

  //取兄弟
  if (options.twoBrotherFilter != -1) {
    canGenerate = true;
    numbers = this.getTwoBrother(numbers);
  }
  if (options.threeBrotherFilter != -1) {
    canGenerate = true;
    numbers = this.getThreeBrother(numbers);
  }
  if (options.fourBrotherFilter != -1) {
    canGenerate = true;
    numbers = this.getFourBrother(numbers);
  }

  if (options.logarithmNumberFilter != -1) {
    canGenerate = true;
    numbers = this.getLogarithm(numbers);
  }
  if (
    options.oddNumberFilter != -1 &&
    this.common.indexOf(options.oddNumberPositions, 1) != -1
  ) {
    canGenerate = true;
    numbers = this.getOdd(numbers);
  }
  if (
    options.evenNumberFilter != -1 &&
    this.common.indexOf(options.evenNumberPositions, 1) != -1
  ) {
    canGenerate = true;
    numbers = this.getEven(numbers);
  }
  if (
    options.bigNumberFilter != -1 &&
    options.bigNumberFilter != undefined &&
    options.bigNumberPositions != undefined &&
    this.common.indexOf(options.bigNumberPositions, 1) != -1
  ) {
    canGenerate = true;
    numbers = this.getBig(numbers);
  }
  if (
    options.smallNumberFilter != -1 &&
    options.smallNumberFilter != undefined &&
    options.smallNumberPositions != undefined &&
    this.common.indexOf(options.smallNumberPositions, 1) != -1
  ) {
    canGenerate = true;
    numbers = this.getSmall(numbers);
  }
  if (
    options.positionType == 1 &&
    options.numberType != 21 &&
    options.numberType != 31 &&
    options.numberType != 41 &&
    !options.firstNumber &&
    !options.secondNumber &&
    !options.thirdNumber &&
    !options.fourthNumber &&
    !options.fifthNumber
  ) {
    canGenerate = false;
  }
  if (this.onCompleted && typeof this.onCompleted === 'function') {
    if (canGenerate) {
      this.numberList = numbers.sort();
      this.onCompleted(numbers);
    } else {
      if (this.onError && typeof this.onError === 'function') {
        this.onError();
      }
    }
  }
  if (this.onLog && typeof this.onLog === 'function') {
    this.onLog(this.log());
  }
};

CodeMaker.prototype.reset = function () {
  this.logs = [];
  this.operation_condition = '';
  this.numberList = [];
  this.options.firstNumber = '';
  this.options.secondNumber = '';
  this.options.thirdNumber = '';
  this.options.fourthNumber = '';
  this.options.fifthNumber = '';
  this.options.positionFilter = 0;
  this.options.remainFixedFilter = 0;
  this.options.remainFixedNumbers = [[[], []]];
  this.options.remainMatchFilter = 0;
  this.options.remainMatchNumbers = [];
  this.options.remainValueRanges = [];
  this.options.transformNumbers = [];
  this.options.upperNumbers = [];
  this.options.exceptNumbers = [];
  this.options.symbolPositions = [];
  this.options.containFilter = 0;
  this.options.containNumbers = [];
  this.options.multipleFilter = 0;
  this.options.multipleNumbers = [];
  this.options.repeatTwoWordsFilter = -1;
  this.options.repeatThreeWordsFilter = -1;
  this.options.repeatFourWordsFilter = -1;
  this.options.repeatDoubleWordsFilter = -1;
  this.options.twoBrotherFilter = -1;
  this.options.threeBrotherFilter = -1;
  this.options.fourBrotherFilter = -1;
  this.options.logarithmNumberFilter = -1;
  this.options.logarithmNumbers = [[]];
  this.options.oddNumberFilter = -1;
  this.options.oddNumberPositions = [];
  this.options.evenNumberFilter = -1;
  this.options.evenNumberPositions = [];
  this.options.bigNumberFilter = -1;
  this.options.bigNumberPositions = [];
  this.options.smallNumberFilter = -1;
  this.options.smallNumberPositions = [];

  if (
    this.options.numberType == 20 ||
    this.options.numberType == 30 ||
    this.options.numberType == 40 ||
    this.options.numberType == 50
  ) {
    this.options.positionType = 0;
  } else {
    this.options.positionType = 1;
  }
  if (this.onReset && typeof this.onReset === 'function') {
    this.onReset();
  }
};

CodeMaker.prototype.choose = function () {
  var options = this.options;
  var numberType = arguments[0];
  switch (numberType) {
    case 20:
      options.numberType = 20;
      options.positionType = 0;
      options.isXian = 0;
      break;
    case 30:
      options.numberType = 30;
      options.positionType = 0;
      options.isXian = 0;
      break;
    case 40:
      options.numberType = 40;
      options.positionType = 0;
      options.isXian = 0;
      break;
    case 21:
      options.numberType = 21;
      options.positionType = 1;
      options.isXian = 1;
      break;
    case 31:
      options.numberType = 31;
      options.positionType = 1;
      options.isXian = 1;
      break;
    case 41:
      options.numberType = 41;
      options.positionType = 1;
      options.isXian = 1;
      break;
    case 50:
      options.numberType = 50;
      options.positionType = 0;
      options.isXian = 0;
      break;
  }
};

CodeMaker.prototype.log = function () {
  var result = [];
  var common = this.common;
  var options = this.options;
  switch (options.numberType) {
    case 20:
      result.push('[二定位]');
      break;
    case 30:
      result.push('[三定位]');
      break;
    case 40:
      result.push('[四定位]');
      break;
    case 21:
      result.push('[二字现]');
      break;
    case 31:
      result.push('[三字现]');
      break;
    case 41:
      result.push('[四字现]');
      break;
    case 50:
      result.push('[五位二定]');
      break;
  }

  if (
    options.firstNumber.length > 0 ||
    options.secondNumber.length > 0 ||
    options.thirdNumber.length > 0 ||
    options.fourthNumber.length > 0 ||
    options.fifthNumber.length > 0
  ) {
    var positionBuilder = '';
    if (options.positionType == 0) {
      if (options.firstNumber.length > 0) {
        positionBuilder += '千=[' + options.firstNumber + ']';
      }
      if (options.secondNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        positionBuilder += '百=[' + options.secondNumber + ']';
      }
      if (options.thirdNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        positionBuilder += '十=[' + options.thirdNumber + ']';
      }
      if (options.fourthNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        positionBuilder += '个=[' + options.fourthNumber + ']';
      }
      if (options.fifthNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        positionBuilder += '五=[' + options.fifthNumber + ']';
      }
      if (options.positionFilter == 0) {
        result.push('定位置“[取]”：' + positionBuilder);
      } else {
        result.push('定位置“[除]”：' + positionBuilder);
      }
    } else {
      if (options.firstNumber.length > 0) {
        positionBuilder += '第1位：[' + options.firstNumber + ']';
      }
      if (options.secondNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        positionBuilder += '第2位：[' + options.secondNumber + ']';
      }
      if (options.thirdNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        positionBuilder += '第3位：[' + options.thirdNumber + ']';
      }
      if (options.fourthNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        var n = options.numberType == 50 ? 1 : 4;
        positionBuilder += '第' + n + '位：[' + options.fourthNumber + ']';
      }
      if (options.fifthNumber.length > 0) {
        if (positionBuilder.length > 0) {
          positionBuilder += '，';
        }
        var n = options.numberType == 50 ? 2 : 5;
        positionBuilder += '第' + n + '位：[' + options.fifthNumber + ']';
      }

      if (options.positionFilter == 0) {
        result.push('配数“[取]”：' + positionBuilder);
      } else {
        result.push('配数“[除]”：' + positionBuilder);
      }
    }
  }

  if (options.remainFixedNumbers.length > 0) {
    var fixedNumbers = options.remainFixedNumbers;
    var fixedBuilder = '';
    var fixedClass = options.remainFixedFilter == 0 ? '取' : '除';
    for (var i = 0; i < fixedNumbers.length; i++) {
      if (
        common.isArray(fixedNumbers[i][0]) &&
        common.isArray(fixedNumbers[i][1]) &&
        fixedNumbers[i][1].length > 0 &&
        common.indexOf(fixedNumbers[i][0], 1) != -1
      ) {
        for (var j = 0; j < fixedNumbers[i][0].length; j++) {
          if (fixedNumbers[i][0][j] == 1) {
            fixedBuilder += '第[' + (j + 1) + ']位选中，';
          }
        }
        fixedBuilder += '内容：[' + fixedNumbers[i][1].join('') + ']；';
      }
    }
    result.push('固定合分' + fixedClass + '值：' + fixedBuilder);
  }
  if (options.remainMatchNumbers.length > 0) {
    if (options.remainMatchFilter != 0) {
      result.push(
        '不定合分值(' +
          (options.remainMatchFilter == 2 ? '两数合' : '三数合') +
          ')：[' +
          options.remainMatchNumbers.join('') +
          ']'
      );
    }
  }
  if (options.remainValueRanges.length > 0) {
    result.push('合分值范围：[' + options.remainValueRanges.join('-') + ']');
  }
  if (options.transformNumbers.length > 0) {
    result.push('全转数：[' + options.transformNumbers.join('') + ']');
  }
  if (options.upperNumbers.length > 0) {
    result.push('上奖数：[' + options.upperNumbers.join('') + ']');
  }
  if (options.exceptNumbers.length > 0) {
    result.push('排除数：[' + options.exceptNumbers.join('') + ']');
  }
  if (common.indexOf(options.symbolPositions, 1) != -1) {
    var symbolBuilder = '';
    var symbolList = options.symbolPositions;
    for (var n = 0; n < symbolList.length; n++) {
      if (symbolList[n] == 1) {
        if (symbolBuilder.length == 0) {
          symbolBuilder = '第[' + (n + 1) + ']位';
        } else {
          symbolBuilder += '，第[' + (n + 1) + ']位';
        }
      }
    }
    result.push('乘号位置：' + symbolBuilder + '');
  }

  if (common.indexOf(options.fixedPositions, 1) != -1) {
    var fixedPositionBuilder = '';
    var fixedPositionList = options.fixedPositions;
    for (var n = 0; n < fixedPositionList.length; n++) {
      if (fixedPositionList[n] == 1) {
        if (fixedPositionBuilder.length == 0) {
          fixedPositionBuilder = '第[' + (n + 1) + ']位';
        } else {
          fixedPositionBuilder += '，第[' + (n + 1) + ']位';
        }
      }
    }
    result.push('固定位置：' + fixedPositionBuilder + '');
  }

  if (options.containNumbers.length > 0) {
    if (options.containFilter == 0) {
      result.push('包含“[取]”数：[' + options.containNumbers.join('') + ']');
    } else {
      result.push('包含“[除]”数：[' + options.containNumbers.join('') + ']');
    }
  }

  if (options.multipleNumbers.length > 0) {
    if (options.multipleFilter == 0) {
      result.push('复式“[取]”数：[' + options.multipleNumbers.join('') + ']');
    } else {
      result.push('复式“[除]”数：[' + options.multipleNumbers.join('') + ']');
    }
  }

  if (options.repeatTwoWordsFilter != -1) {
    if (options.repeatTwoWordsFilter == 0) {
      result.push('双重“[取]”操作');
    } else {
      result.push('双重“[除]”操作');
    }
  }

  if (options.repeatDoubleWordsFilter != -1) {
    if (options.repeatDoubleWordsFilter == 0) {
      result.push('双双重“[取]”操作');
    } else {
      result.push('双双重“[除]”操作');
    }
  }

  if (options.repeatThreeWordsFilter != -1) {
    if (options.repeatThreeWordsFilter == 0) {
      result.push('三重“[取]”操作');
    } else {
      result.push('三重“[除]”操作');
    }
  }

  if (options.repeatFourWordsFilter != -1) {
    if (options.repeatFourWordsFilter == 0) {
      result.push('四重“[取]”操作');
    } else {
      result.push('四重“[除]”操作');
    }
  }

  if (options.twoBrotherFilter != -1) {
    if (options.twoBrotherFilter == 0) {
      result.push('二兄弟“[取]”操作');
    } else {
      result.push('二兄弟“[除]”操作');
    }
  }

  if (options.threeBrotherFilter != -1) {
    if (options.threeBrotherFilter == 0) {
      result.push('三兄弟“[取]”操作');
    } else {
      result.push('三兄弟“[除]”操作');
    }
  }

  if (options.fourBrotherFilter != -1) {
    if (options.fourBrotherFilter == 0) {
      result.push('四兄弟“[取]”操作');
    } else {
      result.push('四兄弟“[除]”操作');
    }
  }

  if (options.logarithmNumberFilter != -1) {
    if (options.logarithmNumbers.length > 0) {
      var logarithmNumbers = '';
      for (var k = 0; k < options.logarithmNumbers.length; k++) {
        logarithmNumbers += '[' + options.logarithmNumbers[k].join('') + ']，';
      }
      if (options.logarithmNumberFilter <= 0) {
        result.push('对数“[取]”数：' + logarithmNumbers);
      } else if (options.logarithmNumberFilter == 1) {
        result.push('对数“[除]”数：' + logarithmNumbers);
      }
    } else {
      if (options.logarithmNumberFilter == 0) {
        result.push('对数“[取]”操作');
      } else if (options.logarithmNumberFilter == 1) {
        result.push('对数“[除]”操作');
      }
    }
  }

  if (options.oddNumberFilter != -1) {
    var oddBuilder = '';
    var oddList = options.oddNumberPositions;
    for (var m = 0; m < oddList.length; m++) {
      if (oddList[m] == 1) {
        if (oddBuilder.length == 0) {
          oddBuilder = '第[' + (m + 1) + ']位';
        } else {
          oddBuilder += '，第[' + (m + 1) + ']位';
        }
      }
    }
    if (options.oddNumberFilter == 0) {
      result.push('单数“[取]”数：' + oddBuilder);
    } else {
      result.push('单数“[除]”数：' + oddBuilder);
    }
  }

  if (options.evenNumberFilter != -1) {
    var evenBuilder = '';
    var evenList = options.evenNumberPositions;
    for (var u = 0; u < evenList.length; u++) {
      if (evenList[u] == 1) {
        if (evenBuilder.length == 0) {
          evenBuilder = '第[' + (u + 1) + ']位';
        } else {
          evenBuilder += '，第[' + (u + 1) + ']位';
        }
      }
    }
    if (options.evenNumberFilter == 0) {
      result.push('双数“[取]”数：' + evenBuilder);
    } else {
      result.push('双数“[除]”数：' + evenBuilder);
    }
  }
  if (options.bigNumberFilter != -1 && options.bigNumberFilter != undefined) {
    var bigBuilder = '';
    var bigList = options.bigNumberPositions;
    for (var m = 0; m < bigList.length; m++) {
      if (bigList[m] == 1) {
        if (bigBuilder.length == 0) {
          bigBuilder = '第[' + (m + 1) + ']位';
        } else {
          bigBuilder += '，第[' + (m + 1) + ']位';
        }
      }
    }
    if (options.bigNumberFilter == 0) {
      result.push('大数“[取]”数：' + bigBuilder);
    } else {
      result.push('大数“[除]”数：' + bigBuilder);
    }
  }

  if (
    options.smallNumberFilter != -1 &&
    options.smallNumberFilter != undefined
  ) {
    var smallBuilder = '';
    var smallList = options.smallNumberPositions;
    for (var u = 0; u < smallList.length; u++) {
      if (smallList[u] == 1) {
        if (smallBuilder.length == 0) {
          smallBuilder = '第[' + (u + 1) + ']位';
        } else {
          smallBuilder += '，第[' + (u + 1) + ']位';
        }
      }
    }
    if (options.smallNumberFilter == 0) {
      result.push('小数“[取]”数：' + smallBuilder);
    } else {
      result.push('小数“[除]”数：' + smallBuilder);
    }
  }
  this.logs = result;
  return result;
};

CodeMaker.prototype.maker = function () {
  var exist = {};
  var result = [];
  var discarts = [];
  var isGetAll = false;
  var common = this.common;
  var options = this.options;
  var symbol = options.symbol;
  var numberType = options.numberType;
  var positionType = options.positionType;
  var numbers = [
    options.firstNumber.split(''),
    options.secondNumber.split(''),
    options.thirdNumber.split(''),
    options.fourthNumber.split(''),
    options.fifthNumber.split(''),
  ];
  if (arguments.length > 0) {
    isGetAll = arguments[0];
  }
  for (var i = 0; i < numbers.length; i++) {
    if (numbers[i].length <= 0 || isGetAll) {
      numbers[i] = common.defaultNumber.split('');
    }
  }
  if (options.numberType == 20 || options.numberType == 21) {
    discarts = this.common.discart(numbers[0], numbers[1]);
  } else if (options.numberType == 30 || options.numberType == 31) {
    discarts = this.common.discart(numbers[0], numbers[1], numbers[2]);
  } else if (options.numberType == 40 || options.numberType == 41) {
    discarts = this.common.discart(
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3]
    );
  } else if (options.numberType == 50) {
    var chooseNumber = '';
    for (var i = 0; i < numbers.length - 1; i++) {
      if (numbers[i].length > 0) {
        chooseNumber = numbers[i];
      }
    }
    if (chooseNumber.length <= 0) {
      chooseNumber = common.defaultNumber.split('');
    }
    discarts = this.common.discart(chooseNumber, numbers[4]);
  }
  for (var j = 0; j < discarts.length; j++) {
    var number = discarts[j];
    if (numberType == 20) {
      if (positionType == 1) {
        result.push(number[0] + '' + number[1] + '' + symbol + '' + symbol);
        result.push(number[1] + '' + number[0] + '' + symbol + '' + symbol);
        result.push(number[0] + '' + symbol + '' + number[1] + '' + symbol);
        result.push(number[1] + '' + symbol + '' + number[0] + '' + symbol);
        result.push(number[0] + '' + symbol + '' + symbol + '' + number[1]);
        result.push(number[1] + '' + symbol + '' + symbol + '' + number[0]);
        result.push(symbol + '' + number[1] + '' + symbol + '' + number[0]);
        result.push(symbol + '' + number[0] + '' + symbol + '' + number[1]);
        result.push(symbol + '' + number[1] + '' + number[0] + '' + symbol);
        result.push(symbol + '' + number[0] + '' + number[1] + '' + symbol);
        result.push(symbol + '' + symbol + '' + number[1] + '' + number[0]);
        result.push(symbol + '' + symbol + '' + number[0] + '' + number[1]);
      } else {
        result.push(number[0] + '' + number[1] + '' + symbol + '' + symbol);
        result.push(number[0] + '' + symbol + '' + number[1] + '' + symbol);
        result.push(number[0] + '' + symbol + '' + symbol + '' + number[1]);
        result.push(symbol + '' + number[1] + '' + symbol + '' + number[0]);
        result.push(symbol + '' + number[1] + '' + number[0] + '' + symbol);
        result.push(symbol + '' + symbol + '' + number[1] + '' + number[0]);
      }
    } else if (numberType == 30) {
      if (positionType == 1) {
        result.push(number[0] + '' + number[1] + '' + number[2] + '' + symbol);
        result.push(number[0] + '' + number[2] + '' + number[1] + '' + symbol);
        result.push(number[1] + '' + number[0] + '' + number[2] + '' + symbol);
        result.push(number[1] + '' + number[2] + '' + number[0] + '' + symbol);
        result.push(number[2] + '' + number[0] + '' + number[1] + '' + symbol);
        result.push(number[2] + '' + number[1] + '' + number[0] + '' + symbol);
        result.push(number[0] + '' + number[1] + '' + symbol + '' + number[2]);
        result.push(number[0] + '' + number[2] + '' + symbol + '' + number[1]);
        result.push(number[1] + '' + number[0] + '' + symbol + '' + number[2]);
        result.push(number[1] + '' + number[2] + '' + symbol + '' + number[0]);
        result.push(number[2] + '' + number[1] + '' + symbol + '' + number[0]);
        result.push(number[2] + '' + number[0] + '' + symbol + '' + number[1]);
        result.push(number[0] + '' + symbol + '' + number[1] + '' + number[2]);
        result.push(number[0] + '' + symbol + '' + number[2] + '' + number[1]);
        result.push(number[1] + '' + symbol + '' + number[0] + '' + number[2]);
        result.push(number[1] + '' + symbol + '' + number[2] + '' + number[0]);
        result.push(number[2] + '' + symbol + '' + number[1] + '' + number[0]);
        result.push(number[2] + '' + symbol + '' + number[0] + '' + number[1]);
        result.push(symbol + '' + number[0] + '' + number[1] + '' + number[2]);
        result.push(symbol + '' + number[0] + '' + number[2] + '' + number[1]);
        result.push(symbol + '' + number[1] + '' + number[0] + '' + number[2]);
        result.push(symbol + '' + number[1] + '' + number[2] + '' + number[0]);
        result.push(symbol + '' + number[2] + '' + number[1] + '' + number[0]);
        result.push(symbol + '' + number[2] + '' + number[0] + '' + number[1]);
      } else {
        result.push(number[0] + '' + number[1] + '' + number[2] + '' + symbol);
        result.push(number[0] + '' + number[1] + '' + symbol + '' + number[2]);
        result.push(number[0] + '' + symbol + '' + number[1] + '' + number[2]);
        result.push(symbol + '' + number[0] + '' + number[1] + '' + number[2]);
      }
    } else if (numberType == 40) {
      if (positionType == 1) {
        result.push(
          number[0] + '' + number[1] + '' + number[2] + '' + number[3]
        );
        result.push(
          number[0] + '' + number[1] + '' + number[3] + '' + number[2]
        );
        result.push(
          number[0] + '' + number[2] + '' + number[1] + '' + number[3]
        );
        result.push(
          number[0] + '' + number[2] + '' + number[3] + '' + number[1]
        );
        result.push(
          number[0] + '' + number[3] + '' + number[2] + '' + number[1]
        );
        result.push(
          number[0] + '' + number[3] + '' + number[1] + '' + number[2]
        );

        result.push(
          number[1] + '' + number[0] + '' + number[2] + '' + number[3]
        );
        result.push(
          number[1] + '' + number[0] + '' + number[3] + '' + number[2]
        );
        result.push(
          number[1] + '' + number[2] + '' + number[0] + '' + number[3]
        );
        result.push(
          number[1] + '' + number[2] + '' + number[3] + '' + number[0]
        );
        result.push(
          number[1] + '' + number[3] + '' + number[0] + '' + number[2]
        );
        result.push(
          number[1] + '' + number[3] + '' + number[2] + '' + number[0]
        );

        result.push(
          number[2] + '' + number[0] + '' + number[1] + '' + number[3]
        );
        result.push(
          number[2] + '' + number[0] + '' + number[3] + '' + number[1]
        );
        result.push(
          number[2] + '' + number[1] + '' + number[0] + '' + number[3]
        );
        result.push(
          number[2] + '' + number[1] + '' + number[3] + '' + number[0]
        );
        result.push(
          number[2] + '' + number[3] + '' + number[0] + '' + number[1]
        );
        result.push(
          number[2] + '' + number[3] + '' + number[1] + '' + number[0]
        );

        result.push(
          number[3] + '' + number[0] + '' + number[1] + '' + number[2]
        );
        result.push(
          number[3] + '' + number[0] + '' + number[2] + '' + number[1]
        );
        result.push(
          number[3] + '' + number[1] + '' + number[0] + '' + number[2]
        );
        result.push(
          number[3] + '' + number[1] + '' + number[2] + '' + number[0]
        );
        result.push(
          number[3] + '' + number[2] + '' + number[0] + '' + number[1]
        );
        result.push(
          number[3] + '' + number[2] + '' + number[1] + '' + number[0]
        );
      } else {
        result.push(number.join(''));
      }
    } else if (numberType == 50) {
      if (positionType == 1) {
        result.push(
          number[0] + '' + symbol + '' + symbol + '' + symbol + '' + number[1]
        );
        result.push(
          number[1] + '' + symbol + '' + symbol + '' + symbol + '' + number[0]
        );

        result.push(
          symbol + '' + number[0] + '' + symbol + '' + symbol + '' + number[1]
        );
        result.push(
          symbol + '' + number[1] + '' + symbol + '' + symbol + '' + number[0]
        );

        result.push(
          symbol + '' + symbol + '' + number[0] + '' + symbol + '' + number[1]
        );
        result.push(
          symbol + '' + symbol + '' + number[1] + '' + symbol + '' + number[0]
        );

        result.push(
          symbol + '' + symbol + '' + symbol + '' + number[0] + '' + number[1]
        );
        result.push(
          symbol + '' + symbol + '' + symbol + '' + number[1] + '' + number[0]
        );
      } else {
        result.push(
          number[0] + '' + symbol + '' + symbol + '' + symbol + '' + number[1]
        );
        result.push(
          symbol + '' + number[0] + '' + symbol + '' + symbol + '' + number[1]
        );
        result.push(
          symbol + '' + symbol + '' + number[0] + '' + symbol + '' + number[1]
        );
        result.push(
          symbol + '' + symbol + '' + symbol + '' + number[0] + '' + number[1]
        );
      }
    } else {
      result.push(number.sort().join(''));
    }
  }

  return common.unique(result);
};

CodeMaker.prototype.fixedFilter = function () {
  var result = [];
  var exist = {};
  var number = arguments[0];
  var symbol = this.options.symbol;
  var numberType = this.options.numberType;
  if (numberType == 20) {
    result.push(number[0] + '' + number[1] + '' + symbol + '' + symbol);
    result.push(number[0] + '' + symbol + '' + number[1] + '' + symbol);
    result.push(number[0] + '' + symbol + '' + symbol + '' + number[1]);
    result.push(symbol + '' + number[1] + '' + symbol + '' + number[0]);
    result.push(symbol + '' + number[1] + '' + number[0] + '' + symbol);
    result.push(symbol + '' + symbol + '' + number[1] + '' + number[0]);
  } else if (numberType == 30) {
    result.push(number[0] + '' + number[1] + '' + number[2] + '' + symbol);
    result.push(number[0] + '' + number[1] + '' + symbol + '' + number[2]);
    result.push(number[0] + '' + symbol + '' + number[1] + '' + number[2]);
    result.push(symbol + '' + number[0] + '' + number[1] + '' + number[2]);
  } else if (numberType == 40) {
    result.push(number.join(''));
  } else if (numberType == 50) {
    result.push(
      number[0] + '' + symbol + '' + symbol + '' + symbol + '' + number[1]
    );
    result.push(
      symbol + '' + number[0] + '' + symbol + '' + symbol + '' + number[1]
    );
    result.push(
      symbol + '' + symbol + '' + number[0] + '' + symbol + '' + number[1]
    );
    result.push(
      symbol + '' + symbol + '' + symbol + '' + number[0] + '' + number[1]
    );
  } else {
    result.push(number.sort().join(''));
  }
  return result;
};

CodeMaker.prototype.matchFilter = function () {
  var exist = {};
  var result = [];
  var discarts = [];
  var common = this.common;
  var options = this.options;
  var symbol = options.symbol;
  var numberType = this.options.numberType;
  var numbers = arguments[0];

  for (var i = 0; i < numbers.length; i++) {
    if (numbers[i].length <= 0) numbers[i] = common.defaultNumber.split('');
  }
  if (options.numberType == 20) {
    discarts = this.common.discart(numbers[0], numbers[1]);
  } else if (options.numberType == 30) {
    discarts = this.common.discart(numbers[0], numbers[1], numbers[2]);
  } else if (options.numberType == 40) {
    discarts = this.common.discart(
      numbers[0],
      numbers[1],
      numbers[2],
      numbers[3]
    );
  } else if (options.numberType == 50) {
    discarts = this.common.discart(numbers[0], numbers[1]);
  }
  for (var j = 0; j < discarts.length; j++) {
    var number = discarts[j];
    if (numberType == 20) {
      result.push(number[0] + '' + number[1] + '' + symbol + '' + symbol);
      result.push(number[1] + '' + number[0] + '' + symbol + '' + symbol);
      result.push(number[0] + '' + symbol + '' + number[1] + '' + symbol);
      result.push(number[1] + '' + symbol + '' + number[0] + '' + symbol);
      result.push(number[0] + '' + symbol + '' + symbol + '' + number[1]);
      result.push(number[1] + '' + symbol + '' + symbol + '' + number[0]);
      result.push(symbol + '' + number[1] + '' + symbol + '' + number[0]);
      result.push(symbol + '' + number[0] + '' + symbol + '' + number[1]);
      result.push(symbol + '' + number[1] + '' + number[0] + '' + symbol);
      result.push(symbol + '' + number[0] + '' + number[1] + '' + symbol);
      result.push(symbol + '' + symbol + '' + number[1] + '' + number[0]);
      result.push(symbol + '' + symbol + '' + number[0] + '' + number[1]);
    } else if (numberType == 30) {
      result.push(number[0] + '' + number[1] + '' + number[2] + '' + symbol);
      result.push(number[0] + '' + number[2] + '' + number[1] + '' + symbol);
      result.push(number[1] + '' + number[0] + '' + number[2] + '' + symbol);
      result.push(number[1] + '' + number[2] + '' + number[0] + '' + symbol);
      result.push(number[2] + '' + number[0] + '' + number[1] + '' + symbol);
      result.push(number[2] + '' + number[1] + '' + number[0] + '' + symbol);
      result.push(number[0] + '' + number[1] + '' + symbol + '' + number[2]);
      result.push(number[0] + '' + number[2] + '' + symbol + '' + number[1]);
      result.push(number[1] + '' + number[0] + '' + symbol + '' + number[2]);
      result.push(number[1] + '' + number[2] + '' + symbol + '' + number[0]);
      result.push(number[2] + '' + number[1] + '' + symbol + '' + number[0]);
      result.push(number[2] + '' + number[0] + '' + symbol + '' + number[1]);
      result.push(number[0] + '' + symbol + '' + number[1] + '' + number[2]);
      result.push(number[0] + '' + symbol + '' + number[2] + '' + number[1]);
      result.push(number[1] + '' + symbol + '' + number[0] + '' + number[2]);
      result.push(number[1] + '' + symbol + '' + number[2] + '' + number[0]);
      result.push(number[2] + '' + symbol + '' + number[1] + '' + number[0]);
      result.push(number[2] + '' + symbol + '' + number[0] + '' + number[1]);
      result.push(symbol + '' + number[0] + '' + number[1] + '' + number[2]);
      result.push(symbol + '' + number[0] + '' + number[2] + '' + number[1]);
      result.push(symbol + '' + number[1] + '' + number[0] + '' + number[2]);
      result.push(symbol + '' + number[1] + '' + number[2] + '' + number[0]);
      result.push(symbol + '' + number[2] + '' + number[1] + '' + number[0]);
      result.push(symbol + '' + number[2] + '' + number[0] + '' + number[1]);
    } else if (numberType == 40) {
      result.push(number[0] + '' + number[1] + '' + number[2] + '' + number[3]);
      result.push(number[0] + '' + number[1] + '' + number[3] + '' + number[2]);
      result.push(number[0] + '' + number[2] + '' + number[1] + '' + number[3]);
      result.push(number[0] + '' + number[2] + '' + number[3] + '' + number[1]);
      result.push(number[0] + '' + number[3] + '' + number[2] + '' + number[1]);
      result.push(number[0] + '' + number[3] + '' + number[1] + '' + number[2]);

      result.push(number[1] + '' + number[0] + '' + number[2] + '' + number[3]);
      result.push(number[1] + '' + number[0] + '' + number[3] + '' + number[2]);
      result.push(number[1] + '' + number[2] + '' + number[0] + '' + number[3]);
      result.push(number[1] + '' + number[2] + '' + number[3] + '' + number[0]);
      result.push(number[1] + '' + number[3] + '' + number[0] + '' + number[2]);
      result.push(number[1] + '' + number[3] + '' + number[2] + '' + number[0]);

      result.push(number[2] + '' + number[0] + '' + number[1] + '' + number[3]);
      result.push(number[2] + '' + number[0] + '' + number[3] + '' + number[1]);
      result.push(number[2] + '' + number[1] + '' + number[0] + '' + number[3]);
      result.push(number[2] + '' + number[1] + '' + number[3] + '' + number[0]);
      result.push(number[2] + '' + number[3] + '' + number[0] + '' + number[1]);
      result.push(number[2] + '' + number[3] + '' + number[1] + '' + number[0]);

      result.push(number[3] + '' + number[0] + '' + number[1] + '' + number[2]);
      result.push(number[3] + '' + number[0] + '' + number[2] + '' + number[1]);
      result.push(number[3] + '' + number[1] + '' + number[0] + '' + number[2]);
      result.push(number[3] + '' + number[1] + '' + number[2] + '' + number[0]);
      result.push(number[3] + '' + number[2] + '' + number[0] + '' + number[1]);
      result.push(number[3] + '' + number[2] + '' + number[1] + '' + number[0]);
    } else if (numberType == 50) {
      result.push(
        number[0] + '' + symbol + '' + symbol + '' + symbol + '' + number[1]
      );
      result.push(
        number[1] + '' + symbol + '' + symbol + '' + symbol + '' + number[0]
      );

      result.push(
        symbol + '' + number[0] + '' + symbol + '' + symbol + '' + number[1]
      );
      result.push(
        symbol + '' + number[1] + '' + symbol + '' + symbol + '' + number[0]
      );

      result.push(
        symbol + '' + symbol + '' + number[0] + '' + symbol + '' + number[1]
      );
      result.push(
        symbol + '' + symbol + '' + number[1] + '' + symbol + '' + number[0]
      );

      result.push(
        symbol + '' + symbol + '' + symbol + '' + number[0] + '' + number[1]
      );
      result.push(
        symbol + '' + symbol + '' + symbol + '' + number[1] + '' + number[0]
      );
    } else {
      result.push(number.sort().join(''));
    }
  }

  return result;
};

CodeMaker.prototype.common = {
  defaultNumber: '0123456789',
  isArray: function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  },
  charCount: function (data) {
    var count = 0;
    data.replace(/[xX]/g, function (m, i) {
      count++;
    });
    return count;
  },
  indexOf: function (data, element) {
    var k = 0;
    if (this.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data[i] == element) {
          return i;
        }
      }
      return -1;
    } else {
      return data.indexOf(element);
    }
  },
  emptyCount: function (o) {
    var counter = 0;
    var inputs = [o.firstNumber, o.secondNumber, o.thirdNumber, o.fourthNumber];
    if (o.numberType == 50) {
      inputs.push(o.fifthNumber);
    }
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].length == 0) {
        counter++;
      }
    }
    return counter;
  },
  unique: function (data) {
    var exist = {};
    var distinct = [];
    for (var i = 0; i < data.length; i++) {
      if (!exist[data[i]]) {
        exist[data[i]] = 1;
        distinct.push(data[i]);
      }
    }
    return distinct;
  },
  combination: function (data, count) {
    var r = [];
    (function f(t, a, n) {
      if (n == 0) {
        return r.push(t);
      }
      for (var i = 0, l = a.length; i <= l - n; i++) {
        f(t.concat(a[i]), a.slice(i + 1), n - 1);
      }
    })([], data, count);
    return r;
  },
  permutation: function (data, count) {
    var r = [];
    (function f(t, a, n) {
      if (n == 0) {
        return r.push(t);
      }
      for (var i = 0, l = a.length; i < l; i++) {
        f(t.concat(a[i]), a.slice(0, i).concat(a.slice(i + 1)), n - 1);
      }
    })([], data, count);
    return r;
  },
  discart: function Discart() {
    var elements = [];
    for (var j = 0; j < arguments.length; j++) {
      elements.push(arguments[j]);
    }
    var end = elements.length - 1,
      result = [];
    function addTo(curr, start) {
      var first = elements[start],
        last = start === end;
      for (var i = 0; i < first.length; ++i) {
        if (!(curr instanceof Array)) curr = [curr];
        var copy = curr.slice();
        copy.push(first[i]);
        if (last) {
          result.push(copy);
        } else {
          addTo(copy, start + 1);
        }
      }
    }
    if (elements.length) {
      addTo([], 0);
    } else {
      result.push([]);
    }
    return result;
  },
};

export { CodeMaker };
