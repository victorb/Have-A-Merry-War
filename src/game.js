var game = new Phaser.Game(800, 600, Phaser.AUTO, 'content', {
  update: update,
    preload: preload,
    create: create,
    render: render
});

var circle;
var floor;

function createSelectionAroundUnit(unit) {
  var pos = unit.world;
  return game.add.sprite(pos.x - 17, pos.y - 17, 'selection');
}

function Marker(y, x) {
  this.gameObject;
  
  this.gameObject = game.add.sprite(x - 17, y - 17, 'marker');

  this.kill = function() {
    this.gameObject.kill();
  }.bind(this)
}

function Unit(type) {
  this.type = "priest";
  this.selected = false;
  this.gameObject = null;
  this.selection = null;
  this.goToX = null;
  this.goToY = null;
  this.goToMarker = null;

  this.gameObject = game.add.sprite(game.world.centerX, game.world.centerY, 'unit');
  this.gameObject.inputEnabled = true;
  this.gameObject.input.useHandCursor = true;
  this.gameObject.enableBody = true;


  this.goTo = function(y, x) {
    if(this.goToMarker) {
      this.goToMarker.kill();
      this.goToMarker = null;
      this.goToX = null;
      this.goToY = null;
    }
    this.goToMarker = new Marker(y, x);
    this.goToX = x;
    this.goToY = y;

    this.gameObject.y = this.goToY - 17;
    this.gameObject.x = this.goToX - 17;


  }.bind(this)

  this.select = function() {
		console.log('Click1')
    if(!this.selected) {
      this.selected = true;
      this.selection = createSelectionAroundUnit(this.gameObject);
    }
  };

  this.deselect = function() {
    if(this.selected) {
      this.selected = false;
      this.selection.kill();
    }
  }

  this.gameObject.events.onInputDown.add(this.select, this);
}

function preload () {
  game.load.image('unit', 'assets/unit.png');
  game.load.image('selection', 'assets/selection.png');
  game.load.image('marker', 'assets/marker.png');
  game.load.image('drag_selection', 'assets/drag_selection.png');

  game.load.image('tileset', 'assets/tilemap.png');
  game.load.tilemap('map', 'assets/tiled_map.json', null, Phaser.Tilemap.TILED_JSON);
}

var units = [];

function deselectUnits() {
	selectedUnits.forEach(function(unit) {
		Unit.Deselect(unit);
	})
}

function unitsSelected() {
	if(selectedUnits.length > 0) {
		return true;
	}
  return false;
}

function isOverUnit() {
	var ret = false;
	units.forEach(function(unit) {
    if(unit.input.pointerOver()) {
      ret = true;
    }
	})
	return ret;
}
var astar;

var selectedUnits = [];

var Unit = {
	Stop: function(unit) {
		unit.body.velocity.y = 0;
		unit.body.velocity.x = 0;
	},
	Select: function(unit) {
		selectedUnits.push(unit);
	},
	Deselect: function(unit) {
		var index = selectedUnits.indexOf(unit);
		if (index > -1) {
			selectedUnits.splice(index, 1);
			selections.forEach(function(selection) {
				selection.kill();
			});
		}
	}
}

var marker = null;

var movingUnits = [];

function handleUnitsReachedDestination() {
	if(movingUnits.length > 0) {
		movingUnits.forEach(function(unit) {
			/*
			 * unit.x 20 pixels within marker.x
			 * unit.y 20 pixels within marker y
			 */
			function round(value) {
				return Math.round(value / 10) * 10;
			}
			if(
				round(unit.x) === round(unit.newPos.x) &&
				round(unit.y) === round(unit.newPos.y)
			) {
				var index = movingUnits.indexOf(unit);
				Unit.Stop(unit);
				marker.kill();
				movingUnits.splice(index, 1);
			}
		});
	}
}

function addUnitToGameWorld() {
		unit = units.create(game.world.randomX, game.world.randomY, 'unit', 0);
		game.physics.arcade.enable(unit);
		unit.inputEnabled = true;
		unit.enableBody = true;
		unit.input.useHandCursor = true;
		unit.events.onInputDown.add(Unit.Select, this);
}

