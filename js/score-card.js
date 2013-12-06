/**
 * score-card.js is a js tool built with custom js, jquery, and jquery ui.
 * It is a simple baseball scorecard that uses a Modified Riesner Scorekeeping scorecard.
 * In future versions I hope to expand the functionality of the scorecard to be able to create and parse
 * Project Scorecard style baseball scorecards.
 * Created by Marc Kettler on 11/20/13.
 */


/**
 *
 * @param canvas The jquery Canvas object this Scorecard in Drawn on
 * @param overlay The jquery Canvas object used as a foreground. May be used for ui in future versions
 * @param batters The number of batters in the lineup
 * @constructor
 */
function ScoreCard(canvas,overlay,batters)
{
    this.canvas = canvas;
    this.overlay = overlay;
    this.canvas[0].width = 1000;
    this.canvas[0].height = 550;
    //reference to control area
    this.controlArea = null;
    this.inning = 1;
    this.runs = 0;
    this.hits = 0;
    this.outs = 0;
    this.onDeck = null;
    this.currentAB = null;
    this.onFirst = null;
    this.onSecond = null;
    this.onThird = null;
    this.playerBoxes = new Array(batters);
    //create the two dimentional array of eventboxes
    this.eventBoxes = new Array(batters);
    for (var i = 0; i < this.eventBoxes.length; i++)
    {
        this.eventBoxes[i] = new Array(10);
    }

    this.abNum = 1;
    //not the xy coordinates for the canvas used for initial setup should probably just be local variables
    this.x = 120;
    this.y = 0;

    //draw score card header
    drawLineUpCardHeader(this.canvas[0]);
    drawHeading(this.canvas[0],this.x,this.y);
    this.y = 25;
    //initialize and draw playerBoxes
    for (var i = 0; i < this.eventBoxes.length; i++)
    {

        this.playerBoxes[i] = new PlayerBox(this.canvas[0],new Player("Player "+(i+1),i+10,i+1),0,this.y);
        this.playerBoxes[i].draw();
        this.y += 50;
    }
    //initialize and draw lineScore. Not a true line score needs work
    this.lineScore = new LineScore(this.canvas[0],0,this.y);
    this.lineScore.draw(this.hits,this.runs);
    this.y=25;

    //initialize and draw EventBoxez
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

    // Set current AB and redraw to show the active AB
    this.currentAB = this.eventBoxes[0][0];
    this.currentAB.playerBox.currentAB = true;
    this.currentAB.playerBox.draw();

    /**
     * Used to find an eventBox. Useful for planned future functionality.
     * Currently only used to Advance to the next AB
     * @param eventBoxes
     * @param boxID of the box being searched for.
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

    //part of constructor if I do not put it after the method declaration above this causes issues
    this.onDeck = this.findEventBox(this.currentAB.abNum+1);
    /**
     * private method used to draw the heading of the scorecard
     * @param canvas of this scorecard
     * @param x location of heading
     * @param y location of heading
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
     * private method used to draw the Line up card portion of the scorecard
     * @param canvas of this scorecard
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
     * used for end of inning cleanup
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

    /**
     * used for start of inning prep
     * for now only draws the start inning box inside the event box of the player starting the inning
     * @type {Function}
     */
    this.startInning = startInning;
    function startInning()
    {
        this.currentAB.startInning(this.inning);
    }

    /**
     * check to see if any runner is on
     * returns boolean
     * @type {Function}
     */
    this.runnerOn = runnerOn;
    function runnerOn()
    {
        return (this.onFirst!=null || this.onSecond!=null || this.onThird!=null);
    }

    /**
     * Function to make sure only needed menu items are visible.
     * @type {Function}
     */
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

            this.controlArea.toggleBaseRunningEvents();
            // check to see if a runner is on 1st if no runner is on disable options that deal with 1st base
            if(this.onFirst!=null)
            {
                this.controlArea.fbOptions.show();
            }
            else
            {
                this.controlArea.fbOptions.hide();
            }

            // check to see if a runner is on 2nd if no runner is on disable options that deal with 2nd base
            if(this.onSecond!=null)
            {
                this.controlArea.sbOptions.show();
            }
            else
            {
                this.controlArea.sbOptions.hide();
            }

            // check to see if a runner is on 3rd if no runner is on disable options that deal with 3rd base
            if(this.onThird!=null)
            {
                this.controlArea.tbOptions.show();
            }
            else
            {
                this.controlArea.tbOptions.hide();
            }

            if(this.twoRunnersOn())
            {
                this.controlArea.dsOptions.show();
                if(this.firstAndSecond())
                {
                    $('.steal2').hide();
                }
                else if(this.secondAndThird())
                {
                    $('.steal3').hide();
                }
            }
            else
            {
                this.controlArea.dsOptions.hide();
            }

            if(this.areBasesLoaded())
            {
                this.controlArea.tsOptions.show();
                $('.steal2').hide();
                $('.steal3').hide();
            }
            else
            {
                this.controlArea.tsOptions.hide();
            }
            // check for triple play conditions
            if(this.outs==0 && this.twoRunnersOn())
            {
                this.controlArea.toggleTriplePlayEvents();
                if(this.areBasesLoaded())
                {
                    this.controlArea.tp123Options.show();
                    this.controlArea.tp12HOptions.show();
                    this.controlArea.tp13HOptions.show();
                    this.controlArea.tp23HOptions.show();
                }
                else if(this.firstAndSecond())
                {
                    this.controlArea.tp123Options.show();
                    this.controlArea.tp12HOptions.hide();
                    this.controlArea.tp13HOptions.hide();
                    this.controlArea.tp23HOptions.hide();
                }
                else if(this.firstAndThird())
                {
                    this.controlArea.tp123Options.hide();
                    this.controlArea.tp12HOptions.show();
                    this.controlArea.tp13HOptions.hide();
                    this.controlArea.tp23HOptions.hide();
                }
                else if(this.secondAndThird())
                {
                    this.controlArea.tp123Options.hide();
                    this.controlArea.tp12HOptions.hide();
                    this.controlArea.tp13HOptions.show();
                    this.controlArea.tp23HOptions.hide();
                }
            }
            else
            {
                this.controlArea.toggleTriplePlayEvents("hide");
            }

            if(this.outs < 2 && this.runnerOn())
            {
                this.controlArea.toggleDoublePlayEvents();
                if(this.areBasesLoaded())
                {
                    this.controlArea.dp21Options.show();
                    this.controlArea.dp31Options.show();
                    this.controlArea.dp32Options.show();
                }
                else if(this.firstAndSecond())
                {
                    this.controlArea.dp21Options.show();
                }
                else if(this.secondAndThird())
                {
                    this.controlArea.dp32Options.show();
                }
                else if(this.onCorners())
                {
                    this.controlArea.dp31Options.show();
                }
            }
            else
            {
                this.controlArea.toggleDoublePlayEvents("hide");
            }
        }
    }

    /**
     * checks for the situation where runners are on first and second
     * bases may be loaded but this check doesn't care
     * returns boolean
     * @type {Function}
     */
    this.firstAndSecond = firstAndSecond
    function firstAndSecond()
    {
        return (this.onFirst!=null && this.onSecond!=null);
    }

    /**
     * checks for the situation where runners are on first and third
     * bases may be loaded but this check doesn't care
     * returns boolean
     * @type {Function}
     */
    this.firstAndThird = firstAndThird
    function firstAndThird()
    {
        return (this.onFirst!=null && this.onThird!=null);
    }


    /**
     * checks for the situation where runners are on second and third
     * bases may be loaded but this check doesn't care
     * returns boolean
     * @type {Function}
     */
    this.secondAndThird = secondAndThird
    function secondAndThird()
    {
        return (this.onSecond!=null && this.onThird!=null);
    }

    /**
     * checks to see if two runners are on base
     * bases may be loaded this check doesn't care
     * returns boolean
     * @type {Function}
     */
    this.twoRunnersOn = twoRunnersOn;
    function twoRunnersOn()
    {
        return  ( this.firstAndSecond() || this.firstAndThird() || this.secondAndThird() );
    }

    /**
     * checks to see if runners are on 1st and 3rd
     * this check does care if bases are loaded and will only return true for the on the corners situation
     * returns boolean
     * @type {Function}
     */
    this.onCorners = onCorners;
    function onCorners()
    {
        return(this.onFirst!=null&&this.onSecond==null&&this.onThird!=null);
    }

    /**
     * checks to see if the bases are loaded
     * returns boolean
     * @type {Function}
     */
    this.areBasesLoaded = areBasesLoaded;
    function areBasesLoaded()
    {
        return(this.onFirst!=null&&this.onSecond!=null&&this.onThird!=null);
    }

    /**
     * move to the next at-Bat. Checking for end of inning conditions and updating line score and menu options
     * @type {Function}
     */
    this.nextAB = nextAB
    function nextAB()
    {
        //if inning is over draw end of inning in current AB.
        if(this.outs==3)
        {
            this.currentAB.endInning();
        }
        //disable current active playerbox then redraw
        this.currentAB.playerBox.currentAB = false;
        this.currentAB.playerBox.draw();
        // move on deck hitter to the plate
        this.currentAB = this.onDeck;
        // find next on deck
        this.onDeck = this.findEventBox(this.currentAB.abNum + 1);
        //activate currentab playerbox and redraw.
        this.currentAB.playerBox.currentAB = true;
        this.currentAB.playerBox.draw();
        //process end of inning
        if(this.outs==3)
        {
            this.endInning();
            this.startInning();
        }
        //draw linescore and menus
        this.lineScore.draw(this.hits,this.runs);
        this.disableMenuOptions();
    }

    /**
     * Record an out in the eventBox passed in.
     * @type {Function}
     */
    this.recordOut = recordOut;
    function recordOut(eventBox)
    {
        eventBox.drawOut(++this.outs);
    }

    /**
     * advance all runners one base recording an RBI if a run scores
     * @type {Function}
     */
    this.advanceAllOneRBI = advanceAllOneRBI;
    function advanceAllOneRBI()
    {
        // Advance all runners 1 base RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.runs++;
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

    /**
     * advance all runners one base not recording an RBI
     * useful for Wild Pitches, Stolen Bases, errors and other ways a runner will score an unearned run
     * @type {Function}
     */
    this.advanceAllOneNoRBI = advanceAllOneNoRBI;
    function advanceAllOneNoRBI(how)
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.runs++;
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

    /**
     * Advance all runners two bases and record RBIs
     * @type {Function}
     */
    this.advanceAllTwoRBI = advanceAllTwoRBI;
    function advanceAllTwoRBI()
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.runs++;
            this.currentAB.rbiThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onSecond.runScored();
            this.runs++;
            this.currentAB.rbiSecond();
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.onThird = this.onFirst;
            this.onFirst = null;
        }
    }

    /**
     * Advance all runners three bases and record RBIs
     * @type {Function}
     */
    this.advanceAllThreeRBI = advanceAllThreeRBI;
    function advanceAllThreeRBI()
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.runs++;
            this.currentAB.rbiThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onSecond.runScored();
            this.runs++;
            this.currentAB.rbiSecond();
            this.onSecond = null;
        }
        if(this.onFirst!=null)
        {
            this.onFirst.runScored();
            this.runs++;
            this.currentAB.rbiFirst();
            this.onFirst = null;
        }
    }

    /**
     * Advance runners two bases no RBIs
     * @type {Function}
     */
    this.advanceAllTwoNoRBI = advanceAllTwoNoRBI;
    function advanceAllTwoNoRBI(how)
    {
        // Advance all runners 1 base no RBI if run scores
        if(this.onThird!=null)
        {
            this.onThird.runScored();
            this.runs++;
            this.currentAB.noRBIThird();
            this.onThird = null;
        }
        if(this.onSecond!=null)
        {
            this.onSecond.runScored();
            this.runs++;
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

    /**
     * Used to draw the runners currently on base in the event box passed in.
     * The eventBox passed in will be either the currentAB or onDeck player.
     * @type {Function}
     */
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

    /**
     * record a flyOut
     * @type {Function}
     */
    this.flyOut = flyOut;
    /**
     *
     * @param to The location of the fielder the ball was hit to.
     */
    function flyOut(to)
    {
        this.recordOut(this.currentAB);
        this.currentAB.hit(to);
    }

    /**
     *
     * @type {Function}
     */
    this.fcOut = fcOut;
    /**
     *
     * @param from the abString for displaying the play outcome in the currentAB eventBox
     * @param outAt Where to record the outAt. i.e. the eventBox object of the runner who recorded the out
     */
    function fcOut(from,outAt)
    {
        this.recordOut(outAt);
        this.currentAB.hit(from);
        this.onFirst = this.currentAB;
    }

    this.preAB = preAB;
    /**
     * Parse preAB events such as stolen bases, caught stealing, wild pitches, pick offs,
     * @param eventString the event as a string that is decoded and determines the outcome of the play
     */
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
                    this.runs++;
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
    /**
     * Process hits, walks, hit by pitch events
     * @param abString the string to decode into the eventBox
     */
    function processAB(abString)
    {
        // At Bat Events
        switch(abString)
        {
            // Single
            case 'S':
                this.hits++;
                this.advanceAllOneRBI();
                this.onFirst = this.currentAB;
                break;
            // Double
            case 'D':
                this.hits++;
                this.advanceAllTwoRBI();
                this.onSecond = this.currentAB;
                break;
            // Triple
            case 'T':
                this.hits++;
                this.advanceAllThreeRBI();
                this.onThird = this.currentAB;
                break;
            // Home Run
            case 'H':
                this.hits++;
                this.currentAB.runScored();
                this.runs++;
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
    /**
     * This will process postAB events such as runners advancing the correct numbers of bases
     * currently disabled
     * @param abString the abString to decode
     */
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
                    this.runs++;
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
                    this.runs++;
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
                    this.runs++;
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
 * The LineScore is the total of runs and hits at the bottom of the scorecard
 * @param canvas the canvas to draw the linescore on
 * @param x coordinate of this LineScore
 * @param y coordinate of this LineScore
 * @constructor
 */
function LineScore(canvas,x,y)
{
    this.ctx = canvas.getContext('2d');
    this.x = x;
    this.y = y;

    this.draw = draw;
    /**
     * Draw this games LineScore
     * @param hits the total hits
     * @param runs the total runs
     */
    function draw(hits,runs)
    {
        //whitewash score box
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x,this.y,120,50);
        this.ctx.fillStyle = 'black';

        this.ctx.strokeRect(this.x,this.y,120,25);
        var originalFont = this.ctx.font;
        this.ctx.font = 25/2+'px Sans-Serif';
        this.ctx.fillText  ("Hits: "+hits, this.x+(15/2.5), this.y+(25/1.33));
        this.ctx.strokeRect(this.x,this.y+25,120,25);
        this.ctx.fillText  ("Runs: "+runs, this.x+(15/2.5), this.y+25+(25/1.33));
        this.ctx.font = originalFont;
    }
}

/**
 * The ControlArea of this ScoreCard
 * @param scoreCard The ScoreCard this ControlArea is controlling
 * @constructor
 */
function ControlArea(scoreCard)
{
    //The tab Group at the top of the App
    $( "#tabs" ).tabs();

    // All of the classes for menu buttons and options used for hiding and showing menuOptions
    this.brOptions = $('.brOptions');
    this.fbOptions = $('.fbOptions');
    this.sbOptions = $('.sbOptions');
    this.tbOptions = $('.tbOptions');
    this.tpOptions = $('.tpOptions');
    this.dpOptions = $('.dpOptions');
    this.dp21Options = $('.dp21Options');
    this.dp31Options = $('.dp31Options');
    this.dp32Options = $('.dp32Options');
    this.tp123Options = $('.tp123Options');
    this.tp12HOptions = $('.tp12HOptions');
    this.tp13HOptions = $('.tp13HOptions');
    this.tp23HOptions = $('.tp23HOptions');
    this.dsOptions = $('.dsOptions');
    this.tsOptions = $('.tsOptions');

    //The Dialog to display location specifiers for Fly Ball outs.
    var foDialog = $( "#fly-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    //The Dialog to display location specifiers for Ground Ball outs.
    var goDialog = $( "#ground-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    //The Dialog to display location specifiers for infield pop outs.
    var poDialog = $( "#pop-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 350,
        modal: true
    });

    //The Dialog to display location specifiers for fielders choice outs.
    var fcoDialog = $( "#fielders-choice-out-dialog" ).dialog({
        autoOpen: false,
        height: 300,
        width: 520,
        modal: true
    });

    //The Dialog used for choosing post ab runners advancing
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

    //create click functions for unique buttons such as double and triple plays
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
            scoreCard.disableMenuOptions();
        });
    $( ".triple-play")
        .button()
        .click(function() {
            var dialog = $( "#triple-play-dialog" ).dialog( "open" );
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
    this.accordion = $( "#accordion" ).accordion({
        collapsible: true,
        heightStyle: "content"
    });

    //Toggle Method for menu items when a runner is on base
    this.toggleBaseRunningEvents = toggleBaseRunningEvents;
    /**
     * Toggle for On base Menu Options
     * @param option set to hide to hide menu options
     */
    function toggleBaseRunningEvents(option)
    {
        this.accordion.accordion( "option", "active", 0 );
        if(option == "hide")
        {
            this.brOptions.hide();
            this.accordion.find( ".ui-accordion-header:eq(2)" ).hide();
        }
        else
        {
            this.brOptions.show();
            this.accordion.find( ".ui-accordion-header:eq(2)" ).show();
        }
    }

    this.toggleTriplePlayEvents = toggleTriplePlayEvents;
    /**
     * Toggle for Triple play menu
     * @param option set to hide to hide menu options
     */
    function toggleTriplePlayEvents(option)
    {
        this.accordion.accordion( "option", "active", 0 );
        if(option == "hide")
        {
            this.accordion.find( ".ui-accordion-header:eq(4)" ).hide();
        }
        else
        {
            this.accordion.find( ".ui-accordion-header:eq(4)" ).show();
        }
    }


    this.toggleDoublePlayEvents = toggleDoublePlayEvents;
    /**
     * Toggle for Double play menu
     * @param option set option to hide to hide double play options
     */
    function toggleDoublePlayEvents(option)
    {
        this.accordion.accordion( "option", "active", 0 );
        if(option == "hide")
        {
            this.accordion.find( ".ui-accordion-header:eq(3)" ).hide();
        }
        else
        {
            this.accordion.find( ".ui-accordion-header:eq(3)" ).show();
        }
    }
    this.hideAll = hideAll;
    /**
     * Used to Hide all advanced menu options
     * Used when a new inning is started or there are no runners ok base
     */
    function hideAll()
    {
        this.toggleBaseRunningEvents("hide");
        this.toggleDoublePlayEvents("hide");
        this.toggleTriplePlayEvents("hide");
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
 * The Player class
 * @param name Players Name
 * @param number Players Number
 * @param position Players Position
 * @constructor
 */
function Player(name,number,position)
{
    this.name = name;
    this.number = number;
    this.position = position;
}

/**
 * PlayerBox Class this is the graphical element for a player box that exists in the Lineup card
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
 * The EventBox class
 * @param canvas this event box is drawn on
 * @param playerBox PlayerBox associated with this event box
 * @param abNum the At-Bat number
 * @param x coordinate of this EventBox
 * @param y coordinate of this EVentBox
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

    this.magnify = magnify;
    /**
     *  not currently used but planned to use for scaling up a playbox
     */
    function magnify()
    {
        BOX_W_H = 300;
    }


    this.startInning = startInning;
    /**
     * Draw the new inning box in this EventBox
     * @param inning the inning number
     */
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


    this.runScored = runScored;
    /**
     * Draw the run scored dot in this EventBox
     */
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
    /**
     * Draw the runner on first in this EventBox
     * @param number the number of the player on first
     */
    function onFirst(number)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x+(BOX_W_H *.78),this.y+(BOX_W_H *.25),BOX_W_H *.18,BOX_W_H *.50);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(number,this.x+(BOX_W_H *.78),this.y+(BOX_W_H *.5));
    }

    this.onSecond = onSecond;
    /**
     * Draw the runner on second in this EventBox
     * @param number the number of the player on second
     */
    function onSecond(number)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x+(BOX_W_H *.25),this.y+3,BOX_W_H *.50,BOX_W_H *.18);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(number,this.x+(BOX_W_H *.42),this.y+(BOX_W_H *.17));
    }

    this.onThird = onThird;
    /**
     * Draw the runner on third in this EventBox
     * @param number the number of the player on third
     */
    function onThird(number)
    {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(this.x+(BOX_W_H *.03),this.y+(BOX_W_H *.25),BOX_W_H *.18,BOX_W_H *.50);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(number,this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.5));
    }

    this.rbiFirst = rbiFirst;
    /**
     * Draw the RBI circle around the runner on first in this EventBox
     */
    function rbiFirst()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.86), this.y+(BOX_W_H *.44), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.rbiSecond = rbiSecond;
    /**
     * Draw the RBI circle around the runner on second in this EventBox
     */
    function rbiSecond()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.12), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.rbiThird = rbiThird;
    /**
     * Draw the RBI circle around the runner on third in this EventBox
     */
    function rbiThird()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.14), this.y+(BOX_W_H *.45), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.rbiHome = rbiHome;
    /**
     * Used to show an RBI around the hitter of a home run
     */
    function rbiHome(number)
    {
        this.ctx.fillText(number,this.x+(BOX_W_H *.42),this.y+(BOX_W_H *.90));
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.83), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.stroke();
    }

    this.noRBIFirst = noRBIFirst;
    /**
     * Draw the red NoRBI circle around the runner on first in this EventBox
     */
    function noRBIFirst()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.86), this.y+(BOX_W_H *.44), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.noRBISecond = noRBISecond;
    /**
     * Draw the red NoRBI circle around the runner on second in this EventBox
     */
    function noRBISecond()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.51), this.y+(BOX_W_H *.12), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.noRBIThird = noRBIThird;
    /**
     * Draw the red NoRBI circle around the runner on third in this EventBox
     */
    function noRBIThird()
    {
        this.ctx.beginPath();
        this.ctx.arc(this.x+(BOX_W_H *.14), this.y+(BOX_W_H *.45), BOX_W_H*.11, 0, 2 * Math.PI, false);
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
        this.ctx.strokeStyle = 'black';
    }

    this.noRBIHome = noRBIHome;
    /**
     * Draw the red NoRBI circle around the batter
     * Not sure when I will use this maybe Error on a triple that gets the batter home?
     */
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
    /**
     * Draw the Red Line through the runnner on first
     */
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
    /**
     * Draw the Red Line through the runnner on second
     */
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
    /**
     * Draw the Red Line through the runnner on third
     */
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
    /**
     * Draw a thicker Line to second for runner advancement
     * @param how the type of play that moved the runner up such as a SB
     */
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
    /**
     * Draw a thicker Line to third for runner advancement
     * @param how the type of play that moved the runner up such as a SB
     */
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
    /**
     * Draw a thicker Line to home for runner advancement
     * @param how the type of play that moved the runner up such as a SB
     */
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
    /**
     * Draw the out to second line
     * @param how - the type of play that put this runner out such as FC or CS
     */
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
    /**
     * Draw the out to third line
     * @param how - the type of play that put this runner out such as FC or CS
     */
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
    /**
     * Draw the out to home
     * @param how - the type of play that put this runner out such as FC or CS
     */
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
    /**
     * Draw the end of inning symbol on this eventBox
     */
    function endInning()
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.x+BOX_W_H,this.y+BOX_W_H);
        this.ctx.lineTo(this.x+(BOX_W_H*(3/4)),this.y+BOX_W_H);
        this.ctx.lineTo(this.x+BOX_W_H,this.y+(BOX_W_H*(3/4)));
        this.ctx.fill();
    }

    this.hit= hit;
    /**
     * Called the hit function but should probably be renamed Event
     * Draws the event label for this ab such as S,D,T,H,W
     * @param type - The type of event that ended this batters at Bat
     */
    function hit(type)
    {
        this.hitString += type;
        this.ctx.fillText(this.hitString,this.x+(BOX_W_H *.05),this.y+(BOX_W_H *.90));
    }

    this.hitLeft = hitLeft;
    /**
     * Not used yet but will be used for hit direction line
     */
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

    this.hitRight = hitRight;
    /**
     * Not used yet but will be used for hit direction indicator
     */
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
    /**
     * Not used yet but will be used for hit direction indicator
     */
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