#Tip-Type
Copyright Alex Rohde 2012. Released under GPL v2
* * *
At long last! Type Checking in javascript! Tip-Type is a javascript library for allowing both type checking, and default parameters in javascript. Not compatible with firefox.


Example snippet of code plz?
----------------------------------------------------------------
    function multiply(/*int*/ x, /* int */ y) // This library uses those comments to ascertain expected type
	{
    	TipType();
    	return x * y;
    }

    console.log(multiply(3, 5 )); // logs 15
    console.log(multiply(10, 'oops')); // generates an error, instead of the NaN you'd normally get


Compatibility? 
----------------------------------------------------------------
Chrome: Fuly Supported
IE 8: Fully Supported 
Node: Fully Supported
Firefox: NOT FUNCTIONAL. 
Opera: Untested
Safari: Easy notation NOT supported. 


Does this slow my App down? 
----------------------------------------------------------------
It will be insignificant, and since you should disable this in production, it won't 
slow you down there at all. To disable in production, simply include a line like
TipType = function(){};


So. What other cool stuff?
----------------------------------------------------------------
It can handle "classes," and "subclasses." 
It can be used to assert something is a jQuery object, or a dom element.
There is an un-recommended advanced notation if you want to use default parameters. But everything gets complicated then.


What problem does this library solve?
----------------------------------------------------------------
The inability to type check in JS. 


What if I want to minify?
----------------------------------------------------------------
You're fine, because you won't minify until production and should disable
this at production.


What valid types can I check? 
----------------------------------------------------------------
See the wiki on github for the most complete list. However, it can at least check: string, number, int, object, array, "classes,"
function, date, and html element. 


COPYRIGHT
----------------------------------------------------------------
 * Tip Type 1.02
 * http://alexrohde.com/
 *
 * Copyright 2012, Alex Rohde
 * Licensed under the GPL Version 2 license.
 