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

    /*
    not sure I am going to do anything with the overlay
    this.overlay.css("width","800");
    this.overlay.css("height", "500");
    this.overlay.css("opacity","0");
    this.overlay.css("background-color","green");
    */

    this.abNum = 1;
    this.inning = 1;
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
            this.abNum++;
        }
        this.x += 50;
        this.y = 25;
    }


    this.currentAB = this.eventBoxes[0][0];
    this.currentAB.playerBox.currentAB = true;
    this.currentAB.playerBox.draw();
    // end constructor

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
     *
     * @param canvas
     * @param x
     * @param y
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

    /**
     *
     * @param canvas
     * @param overlay
     */
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

    /**
     *
     * @type {Function}
     */
    this.endInning = endInning;
    function endInning()
    {
        this.outs = 0;
        this.inning++;
        this.onFirst = null;
        this.onSecond = null;
        this.onThird = null;
    }

    this.startInning = startInning;
    function startInning()
    {
        this.currentAB.startInning(this.inning);
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
            this.currentAB.onFirst(this.onFirst.playerBox.player.number);
        }

        if(this.onSecond!=null)
        {
            this.currentAB.onSecond(this.onSecond.playerBox.player.number);
        }

        if(this.onThird!=null)
        {
            this.currentAB.onThird(this.onThird.playerBox.player.number);
        }
    }

    this.recordOut = recordOut;
    function recordOut(eventBox)
    {
        eventBox.drawOut(++this.outs);
    }

    this.preAB = preAB;
    function preAB(eventString)
    {
        //All Pre at-bat events
        switch(eventString.substring(0,2))
        {
            // Stolen Base
            case 'SB':
                switch(eventString.substring(2))
                {
                    // Steal Second
                    case '12':
                        if(this.onFirst!=null)
                        {
                            this.onSecond = this.onFirst;
                            this.onFirst = null;
                            this.currentAB.toSecond(this.onSecond.playerBox.player.number,'SB');
                        }
                        else
                        {
                            alert("Should Be Disabled: No runner on First");
                        }
                        break;
                    // Steal Third
                    case '23':
                        if(this.onSecond!=null)
                        {
                            this.onThird = this.onSecond;
                            this.onSecond = null;
                            this.currentAB.toThird(this.onThird.playerBox.player.number,'SB');
                        }
                        else
                        {
                            alert("Should Be Disabled: No runner on Second");
                        }
                        break;
                    // Steal Home
                    case '3H':
                        alert("Not Completed");
                        break;
                }
                break;
            // Caught Stealing
            case 'CS':
                switch(eventString.substring(2))
                {
                    // Caught Stealing Second
                    case '12':
                        if(this.onFirst!=null)
                        {
                            this.currentAB.outToSecond(eventString);
                            this.recordOut(this.onFirst);
                            this.onSecond = null;
                        }
                        else
                        {
                            alert("Should Be Disabled: No runner on First");
                        }
                        break;
                    // Caught Stealing Third
                    case '23':
                        if(this.onSecond!=null)
                        {
                            this.currentAB.outToThird(eventString);
                            this.recordOut(this.onSecond);
                            this.onSecond = null;
                        }
                        else
                        {
                            alert("Should Be Disabled: No runner on Second");
                        }
                        break;
                    // Caught Stealing Home
                    case '3H':
                        alert("Not Completed");
                        break;
                }
                break;
            // Pick Off
            case 'PO':
                if(this.onFirst!=null)
                {
                    this.currentAB.pickOffFirst();
                    this.onFirst = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
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
                this.onFirst = this.currentAB;
                break;
            // Double
            case 'D':
                this.onSecond = this.currentAB;
                break;
            // Triple
            case 'T':
                this.onThird = this.currentAB;
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
                this.onFirst = this.currentAB;
                break;
            // Strikeout
            case 'K':
                this.recordOut(this.currentAB);
                break;
            // Fielder's choice
            case 'F':
                // TODO Base Specifiers
                break;
            // Hit By Pitch or B is for Beanball
            case 'B':
                this.onFirst = this.currentAB;
                break;
        }
        this.currentAB.hit(abString);
        if(this.outs==3)
        {
            this.currentAB.endInning();
            this.endInning();
            this.nextAB();
            this.startInning();
        }
        else
        {
            this.nextAB();
        }
    }

    this.postAB = postAB;
    function postAB(abString)
    {

        switch(abString)
        {
            // 1st to 2nd
            case '1-2':
                this.onSecond = this.onFirst;
                break;
            // PO 1st to 2nd
            case '1x2':
                this.currentAB.outToSecond(abString);
                break;
            // 1st to 3rd
            case '1-3':
                this.onThird = this.onFirst;
                break;
            // PO 1st to 3rd
            case '1x3':
                alert(abString + " not complete");
                break;
            case '1-H':
                alert(abString + " not complete");
                break;
            case '1xH':
                alert(abString + " not complete");
                break;
            case '2-3':
                alert(abString + " not complete");
                break;
            case '2x3':
                alert(abString + " not complete");
                break;
            case '2-H':
                alert(abString + " not complete");
                break;
            case '2xH':
                alert(abString + " not complete");
                break;
            case '3-H':
                alert(abString + " not complete");
                break;
            case '3xH':
                alert(abString + " not complete");
                break;
        }
    }
    // must come after the method definition because it is called in the constructor
    this.startInning();
}

