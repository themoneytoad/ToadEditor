import { TileCanvasPixel } from "./tile_canvas_pixel.js"

export class TileCanvas {
    active = false
    backgroundColor = {
        'r' : 18,
        'g' : 19,
        'b' : 20,
        'a' : 1
    }
    canvas = null
    canvas_bounding = null;
    canvas_size = 500
    count = 0
    current_color = {
        'r' : 255,
        'g' : 255,
        'b' : 255,
        'a' : 1
    }
    ctx = null
    editing = false
    listOfTopColors = []
    mouse_clicked = false
    pixels = []
    pixels_grid = []
    pixel_size = 30
    selected_tile = null
    size_x = 16
    size_y = 16
    tileEditorColors = { // hacking this from the main.js by setting values directly.
        'primary': {'r':0,'g':0,'b':0,'a':0},
        'terciary': {'r':0,'g':0,'b':0,'a':0},
        'secondary': {'r':0,'g':0,'b':0,'a':0},
        'extra': {'r':0,'g':0,'b':0,'a':0},
        'current': {'r':0,'g':0,'b':0,'a':0},
    }
    modalElements = {
        'id': null,
        'name': null,
        'group': null,
        'col': null,
        'row': null,
        'save': null,
        'generateID': null,
        'primary': null,
        'secondary': null,
        'terciary': null,
        'extra': null,
        'background': null
    }

    init() {
        // setup the canvas and get the offsets for mouse calcs
        this.canvas = document.getElementById("cvs")
        this.ctx = this.canvas.getContext("2d")
        this.canvas_bounding = this.canvas.getBoundingClientRect();
        // Setup the colors for the color pickers
        this.modalElements.primary = document.getElementById('clrisP')
        this.modalElements.primary.value = '#2e232fff'
        this.modalElements.primary.dispatchEvent(new Event('input', {bubbles: true}))
        this.tileEditorColors.primary = convert_hex_to_rgba('#2e232fff')
        this.modalElements.secondary = document.getElementById('clrisS')
        this.modalElements.secondary.value = '#3f3546ff'
        this.modalElements.secondary.dispatchEvent(new Event('input', {bubbles: true}))
        this.tileEditorColors.secondary = convert_hex_to_rgba('#3f3546ff')
        this.modalElements.terciary = document.getElementById('clrisT')
        this.modalElements.terciary.value = '#625565ff'
        this.modalElements.terciary.dispatchEvent(new Event('input', {bubbles: true}))
        this.tileEditorColors.terciary = convert_hex_to_rgba('#625565ff')
        this.modalElements.extra = document.getElementById('clrisE')
        this.modalElements.extra.value = '#2e232f33'
        this.modalElements.extra.dispatchEvent(new Event('input', {bubbles: true}))
        this.tileEditorColors.extra = convert_hex_to_rgba('#2e232f33')
        this.modalElements.background = document.getElementById('clrisB')
        this.modalElements.background.value = '#2d3134ff'
        this.modalElements.background.dispatchEvent(new Event('input', {bubbles: true}))
        this.backgroundColor = convert_hex_to_rgba('#2d3134ff')
        this.tileEditorColors.current = convert_hex_to_rgba('#2e232fff')

        this.modalElements.id = document.getElementById('tile-id')
        this.modalElements.name = document.getElementById('tile-name')
        this.modalElements.group = document.getElementById('tile-group')
        this.modalElements.col = document.getElementById('tile-location-x')
        this.modalElements.row = document.getElementById('tile-location-y')
        this.modalElements.save = document.getElementById('tile-save')
        this.modalElements.generateID = document.getElementById('tile-generate-id')
        this.pixels = []
        this.pixels_grid = []
        this.count = 0

        for (var i = 0; i < this.size_x; i++) {
            let row = []
            for (var j = 0; j < this.size_y; j++) {
                let index = this.count
                let pxl = new TileCanvasPixel({id: index, tile:0, size: this.pixel_size, loc_row: i, loc_col: j, canvas: this.canvas, ctx: this.ctx})
                pxl.init()
                this.pixels.push(pxl)
                row.push(pxl)
                this.count += 1
            }
            this.pixels_grid.push(row)
        }

        this.animate()
        //this.update()

    }

