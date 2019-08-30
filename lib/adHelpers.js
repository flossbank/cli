const wrap = require('./wrap')

const colors = [
    '#FF5733', // redish
    '#D4AC0D', // yellowish
    '#633974', // dark purple
    '#3498DB', // blue
    '#FBFCFC', // off white
]

// @returns string
function getRandomColor() {
    return colors[Math.floor(Math.random() * (colors.length - 1))]
}

// @params body: string
// @returns Array<string>
function getAdBody(body) {
    const bodyPutOnMultipleLines = wrap(body)
    return bodyPutOnMultipleLines.split('\n')
}

module.exports = {
    getRandomColor,
    getAdBody
}