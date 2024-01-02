import global from './public/global.js'
import Document from './public/document.js'
import Profiler from './public/profiler.js'
import LocalStorage from './public/localstorage.js'

LocalStorage.restore()

import {
  Rect,
  Text,
  Bar,
  Line,
  RoundRect,
} from './public/elements.js'
import Input from './public/components/input.js'
import AutoCompleteResults from './public/components/autocomplete.js'
import Media from './public/components/media.js'
import Interpolator from './public/components/interpolation.js'
import TagContainer from './public/components/tagcontainer.js'
import SearchButton from './public/components/searchbutton.js'
import SearchResults from './public/components/searchresults.js'
import Snowfall from './public/components/snowfall.js'
import Keyboard from './public/components/keyboard.js'
import Menu from './public/components/menu.js'
import Toggle from './public/components/toggle.js'
import MenuButton from './public/components/menubutton.js'

import * as util from './public/util.js'

let searchBar = Input.create({ onEnter: () => {}, maxLength: 107 })
let searchBarResults = AutoCompleteResults.create({ hook: searchBar })
let searchButton = SearchButton.create({ hook: searchBar })
let searchResults = SearchResults.create()

let loadingFade = Interpolator.create({ speed: 1, sharpness: 2 })
loadingFade.set(0)
let icon = Media.image('./assets/grimheart.svg', true)

let tagContainer = TagContainer.create()

global.keyboard = Keyboard.create()

let snow = new Snowfall(50)

let menuButton = MenuButton.create()

let options = LocalStorage.watch('options')
let storeToggles = () => {
  options.set({
    value: {
      saveTags: global.options.saveTags,
      snowFall: global.options.snowFall
    }
  })
}
let toggles = [{
  label: 'Save Session Tags',
  toggle: Toggle.create(global.options.saveTags, state => {
    global.options.saveTags = state
    storeToggles()
  })
}, {
  label: 'Snow Fall',
  toggle: Toggle.create(global.options.snowFall, state => {
    global.options.snowFall = state
    storeToggles()
  })
}]

let menu = Menu.create({
  button: menuButton,
  elementSpacing: 20,
}).background((x, y, width, height) => {
  Rect.draw({
    x, y,
    width, height
  }).both(global.colors.black, util.mixColors(global.colors.black, global.colors.white, 0.2), 4)
}).seperator((x, y, width, height) => {
  Line.draw({
    x1: x + width * 0.1, y1: y + height * 0.5,
    x2: x + width * 0.9, y2: y + height * 0.5,
  }).alpha(0.5).stroke(util.mixColors(global.colors.black, global.colors.white, 0.2), 2)

}).appendZone((x, y, width, height) => {
  let eulaWidth = util.measureText('Eula', height * 0.8).width * 2
  let queryWidth = util.measureText('query', height * 0.8).width * 2
  let offset = (eulaWidth - queryWidth) * 0.25 + 15
  Text.draw({
    x: x + width * 0.5 + offset, y: y + height * 0.85,
    size: height * 0.8,
    text: 'Eula',
    align: 'right',
  }).fill(global.colors.lightBlue)
  Text.draw({
    x: x + width * 0.5 + offset, y: y + height * 0.85,
    size: height * 0.8,
    text: 'query',
    align: 'left'
  }).fill(global.colors.burple)
}).appendZone((x, y, width, height) => {
  Text.draw({
    x: x + width * 0.5, y: y + height * 0.75,
    size: height * 0.75,
    text: 'Options',
    align: 'center',
  }).fill(global.colors.white)
}).appendZone((x, y, width, height) => {
  let spacing = 15
  let toggleWidth = width * 0.15
  let toggleHeight = height / toggles.length - spacing

  for (let [i, { label, toggle }] of toggles.entries()) {
    toggle.draw({
      x: x + spacing + toggleWidth * 0.5, y: y - spacing * 0.25 + spacing * i + toggleHeight * (i + 1),
      width: toggleWidth, height: toggleHeight,
    })
    Text.draw({
      x: x + toggleWidth * 2 + spacing * 2, y: y + spacing * i + toggleHeight * (i + 1),
      size: toggleHeight * 0.5,
      align: 'left',
      text: label
    }).fill(global.colors.white)
  }
})
console.log(menu)

