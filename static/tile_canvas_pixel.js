export class TileCanvasPixel {
    id = null
    tile = null
    loc_col = 0
    loc_row = 0
    loc = '0 / 0 / 0 / 0'
    canvas = null
    ctx = null
    color = {
        'r': 0,
        'g': 0,
        'b': 0,
        'a': 1.0
    }
    editing = false
    outlineAlpha = {
        'value': 0.05,
        'max': 0.9,
        'min': 0.05
    }
    size = 6
    hovered = false

    constructor(conf) {
        this.id = conf.id || null
        this.tile = conf.tile || 0
        this.size = conf.size || 1
        this.loc_col = conf.loc_col || 0
        this.loc_row = conf.loc_row || 0
        this.canvas = conf.canvas || document.getElementById('cvs')
        this.ctx = conf.ctx || document.getContext('2d')
        this.color.r = 255%this.id
        this.color.g = 255%this.id
        this.color.b = 255%this.id
    }

    init(){
    
    }

    check_hover(mouse) {
        if (mouse.x >= this.loc_col*this.size && mouse.x <= this.loc_col*this.size + this.size
            && mouse.y >= this.loc_row*this.size && mouse.y <= this.loc_row*this.size + this.size) {
                this.highlight(true)
            }
        else {
            this.highlight(false)
        }
    }

    highlight(hovered) {
        if (hovered == this.hovered) {
            return
        }
        else {
            this.hovered = hovered
            if (hovered) {
                this.outlineAlpha.value = this.outlineAlpha.max
            }
            else {
                this.outlineAlpha.value = this.outlineAlpha.min
            }
        }
    }

    check_clicked(color) {
        if (this.editing) {
            if (this.hovered) {
                this.set_color(color)
            }
        }
    }

    set_color(data) {
        this.color.r = data.r
        this.color.g = data.g
        this.color.b = data.b
        this.color.a = data.a
    }

    set_is_editing(editing) {
        this.editing = editing
    }

    set_size(size) {
        this.size = size
    }

    update() {
        this.draw()
    }

    draw() {
        this.ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.color.a})`
        this.ctx.fillRect(this.loc_col*this.size, this.loc_row*this.size, this.size, this.size)
        if (this.editing) {
            this.ctx.lineWidth = 1
            this.ctx.strokeStyle = `rgba(255,255,255,${this.outlineAlpha.value})`
            this.ctx.strokeRect(this.loc_col*this.size, this.loc_row*this.size, this.size, this.size)
        }
    }
}