    set_mouse_offset() {
        this.canvas_bounding = this.canvas.getBoundingClientRect()
    }

    mouse_click(down) {
        if (this.active) {
            this.mouse_clicked = down
        }
    }

    mouse_move(mouse) {
        let mouseDelta = {
            'x': mouse.x - this.canvas_bounding.left + window.scrollX,
            'y': mouse.y - this.canvas_bounding.top + window.scrollY
        }
        if (this.active) {
            for (const pxl of this.pixels) {
                pxl.check_hover(mouseDelta)
            }
        }
    }
    
    animate() {
        if (this.active) {
            this.ctx.clearRect(0, 0, this.canvas_size, this.canvas_size)
            this.update()
        }
        requestAnimationFrame(() => this.animate())
    }

    draw() {
        this.ctx.fillStyle = `rgba(${this.backgroundColor.r}, ${this.backgroundColor.g}, ${this.backgroundColor.b}, ${this.backgroundColor.a})`
        this.ctx.fillRect(0,0, this.canvas_size, this.canvas_size)
        for (const pxl of this.pixels) {
            if (this.mouse_clicked) {
                pxl.check_clicked(this.tileEditorColors.current)
            }
            pxl.update();
        }
    }

    clear_pixels() {
        let emptyColor = {'r':0, 'g': 0, 'b': 0, 'a': 0}
        for (const pxl of this.pixels) {
            pxl.set_color(emptyColor)
        }
    }

    get_exported_data() {
        var expt = []
        for (const row of this.pixels_grid) {
            let exptRow = []
            for (const pxl of row) {
                exptRow.push(pxl.color)
            }
            expt.push(exptRow)
        }

        var pxlJsn = {
            'pixels': expt
        }

        var jsn = {
            'id': this.selected_tile.db_id,
            'name': this.selected_tile.db_name,
            'group': this.selected_tile.db_group,
            'loc_col': this.selected_tile.db_col,
            'loc_row': this.selected_tile.db_row,
            'size': this.size_x,
            'pixels' : pxlJsn
        }

        return jsn
    }

    import_pixel_data(tile) {
        this.selected_tile = tile
        if (tile.db_pixels == null) {
            this.new_tile(tile)
            return
        }
        let data = tile.db_pixels['pixels']
        let count = 0
        let colorsUsed = new Map()
        for (const row of data) {
            for (const color of row) {
                this.pixels[count].set_color(color)
                count += 1;
                var hexString = convert_rgba_to_hex(color)
                if (hexString != '00000000') {
                    if (colorsUsed.get(hexString)) {
                        let tmp = colorsUsed.get(hexString)
                        colorsUsed.set(hexString, tmp+1)
                    }
                    else {
                        colorsUsed.set(hexString, 1)
                    }
                }
            }
        }
        let sortedColors = new Map([...colorsUsed.entries()].sort((a, b) => b[1] - a[1]))
        this.listOfTopColors = []
        count = 0
        for (let color of sortedColors.keys()) {
            if (count < 4) {
                this.listOfTopColors.push(`#${color}`)
            }
            else {
                break
            }
        }
        this.update_modal_info(true)
    }

    new_tile(tile) {
        this.clear_pixels()
        this.selected_tile = tile
        this.update_modal_info() 
    }

    set_active(active) {
        this.active = active
    }

    set_background_color(color) {
        this.backgroundColor = color
    }

    set_is_editing(editing) {
        this.editing = editing
        for (const pxl of this.pixels) {
            pxl.set_is_editing(editing)
        }
        this.modalElements.id.disabled = !editing
        this.modalElements.name.disabled = !editing
        this.modalElements.group.disabled = !editing
        this.modalElements.col.disabled = !editing
        this.modalElements.row.disabled = !editing
        this.modalElements.save.disabled = !editing
        this.modalElements.generateID.disabled = !editing
    }
    
