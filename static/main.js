import { EditorMain } from "./atlas.js"
import { TileCanvas } from "./tile_canvas.js"

// General Stuff, and things that other functions rely on.
let tileCanvas = null
let atlas = null
// need to have this here so i can initialize the colors
let selectionColors = {
    'background': {
        'selected': '#E1E1E1',
        'unselected': '#1A1A1A'
    },
    'font': {
        'selected': '#2D3134',
        'unselected': '#F7F8FB'
    }
}

window.addEventListener('load', function () {
	atlas = new EditorMain()
	atlas.init()
	tileCanvas = new TileCanvas()
    tileCanvas.init()
    Coloris({
        themeMode: 'dark',
        alpha: true,
        forceAlpha: true,
        swatches: [
            '#2d3134ff','#2e232f33','#2e232f',
            '#3f3546','#625565','#966c6c','#ab947a','#694f62','#80708a','#9bacb2',
            '#c7dcd0','#ffffff','#6e2728','#b33831','#eb4f36','#f47d4a','#ae2334',
            '#e83b3b','#fb6b1d','#f79615','#f9c22c','#7a2f45','#9e453a','#cd683d',
            '#e6904e','#fbb954','#4c3d23','#676633','#a2a947','#d5e04b','#fbff86',
            '#175a4c','#229062','#1ebc73','#90db69','#cddf6d','#313638','#374e4a',
            '#547e64','#92a984','#b1ba90','#0e5d65','#0c8a8f','#11af9b','#31e1b9',
            '#8ff8e2','#323353','#484a77','#4d65b4','#4d9be6','#8fd3ff','#45293f',
            '#6b3e75','#905ea9','#a884f3','#eaaced','#743c54','#a24b6f','#ce657f',
            '#ed8099','#831c5d','#c32554','#f04f78','#f68181','#fca790','#fdcbb0'
          ],
        defaultColor: '#2e232f'
    });
})

window.addEventListener('mousemove', function(e) {
    tileCanvas.mouse_move(e)
})

window.addEventListener('mousedown', function() {
    tileCanvas.mouse_click(true)
})

window.addEventListener('mouseup', function() {
    tileCanvas.mouse_click(false)
})

window.convert_hex_to_rgba = function(color) {
    var test = {
       "r":0,
       "g":0,
       "b":0,
       "a":0
    }
    if (color) {
        var c;
        if(/^#([A-Fa-f0-9]{4}){1,4}$/.test(color)){
            c = color.substring(1).split('');
            if(c.length==3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2], c[3], c[3]];
            }
            c = '0x'+c.join('');
            test = {"r":(c>>24)&255,"g":(c>>16)&255, "b":(c>>8)&255, "a":(c)&255};
            test.a = test.a / (255.0)
        }
    }

    return test
}

window.convert_rgba_to_hex = function(color) {
    /*var a = null
    var rgba = color.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
    var alpha = (rgba && rgba[4] || "").trim()
    var hex = rgba ?
        (rgba[1] | 1 << 8).toString(16).slice(1) +
        (rgba[2] | 1 << 8).toString(16).slice(1) +
        (rgba[3] | 1 << 8).toString(16).slice(1) : color
        a = alpha
        a = (a * 255).toString(16).slice(1)
        hex = hex + a
    */
    var r = (color.r).toString(16)
    r = r.length == 1 ? "0" + r : r
    var g = (color.g).toString(16)
    g = g.length == 1 ? "0" + g : g
    var b = (color.b).toString(16)
    b = b.length == 1 ? "0" + b : b
    var a = (color.a * 255).toString(16)
    a = a.length == 1 ? "0" + a : a
    return r + g + b + a
}

// Atlas Editor Stuff
let selected_tile_id = null;
window.atlas_tile_on_click = function (id) {
	let view = document.getElementById('view')
    let open = document.getElementById('open')

    if (selected_tile_id != id) {
        selected_tile_id = id
        atlas.tile_selected(id)
        view.disabled = false;
        open.disabled = false;
    }
    else {
        selected_tile_id = null
        atlas.tile_selected(null)
        view.disabled = true;
        open.disabled = true;
    }

    let modal = document.getElementById('tileEditor')

    if (modal.style.display == "block" && selected_tile_id == null) {
        modal.style.display = "none"
    }
}


