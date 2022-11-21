export class AtlasTile {
	id = null
    tile = null
    element = null
    img = null
    container = null
    loc_col = 0;
    loc_row = 0;
    loc = '0 / 0 / 0 / 0'
    tile_size = 128 // how many tiles can fit. 2048 / 8 px -> 256
    tile_background_zoom = '12800%' // zoom in on the tile for editor
    // database information
    db_id = 'generate_new_uuid()'
    db_name = 'NEW_TILE'
    db_col = null
    db_row = null
    db_group = 'Empty'
    db_pixels = null

	constructor(conf) {
		this.id = conf.id || null
		this.tile = conf.tile || 0
        this.loc_col = conf.loc_col || 0
        this.loc_row = conf.loc_row || 0
	}
    
    init() {
        this.loc = `${this.loc_row} / ${this.loc_col} / ${this.loc_row} / ${this.loc_col}`
        let map = document.getElementById("map")
        this.element = document.createElement("button")
        this.element.style.gridArea = this.loc
        //this.element.textContent = this.id
        this.element.id = this.id
        this.element.className = "tile"
        this.element.onmouseup = (e) => {window.atlas_tile_on_click(this.id)}
        this.img = document.createElement("div")
        this.img.textContent = this.id
        this.img.style.color = "rgba(255,255,255,0.05)"
        this.img.className = "tile-image"
        this.img.style.backgroundImage = "url('/static/tileset.png')"
        this.img.style.backgroundPosition = `${(this.tile%this.tile_size)*(100 / (this.tile_size-1))}% ${Math.floor(this.tile/this.tile_size)*(100 / (this.tile_size-1))}%`
        this.img.style.backgroundSize = this.tile_background_zoom
        this.element.appendChild(this.img);
        map.appendChild(this.element)
        this.db_col = this.loc_col-1 // These must be swapped?
        this.db_row = this.loc_row-1
    }

    move_tile(newId, newLoc) {
        this.loc = newLoc
        this.element.style.gridArea = this.loc
        this.id = newId
        this.img.textContent = this.id
        this.element.onmouseup = (e) => {window.tileOnClick(this.id)}
    }

    clear_tile() {
        this.set_tile(0); 
    }

    get_element() {
        return this.element
    }

    get_tile_info() {
        return {id: this.id, tile: this.tile}
    }

    set_id(id) {
        this.id = id
    }

    set_import_info(info) {
        this.db_id = info['id']
        this.db_name = info['name']
        this.db_col = info['col']
        this.db_row = info['row']
        this.db_group = info['group']
        this.db_pixels = info['pixels']
        this.set_tile(`${this.db_row},${this.db_col}`)
    }

    selected(bSelected) {
        if (bSelected) {
            this.img.style.filter = "brightness(1.6)"
        }
        else {
            this.img.style.filter = "none"
        }
    }

    set_tile(tilemap_index) {
        if (typeof(tilemap_index) === "string") {
            let txt = ""+tilemap_index
            let row_col_group = txt.split(',')
            tilemap_index = parseInt(row_col_group[0]) * 128 + parseInt(row_col_group[1])
        }
        this.tile = tilemap_index
        this.img.style.backgroundPosition = `${(this.tile%this.tile_size)*(100 / (this.tile_size-1))}% ${Math.floor(this.tile/this.tile_size)*(100 / (this.tile_size-1))}%`
    }

    toggle_collision_visible(visible) {
        if (visible) {
            if (this.collision) {
                this.colbox.style.display = 'block'
            }
        }
        else {
            this.colbox.style.display = 'none'
        }
    }

    // From the Init
    view_set_name(value) {
        this.db_name = value
    }

    view_set_group(value) {
        this.db_group = value
    }

    view_set_col(value) {
        this.db_col = value
    }

    view_set_row(value) {
        this.db_row = value
    }

}