function LineScore(canvas)
{

}

/**
 *
 * @param name
 * @param number
 * @param position
 * @constructor
 */
function Player(name,number,position)
{
    this.name = name;
    this.number = number;
    this.position = position;
}

/**
 *
 * @param canvas - the canvas this player box is drawn on
 * @param player - the player associated with this player box
 * @param x - x-location
 * @param y - y-location
 * @constructor
 */
function PlayerBox(canvas,player,x,y)
{
    var width = 120;
    var height = 25;
    this.x = x;
    this.y = y;
    this.canvas = canvas;
    this.player = player;
    this.currentAB = false;

    /**
     * Function to draw this player box
     * @type {Function}
     */
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

/**
 *
 * @param canvas
 * @param playerBox
 * @param abNum
 * @param x
 * @param y
 * @constructor
 */
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

    this.startInning = startInning;
    function startInning(inning)
    {
        this.ctx.strokeRect(this.x+(BOX_W_H *.35),this.y,(BOX_W_H *.3),(BOX_W_H *.25));
        this.ctx.fillText(inning,this.x+(BOX_W_H *.45),this.y+(BOX_W_H *.2));
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

    this.pickOffFirst = pickOffFirst;
    function pickOffFirst()
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.80),this.y+(BOX_W_H *.45));
        this.ctx.lineTo(this.x+(BOX_W_H *.90),this.y+(BOX_W_H *.45));
        this.ctx.stroke();
    }

    this.outToSecond = outToSecond;
    function outToSecond(how)
    {
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.75),this.y+(BOX_W_H *.5));
        this.ctx.lineTo(this.x+(BOX_W_H *.625),this.y+(BOX_W_H *.375));
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.5625),this.y+(BOX_W_H *.4375));
        this.ctx.lineTo(this.x+(BOX_W_H *.6875),this.y+(BOX_W_H *.3125));
        this.ctx.stroke();
        this.ctx.fillText(how,this.x+(BOX_W_H *.60),this.y+(BOX_W_H *.30));
        //reset original lineWidth
        this.ctx.lineWidth = 1;
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

    this.outToThird = outToThird;
    function outToThird(how)
    {
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.5),this.y+(BOX_W_H *.25));
        this.ctx.lineTo(this.x+(BOX_W_H *.375),this.y+(BOX_W_H *.375));
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.3125),this.y+(BOX_W_H *.3125));
        this.ctx.lineTo(this.x+(BOX_W_H *.4375),this.y+(BOX_W_H *.4375));
        this.ctx.stroke();
        this.ctx.fillText(how,this.x+(BOX_W_H *.20),this.y+(BOX_W_H *.30));
        //reset original lineWidth
        this.ctx.lineWidth = 1;
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