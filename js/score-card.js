/**
 * Created by Marc Kettler on 11/20/13.
 */


function ScoreCard(canvas,batters)
{
    this.canvas = canvas;
    this.canvas.width = 1000;
    this.canvas.height = 500;
    this.currentAB = 1;
    this.outs = 0;
    this.playerBoxes = new Array(batters);
    this.eventBoxes = new Array(batters);
    this.abNum = 1;
    this.x = 100;
    this.y = 0;

    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.eventBoxes[i] = new Array(10);
    }

    //draw innings
    drawInnings(this.x,this.y);
    this.y = 25;
    //draw player boxes
    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.playerBoxes[i] = new PlayerBox(canvas,"Player "+(i+1),0,this.y);
        this.playerBoxes[i].draw();
        this.y += 50;
    }
    this.y=25;
    for (var i = 0; i < this.eventBoxes[0].length; i++)
    {
        for (var j = 0; j < this.eventBoxes.length; j++)
        {
            this.eventBoxes[j][i] = new EventBox(canvas,this.abNum++,this.x,this.y);
            this.eventBoxes[j][i].draw();
            this.y += 50;
        }
        this.x += 50;
        this.y = 25;
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

    function drawInnings(x,y)
    {
        var width = 50;
        var height = 25;
        var ctx = canvas.getContext("2d");
        ctx.font = height/2+'px Sans-Serif';
        for(var i=0;i<10;i++)
        {
            ctx.fillText  ((i+1).toString(), x+(width/3), y+(height/1.33));
            ctx.strokeRect(x,y,width,height);
            x += 50;
        }
    }

    this.single = single;
    function single()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        this.currentAB++;
    }

    this.double = double;
    function double()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        currentEventBox.onSecond();
        this.currentAB++;
    }

    this.triple = triple;
    function triple()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        currentEventBox.onSecond();
        currentEventBox.onThird();
        this.currentAB++;
    }

    this.homerun = homerun;
    function homerun()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        currentEventBox.onSecond();
        currentEventBox.onThird();
        currentEventBox.runScored();
        this.currentAB++;
    }

    this.walk = walk;
    function walk()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        this.currentAB++;
    }
}

function PlayerBox(canvas,name,x,y)
{
    var width = 100;
    var height = 25;
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.name = name;

    this.draw = draw;
    function draw()
    {
        var ctx = canvas.getContext("2d");
        ctx.font = height/2+'px Sans-Serif';
        ctx.fillText  (this.name,x+(width/3), y+(height/1.33));
        ctx.strokeRect(x,y,width,height);
        ctx.strokeRect(x,y+25,width,height);
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
        this.ctx.arc(this.x+(BOX_W_H/2), this.y+(BOX_W_H/2), BOX_W_H/12, 0, 2 * Math.PI, false);
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
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H*(3/4)),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/4));
        this.ctx.stroke();
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.onThird = onThird;
    function onThird()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/4));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
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
        this.ctx.lineWidth = 3;
        //Path for line from 3rd to home.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.stroke();
        this.drawMound("black");
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