    set_tile_loc_col(value) {
        this.selected_tile.db_col = parseInt(value)
    }

    set_tile_loc_row(value) {
        this.selected_tile.db_row = parseInt(value)
    }
    
    set_tile_name(value) {
        this.selected_tile.db_name = value
    }

    set_tile_group(value) {
        this.selected_tile.db_group = value
    }



    update() {
        this.draw();
    }

    update_color_picker(color, id) {
        let colorConvert = convert_hex_to_rgba(color)
        if (id == 0) {
            if (this.tileEditorColors.currentID == this.tileEditorColors.primary) {
                this.tileEditorColors.current = colorConvert
            }
            this.tileEditorColors.primary = colorConvert
        }
        else if (id == 1) {
            if (this.tileEditorColors.current == this.tileEditorColors.secondary) {
                this.tileEditorColors.current = colorConvert
            }
            this.tileEditorColors.secondary = colorConvert
        }
        else if (id = 2) {
            if (this.tileEditorColors.current == this.tileEditorColors.terciary) {
                this.tileEditorColors.current = colorConvert
            }
            this.tileEditorColors.terciary = colorConvert
        }
        else if (id = 3) {
            if (this.tileEditorColors.current == this.tileEditorColors.extra) {
                this.tileEditorColors.current = colorConvert
            }
            this.tileEditorColors.extra = colorConvert
        }
        else {

        }
    }

    update_pixel_size() {
        for (const pxl of this.pixels) {
            pxl.set_size(this.pixel_size)
        }
    }
    
    update_modal_info(importing=false) {
        this.modalElements.id.innerHTML = this.selected_tile.db_id
        this.modalElements.id.disabled = true
        this.modalElements.name.value = this.selected_tile.db_name
        this.modalElements.name.disabled = true
        this.modalElements.group.value = this.selected_tile.db_group
        this.modalElements.group.disabled = true
        this.modalElements.col.value = this.selected_tile.db_col
        this.modalElements.col.disabled = true
        this.modalElements.row.value = this.selected_tile.db_row
        this.modalElements.row.disabled = true
        this.modalElements.save.disabled = true
        this.modalElements.generateID.disabled = true
        // updates color info
        if (importing) {
            for (var i = 0; i < this.listOfTopColors.length; i++) {
                if (i == 0) {
                    this.modalElements.primary.value = this.listOfTopColors[i]
                    this.modalElements.primary.dispatchEvent(new Event('input', {bubbles: true}))
                    this.tileEditorColors.primary = convert_hex_to_rgba(this.listOfTopColors[i])
                }
                else if (i == 1) {
                    this.modalElements.secondary.value = this.listOfTopColors[i]
                    this.modalElements.secondary.dispatchEvent(new Event('input', {bubbles: true}))
                    this.tileEditorColors.secondary = convert_hex_to_rgba(this.listOfTopColors[i])
                }
                else if (i == 2) {
                    this.modalElements.terciary.value = this.listOfTopColors[i]
                    this.modalElements.terciary.dispatchEvent(new Event('input', {bubbles: true}))
                    this.tileEditorColors.terciary = convert_hex_to_rgba(this.listOfTopColors[i])
                }
                else if (i == 3) {
                    this.modalElements.extra.value = this.listOfTopColors[i]
                    this.modalElements.extra.dispatchEvent(new Event('input', {bubbles: true}))
                    this.tileEditorColors.extra = convert_hex_to_rgba(this.listOfTopColors[i])
                }
            }
        }
    }

    zoom(zoomIn) {
        if (zoomIn) {
            this.pixel_size += 1
            this.update_pixel_size()
        }
        else {
            this.pixel_size -= 1
            if (this.pixel_size < 1) {
                this.pixel_size = 1
            }
        }
        this.update_pixel_size()
    }
    
}