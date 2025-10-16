
let cells;
let occupiedCells;
let connections;
let state;
let selectedNodeLabel;
let validNextNodesLabels;
let dx;
let dy;
let draggedCell;

class Cell {
    constructor( label, x = - 1, y = - 1 ) {
    this.x = x == -1 ? random( width ) : x;
    this.y = y == -1 ? random( height ) : y;
    this.label = label;

    this.flags = {
        hover: false,
        dragging: false,
        selectedFirst: false,
        selectedSecond: false
    };

    this.radius = 25;
    }

    render() {
    this.render_circle();
    this.render_text();
    }

    render_text() {
    noStroke();
    fill( "red" );
    textSize( 20 );
    textStyle( BOLD );
    text( this.label, this.x - ( textWidth( this.label ) / 2 ), this.y + ( ( textAscent() + textDescent() ) / 4 ) );
    }

    render_circle() {
    stroke( "red" );
    strokeWeight( 2 );
    fill( 255 );
    if ( this.flags.hover ) {
        strokeWeight( 3 );
    }
    if ( this.flags.dragging ) {
        fill( 100, 255, 255 ); // ?
    }
    if ( this.flags.selectedFirst ) {
        fill( 0, 255, 0 );
    }
    if ( this.flags.selectedSecond ) {
        fill( 255, 255, 0 );
    }
    ellipse( this.x, this.y, this.radius * 2, this.radius * 2 );
    }

    isInside( x, y ) {
    const d = dist( this.x, this.y, x, y );
    return d <= this.radius;
    }
}

class Connection {
    constructor( cell1, cell2 ) {
    this.cell1 = cell1;
    this.cell2 = cell2;

    this.flags = {
        hover: false,
        dragging: false
    };
    }

    render() {
    this.render_line();
    }

    render_line() {
    stroke( "white" );
    strokeWeight( 2 );
    line( this.cell1.x, this.cell1.y, this.cell2.x, this.cell2.y );
    }

    isInside( x, y ) {
    const d1 = dist( this.cell1.x, this.cell1.y, x, y );
    const d2 = dist( this.cell2.x, this.cell2.y, x, y );

    if ( d1 <= this.cell1.radius || d2 <= this.cell2.radius )
        return false;

    const length = dist( this.cell1.x, this.cell1.y, this.cell2.x, this.cell2.y );

    const cond1 = ( d1 + d2 ) - 0.5 <= length;
    const cond2 = ( d1 + d2 ) + 0.5 >= length;

    return cond1 && cond2;
    }
}

function setup() {
    myCanvas = createCanvas( 600, 600 );
    myCanvas.parent( "coins-on-a-star" );
    myReset();

    const clearButton = createButton( "Clear nodes" );
    clearButton.parent( "coins-on-a-star" );
    clearButton.style( "background-color", "white" );
    clearButton.style( "font-size",  "20px" );
    clearButton.style( "outline", "none");
    clearButton.size( 300 );
    clearButton.mousePressed( clearNodes );

    const resetButton = createButton( "Reset" );
    resetButton.parent( "coins-on-a-star" );
    resetButton.style( "background-color", ( "white" ) );
    resetButton.style( "font-size", ( "20px" ) );
    resetButton.style( "outline", "none");
    resetButton.size( 300 );
    resetButton.mousePressed( myReset );
}

function myReset() {
    cells = [];
    occupiedCells = [];
    connections = [];
    state = "noneSelected";
    dx = 0;
    dy = 0;
    draggedCell = undefined;

    cells.push( new Cell( '1', 200, 100 ) );
    cells.push( new Cell( '2', 400, 100 ) );
    cells.push( new Cell( '3', 500, 200 ) );
    cells.push( new Cell( '4', 500, 400 ) );
    cells.push( new Cell( '5', 400, 500 ) );
    cells.push( new Cell( '6', 200, 500 ) );
    cells.push( new Cell( '7', 100, 400 ) );
    cells.push( new Cell( '8', 100, 200 ) );

    connections.push( new Connection( cells[0], cells[3] ) );
    connections.push( new Connection( cells[0], cells[5] ) );
    connections.push( new Connection( cells[1], cells[4] ) );
    connections.push( new Connection( cells[1], cells[6] ) );
    connections.push( new Connection( cells[2], cells[5] ) );
    connections.push( new Connection( cells[2], cells[7] ) );
    connections.push( new Connection( cells[3], cells[6] ) );
    connections.push( new Connection( cells[4], cells[7] ) );
}

function clearNodes() {
    occupiedCells = [];
    draggedCell = undefined;
    state = "noneSelected";
    cells.forEach( cell => {
    cell.flags.selectedFirst = false;
    cell.flags.selectedSecond = false;
    cell.render();
    } );
}

function draw() {
    background( "purple" );

    connections.forEach( conn => {
    conn.render();
    } );

    cells.forEach( cell => {
    if ( cell.isInside( mouseX, mouseY ) ) {
        cell.flags.hover = true;
    } else {
        cell.flags.hover = false;
    }
    cell.render();
    } );
}

function mousePressed() {
    cells.forEach( cell => {
    if ( cell.isInside( mouseX, mouseY ) ) {
        if ( state === "noneSelected" && !occupiedCells.includes( cell.label ) ) {
        cell.flags.selectedFirst = true;
        state = "firstSelected";
        selectedNodeLabel = cell.label;
        validNextNodesLabels = [];
        for ( var i = 0, iLen = connections.length; i < iLen; i++ ) {
            if ( connections[i].cell1.label === cell.label || connections[i].cell2.label === cell.label ) {
            validNextNodesLabels.push( connections[i].cell1.label );
            validNextNodesLabels.push( connections[i].cell2.label );
            }
        }
        validNextNodesLabels = validNextNodesLabels.filter( x => x !== selectedNodeLabel );

        } else if ( state === "firstSelected" ) {
        if ( cell.label === selectedNodeLabel ) {
            cell.flags.selectedFirst = false;
            state = "noneSelected";
        } else if ( validNextNodesLabels.includes( cell.label ) && !occupiedCells.includes( cell.label ) ) {
            cell.flags.selectedSecond = true;
            occupiedCells.push( cell.label );
            state = "noneSelected";
            cells[selectedNodeLabel - 1].flags.selectedFirst = false;
        }

        }
    }
    cell.render();
    } );

    for ( let i = 0; i < cells.length; i++ ) {
    cell = cells[i];
    if ( cell.flags.hover ) {
        cell.flags.dragging = true;
        draggedCell = cell;
        break;
    }
    }

    if ( !draggedCell )
    return;
    dx = mouseX - draggedCell.x;
    dy = mouseY - draggedCell.y;

}

function mouseDragged() {
    if ( !draggedCell )
    return;

    draggedCell.x = mouseX - dx;
    draggedCell.y = mouseY - dy;
}

function mouseReleased() {
    if ( !draggedCell )
    return;

    draggedCell.flags.dragging = false;
    draggedCell = undefined;
}