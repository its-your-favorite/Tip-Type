/**
 * Tip-Type
 * 
 * Type checking for javascript
 * @author Alex Rohde
 * @created 2012
 */ 

/*  Potential ambiguities:
 
 Though the following are all instanceof object in javascript, this library does not trigger true for TYPE.object (date, html element, array [], function, )
	if you want to allow any of these use simply Object , otherwise use TYPE.object , or TYPE.map
 */



/**
 * 
 * @todo: basic error validation
 * @todo: refactoring described below.
 * @todo: Enhance expected error message. If expected was an array of possibilities, display it well.
 * @todo: enhance error message to include line numbers
 * // @todo: decide if setting a type, but no default, should emit an error
 * @todo: refactor code to unify class constants and tests array 
 */

TYPE = function(info) {
	var x, tmp, next = [], failed = false, checks = {};
	var passed = Array.prototype.slice.call(TYPE.caller.arguments);
	/*splice makes it a real array */
	var expected = TYPE.caller.toString();
	/* The list of actual function parameters in the declaration */
	expected = expected.split(")")[0].split("(")[1].split(" ").join("").split(",");
	

	var type_key = 'type', value_key = 'val', default_key = "def";
	/* If the coder uses an assoc object, these valid_keys are the valid properties/keys */
	var valid_keys = [type_key, value_key, default_key];

	if(TYPE.getType(info) !== "Array") {
		TYPE.raiseError("TYPE: CheckParam ITSELF wasn't provided an array. Please see documentation.");
	}
	if(info.length < 1) {/*Empty Array Passed. Okay */
		return;
	}
	if(TYPE.getType(info[0]) === "Array") {/* Info a Numeric array & Not an assoc array? : make it one */
		for( x = 0; x < info.length; x++) {
			if((TYPE.getType(info[x]) !== "Array") || (info[x].length < 1))/*For some reason this function was provided a malformed array */
				return TYPE.raiseError("TYPE: Could not understand...");
			tmp = {	'var' : info[x][0] };
			
			if(info[x].length > 1)
				tmp.type = info[x][1];
			if(info[x].length > 2)
				tmp[default_key] = info[x][2];
			info[x] = tmp;
			checks[info[x]['var']] = tmp;
		}
	} else if (TYPE.getType(info[0]) === "Object") {/* Info an assoc array? : check validity */
		for( x = 0; x < info.length; x++) {
			if((TYPE.getType(info[x]) !== "Object") || (!info[x].hasOwnProperty[default_key]))/*For some reason this function was provided a malformed array */
				return TYPE.raiseError("TYPE: Could not understand...");
			if (info[x].hasOwnProperty('var'))
				checks[info['var']] = info[x];
			else
				checks[expected[x]] = info[x];	/* In an assoc array, make the var element optional */
			}

	} else {
		return TYPE.raiseError("TYPE: Malformed data given. It must be an array of arrays/objects");
	}

	for( x = 0; x < expected.length; x++) {/* For each actual parameter */
	
		if (checks.hasOwnProperty(expected[x]))
		  if(passed[x] !== null) {/* An actual parameter was provided already */
			var type = (checks[expected[x]][type_key]);
			var okay = false, def = [];
			var value = passed[x];
			
			if( typeof (checks[expected[x]][type_key]) !== null) {/* Typeof param was included */
				
				if (TYPE.getType(type) !== "Array") { /* always treat as array*/
					type = [type];
				}

				if (checks[expected[x]].hasOwnProperty(default_key) ) {
					def = checks[expected[x]][default_key];
				}
						
				for (y = 0; (y < type.length) && (!okay); y++) {
					okay |= TYPE.validateParam(type[y], value, def);
				}		
					
				if(!okay) {
					var desc = "";
					if (value && value.toString) 
						desc = value.toString();
						
					TYPE.raiseError("TYPE. Type Checking Assertion Failed on Param #" + (x + 1) + " \"" + expected[x] + "\". Recevied: " + desc + ", expected " + type.toString());
				/* @todo provide function information like above, perhaps in raiseerror */
				}
			}
			/* Okay, we passed validation */
			next.push(value);
			/* Use it */
		} else {/* Otherwise, generate a default */
			if(checks[expected[x]][default_key] == TYPE.Err) {/* Not an optional parameter */
				TYPE.raiseError("TYPE: Required parameter missing P(" + (x + 1) + ")");
				failed = true;
			}

			if( !checks[expected[x]].hasOwnProperty(default_key)) {
				/* No default specified, and no parameter specified... so null */
				next.push(null);
			} else {
				next.push(checks[expected[x]][default_key]);
			}
		}
	}
	
	for (ind in checks) {
		if (checks.hasOwnProperty(ind))
			if ( expected.indexOf(ind) == -1) {
				TYPE.raiseError("TYPE: Check provided for unknown variable. Function doesn't have a variable '" + ind + "'");
				failed = true;
			}
	} 
	
	if((passed.join(",") != next.join(",")) && (!failed)) {
		/* Call again with correct default values */
		return TYPE.caller.apply(this, next);
	}
	return false;
};

/**
 * Class Constants
 */
TYPE.anything = "?";
TYPE.number = "number";
TYPE.integer = "integer";
TYPE.int = "int";
/* same as integer*/
TYPE.string = "string";
TYPE.object = "object";
TYPE.array = "array";
TYPE.arr = "arr";
/* same as array */
TYPE['function'] = "function";
TYPE.date = "date";
TYPE.document = "document";
TYPE.element = "element";
//TYPE.jQuery = "jquery";
TYPE.ERR = [];
TYPE._blank = []; /* dnu */


