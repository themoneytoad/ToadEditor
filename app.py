from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_socketio import SocketIO, send, emit
from psycopg2.extras import Json
from uuid import uuid4
import json
import click
import os

from db import db
from imagemaker import imagemaker

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = -1
socketio = SocketIO(app)

@app.route('/exporttile/<tile>',methods=['POST'])
def export_tile(tile):
    db.connect()
    export_tile_data = json.loads(tile)
    if (export_tile_data['id'] != 'generate_new_uuid()'):
        db.execute_query(f"UPDATE tiles SET name='{export_tile_data['name']}', location_column='{export_tile_data['loc_col']}', location_row='{export_tile_data['loc_row']}', number_of_pixels='{export_tile_data['size']}', tile_group='{export_tile_data['group']}', pixels={Json(export_tile_data['pixels'])} WHERE id='{export_tile_data['id']}';")
    else:
        db.execute_query(f"INSERT INTO tiles(id, name, location_column, location_row, number_of_pixels, tile_group, pixels) VALUES (gen_random_uuid(), '{export_tile_data['name']}', '{export_tile_data['loc_col']}', '{export_tile_data['loc_row']}', '{export_tile_data['size']}', '{export_tile_data['group']}', {Json(export_tile_data['pixels'])});")
    db.close()
    return "Success"

@app.route('/importtiles/',methods=['GET'])
def import_tiles():
    db.connect()
    import_tile_data = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()
    return jsonify(import_tile_data)

# Not sure this is used
@app.route('/updateatlasimage/',methods=['GET'])
def update_atlas_image():
    os.popen('cp ./media/tileset.png ./static/tileset.png')
    return "Success"

@app.route('/media/<filename>')
def grab_file(filename):
    return send_from_directory(os.path.join(app.root_path,'media'), filename)
    #return send_from_directory('media', filename)

@app.route('/', methods=['GET'])
def index():
    os.popen('cp ./media/tileset.png ./static/tileset.png')
    db.connect()
    tile_data = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()
    return render_template("index.html", tiles=tile_data)

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0,pre-check=0,max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))
    emit('my response', json, broadcast=True)

@socketio.on('export_atlas_request')
def export_new_atlas():
    print('Exporting New Atlas')
    os.system(f'rm -rf ./media/tileset*')
    os.system(f' rm -rf ./static/tileset*')
    db.connect()
    dbtiles = None
    dbtiles = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()

    for tile in dbtiles:
        tl = {
            'name':tile[1],
            'col':tile[2],
            'row':tile[7],
            'color':tile[6]['pixels'],
            'group':tile[4]
        }
        imagemaker.set_tile_in_image(tl)

    imagemaker.export_image()
    emit('export_atlas_response', {'success': True}, broadcast=True)

@socketio.on('export_tile_request')
def export_tile(tile):
    db.connect()
    export_tile_data = json.loads(tile)
    if (export_tile_data['id'] != 'generate_new_uuid()'):
        db.execute_query(f"UPDATE tiles SET name='{export_tile_data['name']}', location_column='{export_tile_data['loc_col']}', location_row='{export_tile_data['loc_row']}', number_of_pixels='{export_tile_data['size']}', tile_group='{export_tile_data['group']}', pixels={Json(export_tile_data['pixels'])} WHERE id='{export_tile_data['id']}';")
    else:
        db.execute_query(f"INSERT INTO tiles(id, name, location_column, location_row, number_of_pixels, tile_group, pixels) VALUES (gen_random_uuid(), '{export_tile_data['name']}', '{export_tile_data['loc_col']}', '{export_tile_data['loc_row']}', '{export_tile_data['size']}', '{export_tile_data['group']}', {Json(export_tile_data['pixels'])});")
    db.close()
    emit('export_tile_response', {'success': True}, broadcast=True)


@socketio.on('import_atlas_tiles_request')
def import_atlas_tiles():
    db.connect()
    import_tile_data = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()
    emit('import_atlas_tiles_response', json.dumps(import_tile_data, indent=4, sort_keys=True, default=str), broadcast=True)

@socketio.on('get_new_atlas_image_request')
def get_new_atlas_img():
    file = os.listdir('./media/')[0]
    print(file)
    emit('get_new_atlas_image_response', {'image':file}, broadcast=True)

if __name__ == "__main__":
    socketio.run(app)
    #app.run(host="0.0.0.0", port=5100, debug=True)
    #app.config['SEND_FILE_MAX_AGE_DEFAULT'] = -1
