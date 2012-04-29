#Tip-Type
Copyright Alex Rohde 2012. Released under GPL v2
* * *
Tip-Type is a javascript library for allowing both type checking, and default parameters in javascript. The type checking is perfromed at runtime and calls a programmer-specified error condition when its assumptions are violated. The ultimate goal of type-checking is to assist in the debugging process.


Example snippet of code plz?
----------------------------------------------------------------
    function multiply(x, y) {
    	var checks = [['x', TYPE.number, 3], ['y', TYPE.number, 13]];
    
    	if(( tmp = TYPE.run(checks)) !== false)	return tmp;
    	/* False indicates all default parameters are already set */
    
    	return x * y;
    }

    console.log(multiply()); // logs 39 because of default parameters
    console.log(multiply(2)); // logs 26 because of default parameter
    console.log(multiply(3, 5 )); // logs 15
    console.log(multiply(10, 'oops')); // generates an error


What problem does this library solve?
----------------------------------------------------------------

Though javascript's type-looseness saves keystrokes in small scripts, 
javascript's place in the web is growing as are the complexity of the applications it's used for.

After too many frustrating experiences where a bug I made in one file would appear to be a bug in another (only because of bad parameters),
I decided to start manually checking all types on frequently-used functions. No longer would I assume the error in my frequnetly-used library function was an issue when in 
fact I had simply typo'd the variable I was passing in.

After a while, I decided to make this library to cut out the redundancy. 


COPYRIGHT
----------------------------------------------------------------
 * Tip Type 1.00
 * http://alexrohde.com/
 *
 * Copyright 2012, Alex Rohde
 * Licensed under the GPL Version 2 license.
 