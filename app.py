from flask import Flask, request, jsonify, render_template, send_from_directory
from psycopg2.extras import Json
from uuid import uuid4
import json
import click
import os

from db import db
from imagemaker import imagemaker

app = Flask(__name__)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route('/exportatlas', methods=['GET'])
def export_atlas():
    os.remove(f'/media/tileset.png')
    os.remove(f'/static/tileset.png')
    db.connect()
    tiles = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()

    for tile in tiles:
        tl = {
            'name':tile[1],
            'col':tile[2],
            'row':tile[7],
            'color':tile[6]['pixels'],
            'group':tile[4]
        }
        imagemaker.set_tile_in_image(tl)

    imagemaker.export_image()
    
    return "Success"

@app.route('/exporttile/<tile>',methods=['POST'])
def export_tile(tile):
    db.connect()
    data = json.loads(tile)
    if (data['id'] != 'generate_new_uuid()'):
        db.execute_query(f"UPDATE tiles SET name='{data['name']}', location_column='{data['loc_col']}', location_row='{data['loc_row']}', number_of_pixels='{data['size']}', tile_group='{data['group']}', pixels={Json(data['pixels'])} WHERE id='{data['id']}';")
    else:
        db.execute_query(f"INSERT INTO tiles(id, name, location_column, location_row, number_of_pixels, tile_group, pixels) VALUES (gen_random_uuid(), '{data['name']}', '{data['loc_col']}', '{data['loc_row']}', '{data['size']}', '{data['group']}', {Json(data['pixels'])});")
    db.close()
    return "Success"

@app.route('/importtiles/',methods=['GET'])
def import_tiles():
    db.connect()
    tiles = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()
    return jsonify(tiles)

# Not sure this is used
@app.route('/updateatlasimage/',methods=['GET'])
def update_atlas_image():
    os.popen('cp /media/tileset.png /static/tileset.png')
    return "Success"

@app.route('/media/<filename>')
def grab_file(filename):
    return send_from_directory(os.path.join(app.root_path,'media'), filename)
    #return send_from_directory('media', filename)

@app.route('/', methods=['GET'])
def index():
    os.popen('cp /media/tileset.png /static/tileset.png')
    db.connect()
    tiles = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()
    return render_template("index.html", tiles=tiles)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0,pre-check=0,max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5100, debug=True)
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = -1