function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  units = game.add.group();
	game.stage.backgroundColor = '#ffffff'

	document.querySelector('.add-unit').addEventListener('click', addUnit);
	document.querySelector('.add-ten-units').addEventListener('click', addTenUnits);

  game.canvas.oncontextmenu = function (e) {
    console.log('Detecting rightclick')
    if(unitsSelected()) {
			marker = game.add.sprite(e.x - 32, e.y - 22, 'marker');
			setTimeout(function() {
				marker.kill();
			}, 500)
			game.physics.arcade.enable(marker);
			var singleUnit = selectedUnits.length == 1;
			selectedUnits.forEach(function(unit) {
				movementChaos = selectedUnits.length * 10;
				if(movementChaos >= 100) {
					movementChaos = 100;
				}
				if(singleUnit) {
					newPos = marker;
				} else {
					newPos = {
						x: marker.x - randomIntFromInterval(-movementChaos, movementChaos),
						y: marker.y - randomIntFromInterval(-movementChaos, movementChaos)
					};
				}
				unit.newPos = newPos;
				movingUnits.push(unit);
				game.physics.arcade.moveToObject(unit, newPos, 100);
			});
			deselectUnits();
    }
    e.preventDefault();
  }


	for (var i = 0; i < 5; i++)
	{
		addUnitToGameWorld()
	}
}

function find(e)
{
//	var start = layer.getTileXY(turtle.x, turtle.y, {});
//	var goal = layer.getTileXY(e.positionDown.x + game.camera.view.x, e.positionDown.y + game.camera.view.y, {});
//	var path = astar.findPath(start, goal);
}

var selections = [];

function addUnit() {
	console.log('Adding unit!');
	addUnitToGameWorld();
}

function addTenUnits() {
	console.log('Adding ten units!');
	for (var i = 0; i < 10; i++) {
		addUnitToGameWorld();
	}
}

function drawSelectionOverUnit(unit) {
		var pos = unit.world;
		selection = game.add.sprite(pos.x - 17, pos.y - 17, 'selection', false);
		if(selections.indexOf(selection) === -1) {
			selections.push(selection);
		}
}
var beginDrag = null;
var dragSelection = null;

function selectUnitsWithin(beginDrag, endDrag) {
	console.log('selecting units');
	units.forEach(function(unit) {
		if(
			unit.x > beginDrag.x && unit.x < endDrag.x &&
			unit.y > beginDrag.y && unit.y < endDrag.y
			||
			unit.x < beginDrag.x && unit.x > endDrag.x &&
			unit.y < beginDrag.y && unit.y > endDrag.y
			||
			unit.x > beginDrag.x && unit.x < endDrag.x &&
			unit.y < beginDrag.y && unit.y > endDrag.y
			||
			unit.x < beginDrag.x && unit.x > endDrag.x &&
			unit.y > beginDrag.y && unit.y < endDrag.y
			) {
			console.log('selected a unit')
			Unit.Select(unit)
		}
	});
	console.log(beginDrag);
	console.log(endDrag);
}

function update() {
	if(game.input.mousePointer.isDown) {
		endDrag = {
			x: game.input.mousePointer.x,
			y: game.input.mousePointer.y
		};
		if(beginDrag === null) {
			console.log('Begin dragin')
			beginDrag = endDrag;
		}
	}
	if(beginDrag !== null) {
		console.log('beginDrag not null')
		if(dragSelection === null) {
			dragSelection = game.add.sprite(beginDrag.x, beginDrag.y, 'drag_selection');
		}
		//if(
				endDrag.x >= beginDrag.x && endDrag.y >= beginDrag.y ||
				endDrag.x <= beginDrag.x && endDrag.y <= beginDrag.y
		//	) {
			dragSelection.height = endDrag.y - beginDrag.y;
			dragSelection.width = endDrag.x - beginDrag.x;
		//} else {
			//beginDrag = null;
		//}
	}
		if(
			!game.input.mousePointer.isDown &&
			beginDrag !== null &&
			endDrag !== null &&
			dragSelection !== null
		) {
		console.log('Dragselection not null')
		window.dragSelection = dragSelection;
		selectUnitsWithin(beginDrag, endDrag);
		dragSelection.kill();
		dragSelection = null;
		beginDrag = null;
		endDrag = null;
	}

  if(game.input.mousePointer.isDown && unitsSelected() && !isOverUnit()) {
		deselectUnits();
  }
	handleUnitsReachedDestination();
	if(unitsSelected()) {
		selectedUnits.forEach(function(unit) {
			drawSelectionOverUnit(unit);
		})
	}
}

function render () {
  //game.debug.AStar(astar, 20, 20, '#ff0000');
}