// Tile Editor Stuff
let tileEditorModal = document.getElementById("tileEditor")
//tileEditorModal.style.display = "block" // for testing purposes
let tileEditorColorID = 0
let tilePickerElements = {
    'primary': document.getElementById('tile-picker-primary'),
    'secondary': document.getElementById('tile-picker-secondary'),
    'terciary': document.getElementById('tile-picker-terciary'),
    'extra': document.getElementById('tile-picker-extra'),
    'edit': document.getElementById('tile-edit')
}
let tileEditorStatus = {
    'editing': false
}

// may want to just move this code into the tile_canvas.js file
window.tile_editor_color_id = function(id) {
    tile_editor_reset_color_options()
    if (id == 0) {
        tileCanvas.tileEditorColors.current = tileCanvas.tileEditorColors.primary
        tilePickerElements.primary.style.backgroundColor = selectionColors.background.selected
        tilePickerElements.primary.style.color = selectionColors.font.selected
    }
    else if (id == 1) {
        tileCanvas.tileEditorColors.current = tileCanvas.tileEditorColors.secondary
        tilePickerElements.secondary.style.backgroundColor = selectionColors.background.selected
        tilePickerElements.secondary.style.color = selectionColors.font.selected
    }
    else if (id == 2) {
        tileCanvas.tileEditorColors.current = tileCanvas.tileEditorColors.terciary
        tilePickerElements.terciary.style.backgroundColor = selectionColors.background.selected
        tilePickerElements.terciary.style.color = selectionColors.font.selected
    }
    else if (id == 3) {
        tileCanvas.tileEditorColors.current = tileCanvas.tileEditorColors.extra
        tilePickerElements.extra.style.backgroundColor = selectionColors.background.selected
        tilePickerElements.extra.style.color = selectionColors.font.selected
    }
    else {
        tileCanvas.tileEditorColors.current = {'r':0,'g':0,'b':0,'a':0}
    }
    tileEditorColorID = id
}

window.tile_editor_reset_color_options = function() {
    tilePickerElements.primary.style.backgroundColor = selectionColors.background.unselected
    tilePickerElements.primary.style.color = selectionColors.font.unselected
    tilePickerElements.secondary.style.backgroundColor = selectionColors.background.unselected
    tilePickerElements.secondary.style.color = selectionColors.font.unselected
    tilePickerElements.terciary.style.backgroundColor = selectionColors.background.unselected
    tilePickerElements.terciary.style.color = selectionColors.font.unselected
    tilePickerElements.extra.style.backgroundColor = selectionColors.background.unselected
    tilePickerElements.extra.style.color = selectionColors.font.unselected
}

window.tile_editor_color_picker = function(event, id) {
    tileCanvas.update_color_picker(event, id)
}

window.tile_editor_color_picker_background = function(event) {
    tileCanvas.set_background_color(convert_hex_to_rgba(event))
}

window.tile_editor_is_editing = function() {
    tileEditorStatus.editing = !tileEditorStatus.editing
    if (tileEditorStatus.editing) {
        tile_editor_color_id(tileEditorColorID)
    }
    else {
        tile_editor_reset_color_options()
    }
    tileCanvas.set_is_editing(tileEditorStatus.editing)
}

window.tile_editor_zoom = function (zoomIn) {
	tileCanvas.zoom(zoomIn)
}

window.tile_editor_close = function () {
	tileEditorModal.style.display = "none"
    tileCanvas.set_active(false)
    tileCanvas.set_is_editing(false)
}

window.tile_editor_open = function () {
    let tile = atlas.get_tile(selected_tile_id)
    tileCanvas.import_pixel_data(tile)
    tileEditorModal.style.display = "block"
    tileCanvas.set_active(true)
    tileCanvas.set_is_editing(false)
    tile_editor_reset_color_options()
    tileCanvas.set_mouse_offset()
}
