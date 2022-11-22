import { AtlasTile } from "./atlas_tile.js"

export class EditorMain {
    count = 0
    map_size_x = 128
    map_size_y = 128
    selected_tile = null
    selected_tile_previous = null
    tiles = []
    tile_map_name = "tileset.png"
    init() {
        this.count = 0
        while (this.tiles.length > 0) {
            this.tiles.pop()
        }
        let map = document.getElementById('map')
        while( map.firstChild) {
            map.removeChild(map.firstChild)
        }

        for (var i=0; i< this.map_size_x; i++) {
            for (var j=0; j< this.map_size_y; j++) {
                /*
                let map = document.getElementById("map")
                let tileDom = document.createElement("button")
                let loc = `${i+1} / ${j+1} / ${i+1} / ${j+1}`
                tileDom.style.gridArea = loc
                let index = `${this.count}`
                tileDom.textContent = index
                tileDom.id = index
                tileDom.className = "tile"
                tileDom.onmouseup = (e) => {window.tileOnClick(index)}
                map.appendChild(tileDom)
                */

                let index = `${this.count}`
                let tile = new AtlasTile({id: index, tile: 0, collision: false, loc_row: i+1, loc_col: j+1})
                tile.init();
                this.tiles.push(tile)
                this.count += 1

            }
        }

        // tiles is the global tiles
        for (var i=0; i<tileset.length; i++) {
            let tmp_id = (tileset[i][7] * 128) + tileset[i][2]
            this.tiles[tmp_id].set_import_info({
                'id': tileset[i][0],
                'name': tileset[i][1],
                'col': tileset[i][2],
                'row': tileset[i][7],
                'group': tileset[i][4],
                'pixels': tileset[i][6],
            })
        }
    }

    get_tile(id) {
        for (var i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i]
            if (tile.id == id) {
                return tile
            }
        }
    }

    get_tile_by_db_id(id) {
        for (var i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i]
            if (tile.db_id == id) {
                return tile
            }
        }
    }

    tile_selected(id) {
        if (id == null && this.selected_tile == id) {
            return
        }

        if (id == null && this.selected_tile != id) {
            let tile = this.get_tile(this.selected_tile)
            tile.selected(false)
            this.selected_tile = null
            return
        }

        if (id != null && this.selected_tile == id) {
            let tile = this.get_tile(id)
            tile.selected(false)
            this.selected_tile = null
            return
        }

        if (this.selected_tile) {
            this.selected_tile_previous = this.selected_tile
            let prev = this.get_tile(this.selected_tile)
            prev.selected(false)
        }
        this.selected_tile = id
        let tile = this.get_tile(id)
        tile.selected(true)
        this.update_modal_info(id)
        return
    }

    unselect_all_tiles() {
        for (var i = 0; i < this.tiles.length; i++) {
            let tile = this.tiles[i]
            tile.selected(false)
        }
    }

    update_modal_info(id) {
        /*
        let tile = this.get_tile(id)
        let viewId = document.getElementById('view-id')
        viewId.innerHTML = tile.db_id
        let name = document.getElementById('view-name')
        name.value = tile.db_name
        let group = document.getElementById('view-group')
        group.value = tile.db_group
        let col = document.getElementById('view-location-x')
        col.value = tile.db_col
        let row = document.getElementById('view-location-y')
        row.value = tile.db_row
        */
    }

    swap_tiles(id) {
        let tile = this.get_tile(id)
        let curr_tile_id = id
        let curr_tile_loc = tile.loc
        let swapping_tile_id = parseInt(tile.db_col) + (128 * parseInt(tile.db_row))
        let swap = this.get_tile(swapping_tile_id)
        let swapping_tile_loc = swap.loc
        tile.move_tile(swapping_tile_id, swapping_tile_loc)
        swap.move_tile(curr_tile_id, curr_tile_loc)
    }

}
