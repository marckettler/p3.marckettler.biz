/**
 * Created by Marc Kettler on 11/20/13.
 */


function ScoreCard(canvas,batters)
{
    this.canvas = canvas;
    this.canvas.width = 1000;
    this.canvas.height = 500;
    this.currentAB = 1;
    this.eventBoxes = new Array(batters);
    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.eventBoxes[i] = new Array(10);
    }
    var abNum = 1;
    var x = 0;
    var y = 0;
    for (var i = 0; i < this.eventBoxes[0].length; i++)
    {
        for (var j = 0; j < this.eventBoxes.length; j++)
        {
            this.eventBoxes[j][i] = new EventBox(canvas,abNum++,x,y);
            this.eventBoxes[j][i].draw();
            y += 50;
        }
        x += 50;
        y = 0;
    }

    function findEventBox(eventBoxes,boxID)
    {
        for(var i=0;i<eventBoxes.length;i++)
        {
            for(var j=0;j<eventBoxes[i].length;j++)
            {
                if(eventBoxes[i][j].abNum==boxID)
                {
                    return eventBoxes[i][j];
                }
            }
        }

    }


    this.processAB = processAB;
    function processAB()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        this.currentAB++;
    }
}

function EventBox(canvas,abNum,x,y)
{
    var BOX_W_H = 50;
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.abNum = abNum;

    this.draw = draw;
    function draw()
    {
        this.ctx.font = BOX_W_H/6+'px Sans-Serif';
        this.ctx.fillText  (this.abNum, this.x+(BOX_W_H/40), this.y+(BOX_W_H/6));
        this.ctx.strokeRect(this.x,this.y,BOX_W_H,BOX_W_H);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/4));
        this.ctx.lineTo( this.x+(BOX_W_H*(3/4)),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.stroke();
    }

    this.drawMound = drawMound;
    function drawMound(color)
    {
        var originalFill = this.ctx.fillStyle;
        // draw mound - will be black if a run scored.
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H/2), this.y+(BOX_W_H/2), BOX_W_H/10, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.fillStyle = originalFill;
    }

    this.onFirst = onFirst;
    function onFirst()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 1st.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.lineTo( this.x+(BOX_W_H*(3/4)),this.y+(BOX_W_H/2));
        this.ctx.stroke();
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.onSecond = onSecond;
    function onSecond()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 2;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x(BOX_W_H*(3/4)),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/4));
        this.ctx.stroke();
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.onThird = onThird;
    function onThird()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 2;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x(BOX_W_H/2),this.y(BOX_W_H/4));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y(BOX_W_H/2));
        this.ctx.stroke();
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.endInning = endInning;
    function endInning()
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+BOX_W_H,this.y+BOX_W_H);
        this.ctx.lineTo(this.x+(BOX_W_H*(3/4)),this.y+BOX_W_H);
        this.ctx.lineTo(this.x+BOX_W_H,this.y+(BOX_W_H*(3/4)));
        this.ctx.fill();
    }

    this.runScored = runScored;
    function runScored()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 2;
        //Path for line from 3rd to home.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.stroke();
        drawMound("black");
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.hitLeft = hitLeft;
    function hitLeft()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 2;
        //Path for line from home to left field.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x(BOX_W_H/2),this.y(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/8));
        this.ctx.stroke();
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.hitRight = hitRight;
    function hitRight()
    {
        this.ctx.lineWidth = 2;
        //Path for line from home to right field.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x(BOX_W_H/2),this.y(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H*(3/4)),this.y+(BOX_W_H/8));
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
    }

    this.hitCenter = hitCenter;
    function hitCenter()
    {
        this.ctx.lineWidth = 2;
        //Path for line from home to center field.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x(BOX_W_H/2),this.y(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/8));
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
    }
}