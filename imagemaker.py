#import requests
import os
import json
from typing import Tuple, List, BinaryIO
import zlib
import struct
import numpy as np

Pixel = Tuple[int, int, int, int]
Image = List[List[Pixel]]
Header = b'\x89PNG\r\n\x1A\n'

class Imagemaker:
    def __init__(self, imgSize, tileSize):
        self.imageSize = int(imgSize)
        self.tileSize = int(tileSize)
        self.numRowCol = int(imgSize/tileSize)
        self.img = []
        self.export = {}
        self.emptyTile = None
        # create the empty tile
        self.generate_blank_tile()

    def generate_blank_tile(self):
        blank = {'r':0,'g':0,'b':0,'a':0}
        self.img = np.full((self.imageSize, self.imageSize), blank)

    def generate_blank_image(self):
        for i in range(self.numRowCol):
            row = []
            for j in range(self.numRowCol):
                row.append(self.emptyTile)
            self.img.append(row)

    def set_tile_in_image(self, tile):
        start_row = tile['row'] * 16
        start_col = tile['col'] * 16
        for row in range(len(tile['color'])):
            for col in range(len(tile['color'][row])):
                self.img[start_row+row][start_col+col] = tile['color'][row][col]

    def export_image(self):
        out = { "img" : self.img, "name" : "tileset.png"}
        img, name = self.convert_pattern(out)
        self.save_png(img, name)

    def get_checksum(self, chunktype: bytes, data: bytes) -> int:
        checksum = zlib.crc32(chunktype)
        checksum = zlib.crc32(data, checksum)
        return checksum

    def chunk(self, out: BinaryIO, chunk_type: bytes, data: bytes) -> None:
        out.write(struct.pack('>I', len(data)))
        out.write(chunk_type)
        out.write(data)
        checksum = self.get_checksum(chunk_type, data)
        out.write(struct.pack('>I', checksum))

    def make_ihdr(self, width: int, height: int, bit_depth: int, color_type: int) -> bytes:
        return struct.pack('>2I5B', width, height, bit_depth, color_type, 0, 0, 0)

    def encode_data(self, img: Image) -> List[int]:
        ret = []
        for row in img:
            ret.append(0)
            color_values = [
                color_value
                for pixel in row
                for color_value in pixel
            ]
            ret.extend(color_values)
        return ret

    def compress_data(self, data: List[int]) -> bytes:
        data_bytes = bytearray(data)
        return zlib.compress(data_bytes)

    def make_idat(self, img: Image) -> bytes:
        encoded_data = self.encode_data(img)
        compressed_data = self.compress_data(encoded_data)
        return compressed_data

    def dump_png(self, out: BinaryIO, img: Image) -> None:
        out.write(Header)
        assert len(img) > 0
        width = len(img[0])
        height = len(img)
        bit_depth = 8
        color_type = 6
        ihdr_data = self.make_ihdr(width, height, bit_depth, color_type)
        self.chunk(out, b'IHDR', ihdr_data)
        compressed_data = self.make_idat(img)
        self.chunk(out, b'IDAT', data=compressed_data)
        self.chunk(out, b'IEND', data=b'')

    def save_png(self, img: Image, filename: str) -> None:
        with open(f'./media/{filename}', 'wb') as out:
        #with open(f'{os.getcwd()}/{filename}', 'wb') as out:
            self.dump_png(out, img)
        with open(f'./static/{filename}', 'wb') as out:
            self.dump_png(out, img)

    def convert_pattern(self, js: dict) -> Image:
        out = []
        name = js["name"].replace(" ", "_")
        for row in js["img"]:
            rw = []
            for pxl in row:
                tmp: Pixel = (pxl["r"], pxl["g"], pxl["b"], int(pxl["a"]*255))
                rw.append(tmp)
            out.append(rw)
        return out, name

imagemaker = Imagemaker(imgSize=2048, tileSize=16)

