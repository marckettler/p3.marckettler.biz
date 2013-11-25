/**
 * Created by Marc Kettler on 11/20/13.
 */


/**
 * @desc A Baseball Scorecard
 * @param canvas The canvas this scorecard is drawn on
 * @param batters The number of batters in the lineup
 * @constructor
 */
function ScoreCard(bg,fg,batters)
{
    bg.show();
    fg.hide();

    this.canvas = bg[0];
    this.overlay = fg[0];
    this.canvas.width = 1000;
    this.canvas.height = 500;
    this.overlay.width = 1000;
    this.overlay.width = 500;

    this.currentAB = 1;
    this.outs = 0;
    this.playerBoxes = new Array(batters);
    this.eventBoxes = new Array(batters);
    this.onFirst = null;
    this.onSecond = null;
    this.onThird = null;

    this.abNum = 1;
    this.x = 120;
    this.y = 0;

    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.eventBoxes[i] = new Array(10);
    }

    //draw score card header
    drawScoreCardHeader(this.canvas,this.overlay);
    drawInnings(this.canvas,this.x,this.y);
    this.y = 25;
    //draw player boxes
    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.playerBoxes[i] = new PlayerBox(this.canvas,"Player "+(i+1),0,this.y);
        this.playerBoxes[i].draw();
        this.y += 50;
    }
    this.y=25;
    for (var i = 0; i < this.eventBoxes[0].length; i++)
    {
        for (var j = 0; j < this.eventBoxes.length; j++)
        {
            this.eventBoxes[j][i] = new EventBox(this.canvas,this.abNum++,this.x,this.y);
            this.eventBoxes[j][i].draw();
            this.y += 50;
        }
        this.x += 50;
        this.y = 25;
    }

    /**
     * private function that finds the EventBox of the current Batter
     */
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

    /**
     * private function that Draws the inning number at the top of the ScoreCard
     */
    function drawInnings(canvas,x,y)
    {
        var width = 50;
        var height = 25;
        var ctx = canvas.getContext("2d");
        ctx.font = height/2+'px Sans-Serif';
        for(var i=0;i<10;i++)
        {
            ctx.fillText  ((i+1).toString(), x+(width/2.5), y+(height/1.33));
            ctx.strokeRect(x,y,width,height);
            x += 50;
        }
    }

    function drawScoreCardHeader(canvas,overlay)
    {
        console.log(canvas);
        var ctx = canvas.getContext("2d");
        ctx.font = 25/2+'px Sans-Serif';
        ctx.fillText  ("#", 0+(15/2.5), 0+(25/1.33));
        ctx.strokeRect(0,0,20,25);
        ctx.fillText  ("Name", 20+(80/4.5), 0+(25/1.33));
        ctx.strokeRect(20,0,80,25);
        ctx.fillText  ("P", 100+(15/2.5), 0+(25/1.33));
        ctx.strokeRect(100,0,20,25);
        ctx = overlay.getContext("2d");
        ctx.fillRect(0,0,50,50);
    }

    this.single = single;
    function single()
    {
        var currentEventBox = findEventBox(this.eventBoxes,this.currentAB);
        currentEventBox.onFirst();
        this.onFirst = currentEventBox;
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
    var width = 120;
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
        // Entire box probably redundant
        // use below line to indicate current batter.
        // ctx.fillStyle = "red";
        // ctx.fillRect(x,y,width,height);
        ctx.strokeRect(x,y,width,height);
        ctx.fillStyle = "white";
        // Player's # box
        ctx.fillRect(x,y,width/6,height);
        ctx.strokeRect(x,y,width/6,height);
        // Player's P box
        ctx.fillRect(x+(width*(5/6)),y,width/6,height);
        ctx.strokeRect(x+(width*(5/6)),y,width/6,height);

        ctx.fillStyle = "black";
        ctx.strokeRect(x,y+height,width,height);
        ctx.strokeRect(x,y+height,width/6,height);
        ctx.strokeRect(x+(width*(5/6)),y+height,width/6,height);
        ctx.fillText  ("10",x+(width/40), y+(height/1.33));
        ctx.fillText  (this.name,x+(width/4), y+(height/1.33));
        ctx.fillText  ("10",x+(width *.87), y+(height/1.33));
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
        this.ctx.fillText  (this.abNum, this.x+(BOX_W_H/30), this.y+(BOX_W_H/5));
        this.ctx.strokeRect(this.x,this.y,BOX_W_H,BOX_W_H);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/4));
        this.ctx.lineTo( this.x+(BOX_W_H*(3/4)),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.stroke();

        // runner on first
        this.ctx.fillText("20",this.x+(BOX_W_H *.80),this.y+(BOX_W_H/2));
    }

    this.magnify = magnify;
    function magnify()
    {
        BOX_W_H = 300;

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