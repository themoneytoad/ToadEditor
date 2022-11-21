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
    pixel_size = 30
    selected_tile = null
    selected_tile_previous = null
    size_x = 16
    size_y = 16

    init() {
        this.canvas = document.getElementById("cvs")
        this.ctx = this.canvas.getContext("2d")
        this.canvas_bounding = this.canvas.getBoundingClientRect();
        this.backgroundColor = convert_hex_to_rgba('#2d3134ff')

        for (var i = 0; i < this.size_x; i++) {
            for (var j = 0; j < this.size_y; j++) {
                let index = this.count
                let pxl = new TileCanvasPixel({id: index, tile:0, size: this.pixel_size, loc_row: i, loc_col: j, canvas: this.canvas, ctx: this.ctx})
                pxl.init()
                this.pixels.push(pxl)
                this.count += 1
            }
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
                pxl.check_clicked(this.current_color)
            }
            pxl.update();
        }
    }

    get_list_of_top_four_colors() {
        return this.listOfTopColors
    }

    import_pixel_data(data) {
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
    }

    set_active(active) {
        this.active = active
    }

    set_background_color(color) {
        this.backgroundColor = color
    }

    set_current_color(color) {
        this.current_color = color
    }

    set_is_editing(editing) {
        this.editing = editing
        for (const pxl of this.pixels) {
            pxl.set_is_editing(editing)
        }
    }

    update() {
        this.draw();
    }

    update_pixel_size() {
        for (const pxl of this.pixels) {
            pxl.set_size(this.pixel_size)
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