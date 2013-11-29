/**
 * Created by Marc Kettler on 11/20/13.
 */


/**
 *
 * @param canvas The jquery Canvas object this Scorecard in Drawn on
 * @param overlay The jquery Canvas object used as a foreground. May be used for ui.
 * @param batters The number of batters in the lineup
 * @constructor
 */
function ScoreCard(canvas,overlay,batters)
{
    this.canvas = canvas;
    this.overlay = overlay;
    this.canvas[0].width = 1000;
    this.canvas[0].height = 500;
    this.overlay.css("width","800");
    this.overlay.css("height", "500");
    this.overlay.css("opacity","0");
    this.overlay.css("background-color","green");

    this.abNum = 1;
    this.outs = 0;
    this.currentAB = null;
    this.onFirst = null;
    this.onSecond = null;
    this.onThird = null;
    this.playerBoxes = new Array(batters);
    this.eventBoxes = new Array(batters);
    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.eventBoxes[i] = new Array(10);
    }

    this.abNum = 1;
    this.x = 120;
    this.y = 0;

    //draw score card header
    drawScoreCardHeader(this.canvas[0],this.overlay[0]);
    drawHeading(this.canvas[0],this.x,this.y);
    this.y = 25;
    //draw player boxes
    for (var i = 0; i < this.eventBoxes.length; i++)
    {

        this.playerBoxes[i] = new PlayerBox(this.canvas[0],new Player("Player "+(i+1),i+1,i+1),0,this.y);
        this.playerBoxes[i].draw();
        this.y += 50;
    }
    this.y=25;
    for (var i = 0; i < this.eventBoxes[0].length; i++)
    {
        for (var j = 0; j < this.eventBoxes.length; j++)
        {
            this.eventBoxes[j][i] = new EventBox(this.canvas[0],this.playerBoxes[j],this.abNum,this.x,this.y);
            this.eventBoxes[j][i].draw();
            this.y += 50;
        // console.log((i+1)+"%"+this.abNum+"="+ ((i+1)%this.abNum) );
            this.abNum++;
        }
        this.x += 50;
        this.y = 25;
    }


    this.currentAB = this.eventBoxes[0][0];
    this.currentAB.playerBox.currentAB = true;
    this.currentAB.playerBox.draw();
    /**
     *
     * @param eventBoxes
     * @param boxID corresponds to the
     * @returns {*} The EventBox represented by boxID
     */
    this.findEventBox = findEventBox;
    function findEventBox(boxID)
    {
        for(var i=0;i<this.eventBoxes.length;i++)
        {
            for(var j=0;j<this.eventBoxes[i].length;j++)
            {
                if(this.eventBoxes[i][j].abNum==boxID)
                {
                    return this.eventBoxes[i][j];
                }
            }
        }
    }

    /**
     * private function that Draws the inning number at the top of the ScoreCard
     */
    function drawHeading(canvas,x,y)
    {
        var width = 500;
        var height = 25;
        var ctx = canvas.getContext("2d");
        ctx.font = height/2+'px Sans-Serif';
        ctx.fillText  ("Team: Team Name     Date: "+new Date().toDateString(),x+(width/45), y+(height/1.33));
        ctx.strokeRect(x,y,width,height);
    }

    function drawScoreCardHeader(canvas,overlay)
    {
        var ctx = canvas.getContext("2d");
        ctx.font = 25/2+'px Sans-Serif';
        ctx.fillText  ("#", 0+(15/2.5), 0+(25/1.33));
        ctx.strokeRect(0,0,20,25);
        ctx.fillText  ("Name", 20+(80/4.5), 0+(25/1.33));
        ctx.strokeRect(20,0,80,25);
        ctx.fillText  ("P", 100+(15/2.5), 0+(25/1.33));
        ctx.strokeRect(100,0,20,25);
    }

    this.endInning = endInning;
    function endInning()
    {
        this.outs = 0;
        this.onFirst = null;
        this.onSecond = null;
        this.onThird = null;
    }

    this.nextAB = nextAB
    function nextAB()
    {
        this.currentAB.playerBox.currentAB = false;
        this.currentAB.playerBox.draw();
        this.currentAB = this.findEventBox(this.currentAB.abNum + 1);
        this.currentAB.playerBox.currentAB = true;
        this.currentAB.playerBox.draw();

        if(this.onFirst!=null)
        {
            this.currentAB.onFirst(this.onFirst.number);
        }

        if(this.onSecond!=null)
        {
            this.currentAB.onSecond(this.onSecond.number);
        }

        if(this.onThird!=null)
        {
            this.currentAB.onThird(this.onThird.number);
        }
    }

    this.recordOut = recordOut;
    function recordOut()
    {
        this.currentAB.drawOut(++this.outs);
        if(this.outs==3)
        {
            this.currentAB.endInning();
            this.endInning();
        }
        this.currentAB = this.findEventBox(this.currentAB.abNum + 1);
    }

    this.preEvent = preEvent;
    function preEvent(eventString)
    {
        //All Pre at-bat events
        switch(eventString.substring(0,2))
        {
            // Stolen Base
            case 'SB':
                if(this.onFirst!=null)
                {
                    this.onSecond = this.onFirst;
                    this.onFirst = null;
                    this.currentAB.toSecond(this.onSecond.number,'SB');
                }
                else if(this.onSecond!=null)
                {
                    this.onThird = this.onSecond;
                    this.onSecond = null;
                    this.currentAB.toThird(this.onThird.number,'SB');
                }

                break;
            // Caught Stealing
            case 'CS':
                // TODO Base Specifiers
                break;
            // Pick Off
            case 'PO':
                // TODO Base Specifiers
                break;
            // Balk
            case 'BK':
                // TODO Base Specifiers
                break;
            // Passed Ball
            case 'PB':
                // TODO Base Specifiers
                break;
            // Wild Pitch
            case 'WP':
                // TODO Base Specifiers
                break;
        }
    }

    this.processAB = processAB;
    function processAB(abString)
    {
        // At Bat Events
        switch(abString)
        {
            // Single
            case 'S':
                this.onFirst = this.currentAB.playerBox.player;
                break;
            // Double
            case 'D':
                this.onSecond = this.currentAB.playerBox.player;
                break;
            // Triple
            case 'T':
                this.onThird = this.currentAB.playerBox.player;
                break;
            // Home Run
            case 'H':
                this.currentAB.runScored();
                break;
            // Walk
            case 'W':
                this.onFirst = this.currentAB;
                break;
            // Intentional Walk
            case 'I':
                // TODO Base Specifiers
                break;
            // Strikeout
            case 'K':
                // TODO Base Specifiers
                break;
            // Fielder's choice
            case 'F':
                // TODO Base Specifiers
                break;
            // Hit By Pitch or B is for Beanball
            case 'B':
                // TODO Base Specifiers
                break;
        }
        this.currentAB.hit(abString);
        this.nextAB();
    }
}

