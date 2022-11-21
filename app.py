from flask import Flask, request, jsonify, render_template
from psycopg2.extras import Json
from uuid import uuid4
import json
import click
import os

from db import db
from imagemaker import imagemaker

app = Flask(__name__)

app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Not sure this is used
@app.route('/updateatlasimage/',methods=['GET'])
def update_atlas_image():
    os.popen('cp /media/tileset.png /static/tileset.png')
    return "Success"

@app.route('/media/<filename>')
def grab_file(filename):
    return send_from_directory('media', filename)

@app.route('/', methods=['GET'])
def index():
    os.popen('cp /media/tileset.png /static/tileset.png')
    db.connect()
    tiles = db.execute_fetch(f"SELECT DISTINCT ON (name) * FROM tiles ORDER BY name, updated_at DESC")
    db.close()
    return render_template("index.html", tiles=tiles)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5100)
