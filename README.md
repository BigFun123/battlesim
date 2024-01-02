# battlesim

For debug and mission setup:
Use NumPad to move around. 
NumPad 5 - show current position and rotation
NumPad + / -  - up  / down

Press P to see detailed debug info
You will need to Dispose the GUICAM to see the Physics Overlay

Models loaded from Blender have a different coordinate system and are wrapped in a __root__ node to correct it. This makes things weird sometimes.


QGIS
Tiles are exported with QTiles plugin
Export sattellite from MapTiler as 513 size jpg
Export height from MapZen global terrain, as 512 size png, use coloring: R - -100 - 1000, G 2000 - 4000, B - 4000- 8000

// height server
https://s3.amazonaws.com/elevation-tiles-prod/terrarium/14/9028/9835.png

WMTS: https://services.terrascope.be/wmts/v2
WMS: https://services.terrascope.be/wms/v2