/**
 * getType 
 * Excerpted from James Padolsey http://james.padolsey.com/javascript/checking-types-in-javascript/
 */
TYPE.getType = function(o) {
	if (o === "") {
		return "String"; /* Modification by Alex, otherwise empty strings are typed as false */
	}
	return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
}

/**
 * raiseError
 * 
 * You can connect this function to your desired error-handler method. It should return falsey.
 */
TYPE.raiseError = function(a) {
	alert(a);
	return false;
};

/**
 * Basic functionality test
 */
TYPE.runTest = function () {
	var tests = [
		["", 				[TYPE.anything, TYPE.string]], /* missing */
		[null, 				[TYPE.anything]],
		[undefined, 		[TYPE.anything]],
		[1, 				[TYPE.anything, TYPE.number, TYPE.integer]],
		[3.14,		 		[TYPE.anything, TYPE.number]],
		[" 22", 			[TYPE.anything, TYPE.number, TYPE.integer, TYPE.string]],
		["2a", 				[TYPE.anything, TYPE.string]],
		[{}, 				[TYPE.anything, TYPE.map, TYPE.object]],
		[(new Object()), 	[TYPE.anything, TYPE.map, TYPE.object]] ,
		[[], 				[TYPE.anything, TYPE.array]],
		[(new Array()), 	[TYPE.anything, TYPE.array]],
		[(new Date()), 		[TYPE.anything, TYPE.date]], 
		[window.document, 	[TYPE.anything, TYPE.document]], 
		[document.getElementsByTagName("html")[0], 	[TYPE.anything, TYPE.element]],
		[document.createElement("div"), 			[TYPE.anything, TYPE.element]], 
		[alert, 			[TYPE.anything, type.func]],
		[function(){},		[TYPE.anything, type.func]]  ];

	var types = [], x, y, matches;
	for (x in TYPE) {
		if (TYPE.hasOwnProperty(x) && (TYPE.getType(TYPE[x]) !== "Function")) {
			types.push(x);
		}
	}
	
	for (x=0; x < tests.length; x++) {
		matches = tests[x][1];
		for (y=0; y < types.length; y++) {
			if (TYPE.validateParam(TYPE[types[y]], tests[x][0], TYPE._blank)) {
				delete matches[matches.indexOf(TYPE[types[y]])];
			}
		}
	if (matches.join("").length)
		alert("Fails to match on " + [x] + " with " + matches.join(","));
	}
}

/**
 * Does the actual validation of a single type and a value
 * 
 */
TYPE.validateParam = function(type, value, def) {
	if(type === String) {/* Since instanceof doesn't believe "test" is an instance of string */
		type = TYPE.string;
	}
	if(type === Number) {/* nor is 15 an instanceof number */
		type = TYPE.number;
	}

	if((value === def)) {
		okay = true;
		/* We're always good when the value equals the default */
	} else if( typeof (type) === "string") {/* Looks like the type provided was a string, or a TYPE.const,  */
		type = type.toLowerCase();

		if( TYPE.testers.hasOwnProperty(type) ) {
			okay = TYPE.testers[type](value);
			/* Empty string means no validator */
		} else {
			TYPE.raiseError("TYPE: Unknown type check, unknown type: " + type);
			/* @todo Include function information too, function name, line, file, VALUE PROVIDED */
		}
	} else if(TYPE.getType(type) === "Function") {/* Looks like the type provided was an actual object, e.g. jQuery, Array, user's class */
		okay = ( value instanceof type);
	}
  return okay;
}

	TYPE.testers = {};
	TYPE.testers[null] = function() {return true; };
	TYPE.testers[TYPE.anything] = function() {		return true;	};
	TYPE.testers[TYPE.number] = function(value) {		return !isNaN(parseFloat(value)) && isFinite(value);	};
	TYPE.testers[TYPE.integer] = function(value) {		return !isNaN((value)) && (parseFloat(value) == parseInt(value));	};
	TYPE.testers[TYPE.int] = TYPE.testers[TYPE.integer];
	TYPE.testers[TYPE.string] = function(value) {		return (TYPE.getType(value) === "String");	};
	TYPE.testers[TYPE.object] = function(value) {		return (TYPE.getType(value) === "Object");	};
	TYPE.testers[TYPE.array] = function(value) {		return (TYPE.getType(value) === "Array");	};
	TYPE.testers[TYPE.arr] = TYPE.testers[TYPE.array];
	TYPE.testers[TYPE['function']] = function(value) {		return (TYPE.getType(value) === "Function");	};
	TYPE.testers[TYPE.date] = function(value) {		return (TYPE.getType(value) === "Date");	};
	TYPE.testers[TYPE.document] = function(value) {		return (TYPE.getType(value) === "HTMLDocument");	};
	TYPE.testers[TYPE.element] = function(value) {		return (value instanceof HTMLElement);	};
	TYPE.testers[TYPE.jQuery] = function(value) {
		if( typeof (jQuery) === "function") {
			return ( value instanceof jQuery);
		} else {
			TYPE.raiseError("TYPE - Usage - Parameter required to be jQuery when jQuery not included");
			return false;
			/* jQuery not included */
		}
	};
