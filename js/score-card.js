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
    this.controlArea = null;
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
    this.onDeck = null;
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
    drawLineUpCardHeader(this.canvas[0],this.overlay[0]);
    drawHeading(this.canvas[0],this.x,this.y);
    this.y = 25;
    //draw player boxes
    for (var i = 0; i < this.eventBoxes.length; i++)
    {

        this.playerBoxes[i] = new PlayerBox(this.canvas[0],new Player("Player "+(i+1),i+10,i+1),0,this.y);
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
    //part of constructor
    this.onDeck = this.findEventBox(this.currentAB.abNum+1);
    /**
     *
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
    function drawLineUpCardHeader(canvas)
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
    this.runnerOn = runnerOn;
    function runnerOn()
    {
        return (this.onFirst!=null || this.onSecond!=null || this.onThird!=null);
    }

    this.disableMenuOptions = disableMenuOptions;
    function disableMenuOptions()
    {
        //if there are no runners on hide all menu items that deal with base runners
        if(!this.runnerOn())
        {
            this.controlArea.hideAll();
        }
        else
        {
            //if brOptions is are not visible show them otherwise do nothing
            //this is intended to deal with menus redrawing when they do not need to.
            if(!this.controlArea.brOptions.is(":visible"))
            {
                this.controlArea.brOptions.show();
            }

            // check to see if a runner is on 1st if no runner is on disable options that deal with 1st base
            if(this.onFirst!=null)
            {
                if(!this.controlArea.fbOptions.is(":visible"))
                {
                    this.controlArea.fbOptions.show();
                }
            }
            else
            {
                this.controlArea.fbOptions.hide();
            }

            // check to see if a runner is on 2nd if no runner is on disable options that deal with 2nd base
            if(this.onSecond!=null)
            {
                if(!this.controlArea.sbOptions.is(":visible"))
                {
                    this.controlArea.sbOptions.show();
                }
            }
            else
            {
                this.controlArea.sbOptions.hide();
            }

            // check to see if a runner is on 3rd if no runner is on disable options that deal with 3rd base
            if(this.onThird!=null)
            {
                if(!this.controlArea.tbOptions.is(":visible"))
                {
                    this.controlArea.tbOptions.show();
                }
            }
            else
            {
                this.controlArea.tbOptions.hide();
            }

            // check for triple play conditions
            if(this.outs==0 && this.twoRunnersOn())
            {
                if(!this.controlArea.tpOptions.is(":visible"))
                {
                    this.controlArea.tpOptions.show();
                }

                if(this.firstAndSecond())
                {
                    this.controlArea.tp123Options.show();
    console.log("First And Second");
                }
                else
                {
                    this.controlArea.tp123Options.hide();
                }

                if(this.firstAndThird())
                {
                    this.controlArea.tp12HOptions.show();
    console.log("On Corners");
                }
                else
                {
                    this.controlArea.tp12HOptions.hide();
                }

                if(this.secondAndThird())
                {
                    this.controlArea.tp13HOptions.show();
    console.log("Second and Third");
                }
                else
                {
                    this.controlArea.tp13HOptions.hide();
                }

                if(this.areBasesLoaded())
                {
                    this.controlArea.tp23HOptions.show();
    console.log("Loaded");
                }
                else
                {
                    this.controlArea.tp23HOptions.hide();
                }
            }
            else
            {
                this.controlArea.tpOptions.hide();
            }

            if(this.outs < 2 && this.runnerOn())
            {
                if(!this.controlArea.dpOptions.is(":visible"))
                {
                    this.controlArea.dpOptions.show();

                }

            }
            else
            {
                this.controlArea.dpOptions.hide();
            }
        }

        console.log("tp123="+this.controlArea.tp123Options.is(":visible"));
        console.log("tp12H="+this.controlArea.tp12HOptions.is(":visible"));
        console.log("tp13H="+this.controlArea.tp13HOptions.is(":visible"));
        console.log("tp23H="+this.controlArea.tp23HOptions.is(":visible"));

    }

    this.firstAndSecond = firstAndSecond
    function firstAndSecond()
    {
        return (this.onFirst!=null && this.onSecond!=null);
    }

    this.firstAndThird = firstAndThird
    function firstAndThird()
    {
        return (this.onFirst!=null && this.onThird!=null);
    }


    this.secondAndThird = secondAndThird
    function secondAndThird()
    {
        return (this.onSecond!=null && this.onThird!=null);
    }

    this.twoRunnersOn = twoRunnersOn;
    function twoRunnersOn()
    {
        return  ( this.firstAndSecond() || this.onCorners() || this.secondAndThird() );
    }

    this.onCorners = onCorners;
    function onCorners()
    {
        return(this.onFirst!=null&&this.onSecond==null&&this.onThird!=null);
    }
    this.areBasesLoaded = areBasesLoaded;
    function areBasesLoaded()
    {
        return(this.onFirst!=null&&this.onSecond!=null&&this.onThird!=null);
    }

    this.nextAB = nextAB
    function nextAB()
    {
        if(this.outs==3)
        {
            this.currentAB.endInning();

        }
        this.currentAB.playerBox.currentAB = false;
        this.currentAB.playerBox.draw();
        this.currentAB = this.onDeck;
        this.onDeck = this.findEventBox(this.currentAB.abNum + 1);
        this.currentAB.playerBox.currentAB = true;
        this.currentAB.playerBox.draw();

        if(this.outs==3)
        {
            this.endInning();
            this.startInning();
        }

        this.disableMenuOptions();
    }

    this.recordOut = recordOut;
    function recordOut(eventBox)
    {
        eventBox.drawOut(++this.outs);
    }

    this.advanceAllOneRBI = advanceAllOneRBI;
    function advanceAllOneRBI()
    {
        // Advance all runners 1 base RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.currentAB.rbiThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onThird = this.onSecond;
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.onSecond = this.onFirst;
            this.onFirst = null;
        }
    }

    this.advanceAllOneNoRBI = advanceAllOneNoRBI;
    function advanceAllOneNoRBI(how)
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.currentAB.toHome(how);
            this.currentAB.noRBIThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.currentAB.toThird(how);
            this.onThird = this.onSecond;
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.currentAB.toSecond(how);
            this.onSecond = this.onFirst;
            this.onFirst = null;
        }
    }

    this.advanceAllTwoRBI = advanceAllTwoRBI;
    function advanceAllTwoRBI()
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.currentAB.rbiThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onSecond.runScored();
            this.currentAB.rbiSecond();
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.onThird = this.onFirst;
            this.onFirst = null;
        }
    }

    this.advanceAllThreeRBI = advanceAllThreeRBI;
    function advanceAllThreeRBI()
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.currentAB.rbiThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onSecond.runScored();
            this.currentAB.rbiSecond();
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.onFirst.runScored();
            this.currentAB.rbiFirst();
            this.onFirst = null;
        }
    }

    this.advanceAllTwoNoRBI = advanceAllTwoNoRBI;
    function advanceAllTwoNoRBI(how)
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.currentAB.noRBIThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onSecond.runScored();
            this.currentAB.noRBISecond();
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.currentAB.toSecond(how);
            this.currentAB.toThird(how);
            this.onThird = this.onFirst;
            this.onFirst = null;
        }
    }

    this.showRunners = showRunners;
    function showRunners(eventBox)
    {
        if(this.onFirst!=null)
            eventBox.onFirst(this.onFirst.playerBox.player.number);
        if(this.onSecond!=null)
            eventBox.onSecond(this.onSecond.playerBox.player.number);
        if(this.onThird!=null)
            eventBox.onThird(this.onThird.playerBox.player.number);
    }

    this.flyOut = flyOut;
    function flyOut(to)
    {
        this.recordOut(this.currentAB);
        this.currentAB.hit(to);
    }

    this.fcOut = fcOut;
    function fcOut(from,outAt)
    {
        this.recordOut(outAt);
        this.currentAB.hit(from);
        this.onFirst = this.currentAB;
    }

    this.preAB = preAB;
    function preAB(eventString)
    {
        //All Pre at-bat events
        switch(eventString)
        {
            // Steal Second
            case 'SB12':
                if(this.onFirst!=null)
                {
                    this.onSecond = this.onFirst;
                    this.onFirst = null;
                    this.currentAB.toSecond(eventString.substring(0,2));
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
                break;
            // Steal Third
            case 'SB23':
                if(this.onSecond!=null)
                {
                    this.onThird = this.onSecond;
                    this.onSecond = null;
                    this.currentAB.toThird(eventString.substring(0,2));
                }
                else
                {
                    alert("Should Be Disabled: No runner on Second");
                }
                break;
            // Steal Home
            case 'SB3H':
                if(this.onThird!=null)
                {
                    this.currentAB.toHome(eventString.substring(0,2));
                    this.currentAB.noRBIThird()
                    this.onThird.runScored();
                    this.onThird = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Third");
                }
                break;
            // Double Steal
            case 'SBDS':
            case 'SBTS':
                this.advanceAllOneNoRBI(eventString.substring(0,2));
                break;
            // Caught Stealing
            case 'CS12':
                if(this.onFirst!=null)
                {
                    this.currentAB.outToSecond(eventString.substring(0,2));
                    this.recordOut(this.onFirst);
                    this.onFirst = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
                break;
            // Caught Stealing Third
            case 'CS23':
                if(this.onSecond!=null)
                {
                    this.currentAB.outToThird(eventString.substring(0,2));
                    this.recordOut(this.onSecond);
                    this.onSecond = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Second");
                }
                break;
            // Caught Stealing Home
            case 'CS3H':
                if(this.onThird!=null)
                {
                    this.currentAB.outToHome(eventString.substring(0,2));
                    this.recordOut(this.onThird);
                    this.onThird = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Third");
                }
                break;
            // Pick Off
            case 'PO1':
                if(this.onFirst!=null)
                {
                    this.currentAB.pickOffFirst();
                    this.recordOut(this.onFirst);
                    this.onFirst = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
            break;
            case 'PO2':
                if(this.onSecond!=null)
                {
                    this.currentAB.pickOffSecond();
                    this.recordOut(this.onSecond);
                    this.onSecond = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Second");
                }
                break;
            case 'PO3':
                if(this.onThird!=null)
                {
                    this.currentAB.pickOffThird();
                    this.recordOut(this.onThird);
                    this.onThird = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Third");
                }
                break;
            // Balk, Wild Pitch, and Passed Ball
            case 'PB':
            case 'BK':
            case 'WP':
                this.advanceAllOneNoRBI(eventString);
                break;
        }
        this.disableMenuOptions();
        if(this.outs==3)
        {
            this.currentAB.endInning();
            this.endInning();
            this.startInning();
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
                this.advanceAllOneRBI();
                this.onFirst = this.currentAB;
                break;
            // Double
            case 'D':
                this.advanceAllTwoRBI();
                this.onSecond = this.currentAB;
                break;
            // Triple
            case 'T':
                this.advanceAllThreeRBI();
                this.onThird = this.currentAB;
                break;
            // Home Run
            case 'H':
                this.currentAB.runScored();
                this.currentAB.rbiHome(this.currentAB.playerBox.player.number);
                this.advanceAllThreeRBI();
                break;
            // Walk, Intentional Walk, and HBP
            case 'W':
            case 'I':
            case 'B':
                //force only runner on first
                if(this.onCorners())
                {
                    this.onSecond = this.onFirst;
                    this.onFirst = null;
                }//force runners
                else if(this.onFirst!=null)
                {
                    this.advanceAllOneRBI();
                }
                this.onFirst = this.currentAB;
                break;
            // Strikeout
            case 'K':
                this.recordOut(this.currentAB);
                break;
            case 'SF':
            case 'SH':
                this.recordOut(this.currentAB);
                this.advanceAllOneRBI();
                break;
        }
        this.currentAB.hit(abString);
        // show hit results in next AB
        if(this.outs!=3)
        {
          this.showRunners(this.onDeck);
        }
    }// end processAB

    this.postAB = postAB;
    function postAB(abString)
    {

        switch(abString)
        {
            // 1st to 2nd
            case '1-2':
                if(this.onFirst!=null)
                {
                    this.onFirst.hit(abString);
                    this.onSecond = this.onFirst;
                    this.onFirst = null;
                    this.onDeck.onFirst("");
                    this.onDeck.onSecond(this.onSecond.playerBox.player.number);
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
                break;
            // PO 1st to 2nd
            case '1x2':
                if(this.onFirst!=null)
                {
                    this.onDeck.outToSecond(abString);
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
                break;
            // 1st to 3rd
            case '1-3':
                if(this.onFirst!=null)
                {
                    this.onThird = this.onFirst;
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
                break;
            // PO 1st to 3rd
            case '1x3':
                if(this.onFirst!=null)
                {
                    alert(abString + " not complete");
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }
                break;
            case '1-H':
                if(this.onFirst!=null)
                {
                    this.onFirst.runScored();
                    this.currentAB.rbiFirst();
                    this.onFirst = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }                break;
            case '1xH':
                if(this.onFirst!=null)
                {
                    alert(abString + " not complete");
                }
                else
                {
                    alert("Should Be Disabled: No runner on First");
                }

                break;
            case '2-3':
                if(this.onSecond!=null)
                {
                    this.onThird = this.onSecond;
                    this.onDeck.onSecond("");
                    this.onDeck.onThird(this.onThird.playerBox.player.number);
                    this.onSecond = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Second");
                }
                break;
            case '2x3':
                alert(abString + " not complete");
                break;
            case '2-H':
                if(this.onSecond!=null)
                {
                    this.onSecond.runScored();
                    this.onDeck.rbiSecond();
                    this.onSecond = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Second");
                }
                break;
            case '2xH':
                if(this.onSecond!=null)
                {
                    this.onDeck.toThird(abString);
                    this.onDeck.outToHome(abString);
                    this.onSecond = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Second");
                }
                break;
            case '3-H':
                if(this.onThird!=null)
                {
                    this.onThird.runScored();
                    this.currentAB.rbiThird();
                    this.onThird = null;
                    this.onDeck.onThird('');
                }
                else
                {
                    alert("Should Be Disabled: No runner on Third");
                }
                break;
            case '3xH':
                if(this.onThird!=null)
                {
                    this.onDeck.outToHome();
                    this.onThird.recordOut();
                    this.onThird = null;
                }
                else
                {
                    alert("Should Be Disabled: No runner on Third");
                }
                break;
        }
    }// end postAB()

    // must come after the method definition because it is called in the constructor
    this.startInning();
}
/**
 *
 * @param canvas
 * @constructor
 */
function LineScore(canvas)
{

}

function ControlArea(scoreCard)
{
    $( "#tabs" ).tabs();

    this.brOptions = $('.brOptions');
    this.fbOptions = $('.fbOptions');
    this.sbOptions = $('.sbOptions');
    this.tbOptions = $('.tbOptions');
    this.tpOptions = $('.tpOptions');
    this.dpOptions = $('.dpOptions');
    this.dp21Options = $('.dp21Options');
    this.dp31Options = $('.dp31Options');
    this.dp32Options = $('.dp32Options');
    this.tp123Options = $('tp123Options');
    this.tp12HOptions = $('tp12HOptions');
    this.tp13HOptions = $('tp13HOptions');
    this.tp23HOptions = $('tp23HOptions');

    var foDialog = $( "#fly-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    var goDialog = $( "#ground-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    var poDialog = $( "#pop-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    var fcoDialog = $( "#fielders-choice-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 520,
        modal: true
    });

    var dpDialog = $( "#double-play-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    var tpDialog = $( "#triple-play-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });
    $( "#advance-runner-dialog-form" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true,
        buttons: {
            "Next AB": function() {
                scoreCard.nextAB();
                $( this ).dialog( "close" );
            }
        },
        close: function() {

        }
    });

    $( "#1H")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onFirst);
            scoreCard.currentAB.outToSecond('DP');
            scoreCard.onFirst = null;
            scoreCard.recordOut(scoreCard.currentAB);
            scoreCard.currentAB.hit('DP');
            if(scoreCard.outs!=3)
            {
                scoreCard.advanceAllOneNoRBI('');
            }
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            dpDialog.dialog("close");
        });
    $( "#2H")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToThird('DP');
            scoreCard.onSecond = null;
            scoreCard.recordOut(scoreCard.currentAB);
            scoreCard.currentAB.hit('DP');
            if(scoreCard.outs!=3)
            {
                scoreCard.advanceAllOneNoRBI('');
            }
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            dpDialog.dialog("close");
        });
    $( "#3H")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToHome('DP');
            scoreCard.onThird = null;
            scoreCard.recordOut(scoreCard.currentAB);
            scoreCard.currentAB.hit('DP');
            if(scoreCard.outs!=3)
            {
                scoreCard.advanceAllOneNoRBI('');
            }
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            dpDialog.dialog("close");
        });
    $( "#21")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onFirst);
            scoreCard.currentAB.outToSecond('DP');
            scoreCard.onFirst = null;
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToThird('DP');
            scoreCard.onSecond = null;
            scoreCard.currentAB.hit('DP');
            if(scoreCard.outs!=3)
            {
                scoreCard.advanceAllOneNoRBI('');
            }
            scoreCard.onFirst = scoreCard.currentAB;
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            dpDialog.dialog("close");
        });
    $( "#31")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onFirst);
            scoreCard.currentAB.outToSecond('DP');
            scoreCard.onFirst = null;
            scoreCard.recordOut(scoreCard.onThird);
            scoreCard.currentAB.outToHome('DP');
            scoreCard.onThird = null;
            scoreCard.currentAB.hit('DP');
            if(scoreCard.outs!=3)
            {
                scoreCard.advanceAllOneNoRBI('');
            }
            scoreCard.onFirst = scoreCard.currentAB;
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            dpDialog.dialog("close");
        });
    $( "#32dp")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToThird('DP');
            scoreCard.onSecond = null;
            scoreCard.recordOut(scoreCard.onThird);
            scoreCard.currentAB.outToHome('DP');
            scoreCard.onThird = null;
            scoreCard.currentAB.hit('DP');
            if(scoreCard.outs!=3)
            {
                scoreCard.advanceAllOneNoRBI('');
            }
            scoreCard.onFirst = scoreCard.currentAB;
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            dpDialog.dialog("close");
        });
    $( "#123")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onFirst);
            scoreCard.currentAB.outToSecond('');
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToThird('');
            scoreCard.recordOut(scoreCard.currentAB);
            scoreCard.currentAB.hit('TP');
            scoreCard.nextAB();
            tpDialog.dialog("close");
        });
    $( "#12H")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onFirst);
            scoreCard.currentAB.outToSecond('');
            scoreCard.recordOut(scoreCard.onThird);
            scoreCard.currentAB.outToHome('');
            scoreCard.recordOut(scoreCard.currentAB);
            scoreCard.currentAB.hit('TP');
            scoreCard.nextAB();
            tpDialog.dialog("close");
        });
    $( "#23H")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onFirst);
            scoreCard.currentAB.outToSecond('');
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToThird('');
            scoreCard.recordOut(scoreCard.onThird);
            scoreCard.currentAB.outToHome('');
            scoreCard.currentAB.hit('TP');
            scoreCard.nextAB();
            tpDialog.dialog("close");
        });
    $( "#13H")
        .button()
        .click(function(){
            scoreCard.recordOut(scoreCard.onSecond);
            scoreCard.currentAB.outToThird('');
            scoreCard.recordOut(scoreCard.onThird);
            scoreCard.currentAB.outToHome('');
            scoreCard.recordOut(scoreCard.currentAB);
            scoreCard.currentAB.hit('TP');
            scoreCard.nextAB();
            tpDialog.dialog("close");
        });

    $( ".next-ab")
        .button()
        .click(function() {
            scoreCard.nextAB();
        });
    $( ".on-base").button();
    $( ".double-play")
        .button()
        .click(function() {
            $( "#double-play-dialog" ).dialog( "open" );
        });
    $( ".triple-play")
        .button()
        .click(function() {
            $( "#triple-play-dialog" ).dialog( "open" );
        });
    $( ".fly-out")
        .button()
        .click(function() {
            $( "#fly-out-dialog" ).dialog( "open" );
        });
    $( ".fo")
        .button()
        .click(function() {
            scoreCard.flyOut(this.id);
            scoreCard.nextAB();
            foDialog.dialog("close");
        });
    $( ".ground-out")
        .button()
        .click(function() {
            $( "#ground-out-dialog" ).dialog( "open" );
        });
    $( ".go")
        .button()
        .click(function() {
            scoreCard.flyOut(this.id);
            scoreCard.nextAB();
            goDialog.dialog("close");
        });
    $( ".fielders-choice-out")
        .button()
        .click(function() {
            $( "#fielders-choice-out-dialog" ).dialog( "open" );
        });
    $( ".fco")
        .button()
        .click(function() {
            // runner will be passed to fcOut
            var runner;
            switch(this.id.substring(1))
            {
                case '2':
                    runner = scoreCard.onThird;
                    // take runner off third
                    scoreCard.onThird = null;
                    scoreCard.currentAB.outToHome(this.id);
                    break;
                case '4':
                case '6':
                    runner = scoreCard.onFirst;
                    scoreCard.currentAB.outToSecond(this.id);
                    break;
                case '5':
                    runner = scoreCard.onSecond;
                    scoreCard.onSecond = null;
                    scoreCard.currentAB.outToThird(this.id);
                    break;
            }
            scoreCard.advanceAllOneRBI();
            scoreCard.fcOut("FC"+this.id, runner);
            scoreCard.nextAB();
            scoreCard.showRunners(scoreCard.currentAB);
            fcoDialog.dialog("close");
        });
    $( ".pop-out")
        .button()
        .click(function() {
            $( "#pop-out-dialog" ).dialog( "open" );
        });
    $( ".po")
        .button()
        .click(function() {
            scoreCard.flyOut(this.id);
            scoreCard.nextAB();
            poDialog.dialog("close");
        });
    $( ".advance-runners" )
        .button()
        .click(function() {
            $( "#advance-runner-dialog-form" ).dialog( "open" );
        });
    $( "#accordion" ).accordion({
        collapsible: true,
        heightStyle: "content"
    });

    this.hideAll = hideAll;
    function hideAll()
    {
        this.brOptions.hide();
        this.fbOptions.hide();
        this.sbOptions.hide();
        this.tbOptions.hide();
        this.tpOptions.hide();
        this.dpOptions.hide();
        this.dp21Options.hide();
        this.dp31Options.hide();
        this.dp32Options.hide();
        this.tp123Options.hide();
        this.tp12HOptions.hide();
        this.tp13HOptions.hide();
        this.tp23HOptions.hide();
    }

    this.hideAll();
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
    this.hitString = "";

    /**
     * Function to draw this event box on the canvas
     * @type {Function}
     */
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

    /**
     * Used to enlarge this EventBox
     * @type {Function}
     */
    this.magnify = magnify;
    function magnify()
    {
        BOX_W_H = 300;
    }

    /**
     * Draw this EventBox as the start of a new inning
     * @type {Function}
     */
    this.startInning = startInning;
    function startInning(inning)
    {
        this.ctx.strokeRect(this.x+(BOX_W_H *.35),this.y,(BOX_W_H *.3),(BOX_W_H *.25));
        this.ctx.fillText(inning,this.x+(BOX_W_H *.45),this.y+(BOX_W_H *.2));
    }

    /**
     * Draw an out on this EventBox
     * @type {Function}
     */
    this.drawOut = drawOut;
    /**
     * The number of the out 1,2 or 3.
     * @param number
     */
    function drawOut(number)
    {
        var font = this.ctx.font;
        this.ctx.font = BOX_W_H/4+'px Sans-Serif Bold';
        this.ctx.fillText(number,this.x+(BOX_W_H *.44), this.y+(BOX_W_H *.57));
        this.ctx.font = font;
    }

    /**
     * Draw the run scored dot on this EventBox
     * @type {Function}
     */
    this.runScored = runScored;
    function runScored()
    {
        var originalFill = this.ctx.fillStyle;
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H/2), this.y+(BOX_W_H/2), BOX_W_H/12, 0, 2 * Math.PI, false);
        this.ctx.fillStyle = 'black';
        this.ctx.fill();
        this.ctx.fillStyle = originalFill;
    }

    this.onFirst = onFirst;
    function onFirst(number)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x+(BOX_W_H *.78),this.y+(BOX_W_H *.25),BOX_W_H *.18,BOX_W_H *.50);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(number,this.x+(BOX_W_H *.78),this.y+(BOX_W_H *.5));
    }

    this.onSecond = onSecond;
    function onSecond(number)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x+(BOX_W_H *.25),this.y+3,BOX_W_H *.50,BOX_W_H *.18);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(number,this.x+(BOX_W_H *.42),this.y+(BOX_W_H *.17));
    }

    this.onThird = onThird;
    function onThird(number)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x+(BOX_W_H *.03),this.y+(BOX_W_H *.25),BOX_W_H *.18,BOX_W_H *.50);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(number,this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.5));
    }

    this.rbiFirst = rbiFirst;
    function rbiFirst()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.86), this.y+(BOX_W_H *.44), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.rbiSecond = rbiSecond;
    function rbiSecond()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.12), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.rbiThird = rbiThird;
    function rbiThird()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.14), this.y+(BOX_W_H *.45), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.rbiHome = rbiHome;
    function rbiHome(number)
    {
        this.ctx.fillText(number,this.x+(BOX_W_H *.42),this.y+(BOX_W_H *.90));
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.83), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.noRBIFirst = noRBIFirst;
    function noRBIFirst()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.86), this.y+(BOX_W_H *.44), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.noRBISecond = noRBISecond;
    function noRBISecond()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.12), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.noRBIThird = noRBIThird;
    function noRBIThird()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.14), this.y+(BOX_W_H *.45), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.noRBIHome = noRBIHome;
    function noRBIHome(number)
    {
        this.ctx.fillText(number,this.x+(BOX_W_H *.42),this.y+(BOX_W_H *.90));
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.83), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.pickOffFirst = pickOffFirst;
    function pickOffFirst()
    {
        this.ctx.strokeStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.78),this.y+(BOX_W_H *.45));
        this.ctx.lineTo(this.x+(BOX_W_H *.96),this.y+(BOX_W_H *.45));
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.pickOffSecond = pickOffSecond;
    function pickOffSecond()
    {
        this.ctx.strokeStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.44),this.y+(BOX_W_H *.13));
        this.ctx.lineTo(this.x+(BOX_W_H *.59),this.y+(BOX_W_H *.13));
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.pickOffThird = pickOffThird;
    function pickOffThird()
    {
        this.ctx.strokeStyle = 'red';
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.45));
        this.ctx.lineTo(this.x+(BOX_W_H *.19),this.y+(BOX_W_H *.45));
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.toSecond = toSecond;
    function toSecond(how)
    {
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
    }

    this.toThird = toThird;
    function toThird(how)
    {
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
    }

    this.toHome = toHome;
    function toHome(how)
    {
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.25),this.y+(BOX_W_H *.5));
        this.ctx.lineTo(this.x+(BOX_W_H *.5),this.y+(BOX_W_H *.75));
        this.ctx.stroke();
        this.ctx.fillText(how,this.x+(BOX_W_H *.07),this.y+(BOX_W_H *.75));
        //reset original lineWidth
        this.ctx.lineWidth = 1;
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

    this.outToHome = outToHome;
    function outToHome(how)
    {
        //make line slightly bigger
        this.ctx.lineWidth = 3;
        //Path for line from home to 2nd.
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.25),this.y+(BOX_W_H *.5));
        this.ctx.lineTo(this.x+(BOX_W_H *.375),this.y+(BOX_W_H *.625));
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+(BOX_W_H *.3125),this.y+(BOX_W_H *.6875));
        this.ctx.lineTo(this.x+(BOX_W_H *.4375),this.y+(BOX_W_H *.5625));
        this.ctx.stroke();
        this.ctx.fillText(how,this.x+(BOX_W_H *.07),this.y+(BOX_W_H *.75));
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
        this.hitString += type;
        this.ctx.fillText(this.hitString,this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.90));
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