function Player(name,number,position)
{
    this.name = name;
    this.number = number;
    this.position = position;
}

function PlayerBox(canvas,player,x,y)
{
    var width = 120;
    var height = 25;
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.player = player;
    this.currentAB = false;

    this.draw = draw;
    function draw()
    {
        var ctx = canvas.getContext("2d");
        var oldFont = ctx.font;
        ctx.font = height/2+'px Sans-Serif';
        // Entire box probably redundant
        // use below line to indicate current batter.
        ctx.strokeRect(x,y,width,height);
        if(this.currentAB)
        {
            ctx.fillStyle = "red";
            ctx.fillRect(x,y,width,height);
        }
        else
        {
            ctx.fillStyle = "white";
            ctx.fillRect(x,y,width,height);
        }
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
        ctx.fillText  (this.player.number,x+(width/40), y+(height/1.33));
        ctx.fillText  (this.player.name,x+(width/4), y+(height/1.33));
        ctx.fillText  (this.player.position,x+(width *.87), y+(height/1.33));
        ctx.font = oldFont;
    }

}

function EventBox(canvas,playerBox,abNum,x,y)
{
    var BOX_W_H = 50;
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.playerBox = playerBox;
    this.abNum = abNum;

    this.draw = draw;
    function draw()
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x,this.y,BOX_W_H,BOX_W_H);
        this.ctx.fillStyle = 'black';
        this.ctx.font = BOX_W_H/6+'px Sans-Serif';
        this.ctx.fillText  (this.abNum, this.x+(BOX_W_H *.05), this.y+(BOX_W_H *.2));
        this.ctx.strokeRect(this.x,this.y,BOX_W_H,BOX_W_H);
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/4));
        this.ctx.lineTo( this.x+(BOX_W_H*(3/4)),this.y+(BOX_W_H/2));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/2));
        this.ctx.stroke();
    }

    this.magnify = magnify;
    function magnify()
    {
        BOX_W_H = 300;
    }

    this.drawOut = drawOut;
    function drawOut(number)
    {
        var font = this.ctx.font;
        this.ctx.font = BOX_W_H/4+'px Sans-Serif Bold';
        this.ctx.fillText(number,this.x+(BOX_W_H *.44), this.y+(BOX_W_H *.57));
        this.ctx.font = font;
    }

    this.runScored = runScored;
    function runScored()
    {
        var originalFill = this.ctx.fillStyle;
        // draw mound - will be black if a run scored.
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H/2), this.y+(BOX_W_H/2), BOX_W_H/12, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.fillStyle = originalFill;
    }

    this.onFirst = onFirst;
    function onFirst(number)
    {
        // runner on first
        this.ctx.fillText(number,this.x+(BOX_W_H *.8),this.y+(BOX_W_H *.5));
    }

    this.toSecond = toSecond;
    function toSecond(number,how)
    {
        this.draw();
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.75),this.y+(BOX_W_H *.5));
        this.ctx.lineTo(this.x+(BOX_W_H *.5),this.y+(BOX_W_H *.25));
        this.ctx.stroke();
        this.ctx.fillText(how,this.x+(BOX_W_H *.60),this.y+(BOX_W_H *.30));
        //reset original lineWidth
        this.ctx.lineWidth = 1;
        this.onSecond(number);
    }

    this.toThird = toThird;
    function toThird(number,how)
    {
        this.draw();
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.5),this.y+(BOX_W_H *.25));
        this.ctx.lineTo(this.x+(BOX_W_H *.25),this.y+(BOX_W_H *.5));
        this.ctx.stroke();
        this.ctx.fillText(how,this.x+(BOX_W_H *.20),this.y+(BOX_W_H *.30));
        //reset original lineWidth
        this.ctx.lineWidth = 1;
        this.onThird(number);
    }

    this.onSecond = onSecond;
    function onSecond(number)
    {
        this.ctx.fillText(number,this.x+(BOX_W_H *.45),this.y+(BOX_W_H *.17));
    }

    this.onThird = onThird;
    function onThird(number)
    {
        this.ctx.fillText(number,this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.5));
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

    this.hitLeft = hitLeft;
    function hitLeft()
    {
        //make line slightly bigger
        this.ctx.lineWidth = 2;
        //Path for line from home to left field.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/4),this.y+(BOX_W_H/8));
        this.ctx.stroke();
        //reset original lineWidth
        this.ctx.lineWidth = 1;
    }

    this.hit= hit;
    function hit(type)
    {
        this.ctx.fillText(type,this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.90));
    }

    this.hitRight = hitRight;
    function hitRight()
    {
        this.ctx.lineWidth = 2;
        //Path for line from home to right field.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
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
        this.ctx.moveTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H*(3/4)));
        this.ctx.lineTo(this.x+(BOX_W_H/2),this.y+(BOX_W_H/8));
        this.ctx.stroke();
        this.ctx.lineWidth = 1;
    }
}