const UI = class {
  constructor() {
    this.spacing = 5

    this.grimheartSize = Document.height * 0.75
    this.titleSize = 75
    this.searchBarWidth = Document.width * 0.35
    this.searchBarHeight = 50
    this.autoCompleteHeight = 0

    this.tagContainerHeight = 0

    this.maxRowLength = 5
  }
  get ratio() {
    return Document.width / Document.height
  }
  get vertical() {
    return Document.width / Document.height < 1
  }
  render() {
    if (Document.width / Document.height > 1) {
      // PC
      this.grimheartSize = Document.height * 0.75
      this.titleSize = 75
      this.searchBarWidth = Document.width * 0.35
      this.searchBarHeight = 50
      this.maxRowLength = 5
      this.autoCompleteHeight = this.searchBarHeight * 0.35
    } else {
      // Mobile
      this.grimheartSize = Document.width
      this.titleSize = 50
      this.searchBarWidth = Document.width * 0.65
      this.searchBarHeight = 50
      this.maxRowLength = 2
      this.autoCompleteHeight = this.searchBarHeight * 0.2
    }
    this.background()
    this.snowfall()
    this.grimheartIcon()
    this.radialGradient()
    this.title()
    this.activeTags()
    this.searchResults()
    global.keyboard.draw({ y: Document.height - 225, spacing: this.spacing })
    this.searchBar(time)
    this.sidebar()
  }
  background() {
    Rect.draw({
      x: 0, y: 0,
      width: Document.width, height: Document.height,
    }).fill(global.colors.bgBlack)
  }
  snowfall() {
    snow.draw()
  }
  grimheartIcon() {
    if (icon.loaded) {
      loadingFade.set(1)

      icon.alpha(Math.max(0, loadingFade.get() - 0.3)).draw({
        x: Document.centerX - this.grimheartSize * 0.5, y: Document.centerY - this.grimheartSize * 0.375,
        width: this.grimheartSize, height: this.grimheartSize
      })
    }
  }
  radialGradient() {
    Rect.draw({
      x: 0, y: 0,
      width: Document.width * 2, height: Document.height * 2,
    }).alpha(0.98).fillRadialGradient({
      x1: Document.centerX, y1: Document.height * 1.75, r1: Document.height * 3,
      x2: Document.centerX, y2: Document.height * 2, r2: 0,
      gradient: [{ color: global.colors.bgBlack, pos: 0.5, }, { color: util.mixColors(global.colors.white, global.colors.navyBlue, 0.99), pos: 1 }]
    })
  }
  title() {
    let eulaWidth = util.measureText('Eula', this.titleSize).width * 2
    let queryWidth = util.measureText('query', this.titleSize).width * 2
    let offset = (eulaWidth - queryWidth) * 0.25
    Text.draw({
      x: Document.centerX + offset, y: this.titleSize,
      size: this.titleSize,
      text: 'Eula',
      align: 'right',
    }).fill(global.colors.lightBlue)
    Text.draw({
      x: Document.centerX + offset, y: this.titleSize,
      size: this.titleSize,
      text: 'query',
      align: 'left'
    }).fill(global.colors.burple)
  }
  searchBar(t) {
    let padding = 10
    let width = this.searchBarWidth
    let height = this.searchBarHeight
    let x = Document.centerX - width * 0.5
    let y = this.titleSize * 2 + this.spacing

    searchBarResults.draw({
      x, y: y + height * 0.15,
      width: width + padding, height: this.autoCompleteHeight + padding,
    })
    Bar.draw({
      x: x - padding * 0.5, y: y - padding * 0.5,
      width: width + padding, height: height + padding,
    }).fill(global.colors.darkGray)
    searchBar.draw({
      x: x + width * 0.5 * 0.9 - padding * 0.5, y,
      width: width * 0.9 + padding * 2, height: height * 0.8, padding,
      t,
    })

    searchButton.draw({
      x: Document.centerX + width * 0.5, y,
      radius: this.vertical ? height * 0.9 : height,
      offset: padding,
    })
  }
  activeTags() {
    let x = Document.centerX - (this.searchBarWidth + this.searchBarHeight + 20) * 0.5
    let y = this.titleSize * 2 + this.searchBarHeight * 0.25 - 20 + this.spacing

    this.tagContainerHeight = tagContainer.draw({
      x, y,
      width: this.searchBarWidth + this.searchBarHeight + 20, heightOffset: this.searchBarHeight * 0.25 + 20,
      tagSize: this.searchBarHeight * 0.4,
      spacing: 10,
    })
  }
  searchResults() {
    let width = Document.width
    let x = 0
    let y = this.titleSize * 2 + this.searchBarHeight * 0.25 - 20 + this.spacing * 4 + this.tagContainerHeight
    searchResults.draw({
      x, y,
      width,
      spacing: 10, maxRowLength: this.maxRowLength
    })
  }
  sidebar() {
    menu.draw({
      x: 0, y: 0,
      width: 250, height: Document.height,
      zoneDimensions: [
        { width: 1, height: 0.05 },
        { width: 1, height: 0.035 },
        { width: 1, height: toggles.length * 0.04 },
      ]
    })
    let size = 35
    RoundRect.draw({
      x: this.spacing * 2, y: this.spacing * 2,
      width: size, height: size,
    }).both(global.colors.burple, util.mixColors(global.colors.burple, global.colors.darkGray, 0.4), 6)
    menuButton.draw({
      x: size * 0.25 + this.spacing * 2, y: size * 0.25 + this.spacing * 2,
      width: size * 0.5, height: size * 0.5,
    })
  }
}

const ui = new UI()

let time = 0
let tick = 0
let appLoop = async (newTime) => {
  let timeElapsed = newTime - time
  time = newTime
  tick++

  Profiler.logs.rendering.set()
  ui.render()
  if (global.debug && tick % 1e3 === 0) {
    Profiler.logs.rendering.mark()
    console.log('Rendering time:', `${Profiler.logs.rendering.sum()}ms`)
  }

  //Profiler.checkSpeed()

  Document.refreshCanvas()
  requestAnimationFrame(appLoop)
}
requestAnimationFrame(appLoop)
