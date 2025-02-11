function deepCopy(obj) {
  let newObj
  // If it's not an array object and the object exists, return directly
  if (obj && typeof obj !== 'object') {
    newObj = obj
    return newObj
  }
  var targetObj = obj.constructor === Array ? [] : {}
  for (var keys in obj) {
    if (obj.hasOwnProperty(keys)) {
      if (obj[keys] && typeof obj[keys] === 'object') {
        targetObj[keys] = obj[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepCopy(obj[keys])
      } else {
        targetObj[keys] = obj[keys]
      }
    }
  }
  return targetObj
  // return JSON.parse(JSON.stringify(obj));
}


const annulusOption = {
  title: {
    text: '',
    subtext: '',
    x: 'center',
    y: '30%',
    textStyle: {
      fontSize: 26,
      color: '#5b92fe'
    },
    subtextStyle: {
      fontSize: 12,
      color: '#616161'
    }
  },
  color: [],
  series: [
    {
      type: 'pie',
      radius: ['65%', '75%'],
      avoidLabelOverlap: false,
      label: {
        normal: {
          show: true,
          position: 'center'
        }
      },
      hoverAnimation: false,
      startAngle: 0,
      data: [{ value: 45 }, { value: 0 }, { value: 0 }]
    }
  ]
}


/**
 * Get the data for the annulus chart, this chart is only used for semi-open annulus chart and can only have two data inputs
 * @param {Number[2]} data Two data points, data from left to right in the annulus
 * @param {string[2]} colors Colors for the two data points
 * @param {*} text Main title in the center
 * @param {*} subtext Subtitle in the center
 * @param {Number} textFontSize
 * @param {Number} subTextFontSize
 */
function getAnnulusOption(data, colors, text, subtext, textFontSize, subTextFontSize) {
  let resultOption = deepCopy(annulusOption)
  let optionColor = ['rgba(0,0,0,0)']
  optionColor = optionColor.concat(colors)
  resultOption.color = optionColor
  resultOption.title.text = text
  resultOption.title.subtext = subtext
  resultOption.title.textStyle.fontSize = textFontSize
  resultOption.title.subtextStyle.fontSize = subTextFontSize
  let firstData = data[0] || 0
  let secondData = data[1] || 0
  resultOption.series[0].data[1].value = 45 * firstData / (firstData + secondData)
  resultOption.series[0].data[2].value = 45 * secondData / (firstData + secondData)
  return resultOption
}

export { getAnnulusOption }
