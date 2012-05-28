/**
 * Tip-Type
 *
 * Type checking for javascript
 * @author Alex Rohde
 * @created 2012
 */

/*  Potential ambiguities:

Though the following actually are all instanceof object in javascript(date, html element, array [], function ), this library does not trigger true for TipType.object
if you want to allow any of these use simply Object with a capital O, otherwise use TipType.object , or TipType.map if you explicitly want an assoc array
*/

/**
 *
 * @todo: Further improve by adding support for anonymous functions in Firefox
 */

/**
 * Used for the quick notation, which doesn't support default values
 * 
 * Assumptions: You don't use { in your comments
 */
TipType = function(/*DO NOT ALTER THIS COMMENT\*/) {
	var expected = TipType.caller.toString(), comment = null, okay = null, sought = null;
	var passed = Array.prototype.slice.call(TipType.caller.arguments), inner;
	var prefix = "/^function .*\\(/";
	var func_name = expected.match(/function\s?([^\(\s]*)\s?\(/i)[1];

	if (TipType.toString().indexOf('/*DO NOT ALTER THIS COMMENT\\*/') === -1) {/* Firefox, safari strips comments from source code */
		expected = (TipType.findActualFunctionSrcWithComments(func_name));
	} else {}
		/* The list of actual function parameters in the declaration */
	
	expected = expected.split("{")[0].replace(/\s/g,"").substr(expected.indexOf('('));
	expected = expected.match(/(\s?(\/\*([^\*]*)\*\/\s?)?([^,\)]+),?)/g);

	var len, variable = null, param_names = [], y, isClass;
	for( x = 0, len = expected.length; x < len; x++) 
		if (expected[x].indexOf("*") >= 0)
		{
		inner = expected[x].split("*/");
		if(inner.length !== 2)
			return TipType.raiseError("TipType: CheckParam ITSELF wasn't provided a valid assertion."); 
		variable = inner[1].split(",")[0];
		inner = inner[0].split("/*");
		if(inner.length !== 2)
			return TipType.raiseError("TipType: CheckParam ITSELF wasn't provided a valid assertion."); 
			
		inner = inner[1].split(","); /* In case multiple valid types */
		
		okay = false;
		for( y = 0, len2 = inner.length; (!okay) && (y < len2); y++) {
			isClass = (typeof(window.hasOwnProperty) === "undefined") ? (typeof(window[inner[y]]) !== "undefined") : window.hasOwnProperty(inner[y]);
			if( isClass ) { /* Existing "class" */
				sought = window[inner[y]];
			} else { /* Treat as a string */
				sought = inner[y];
				}
			okay |= TipType.validateParam(sought, passed[x], []);
		}
		if(!okay) {
			TipType.raiseError("TipType. Type Checking Assertion Failed on " + inner.join(",") + ". Received: " + TipType.getType(passed[x]) + ", expected: " + inner.join(","));
		}

	}

}
/**
 * Used for the lengthy notation, which does support default values
 */
TipType.defaults = function(info) {
	var x, tmp, next = [], failed = false, checks = {};

	var caller = TipType.defaults.caller;
	var passed = Array.prototype.slice.call(caller.arguments);
	/*splice makes it a real array */
	var expected = caller.toString();
	/* The list of actual function parameters in the declaration */
	expected = expected.split(")")[0].split("(")[1].split(" ").join("").split(",");

	var type_key = 'type', value_key = 'val', default_key = "def", name_key = "var";
	/* If the coder uses an assoc object, these valid_keys are the valid properties/keys */
	var valid_keys = [type_key, value_key, default_key];

	if(TipType.getType(info) !== "Array") {
		TipType.raiseError("TipType: CheckParam ITSELF wasn't provided an array. Please see documentation.");
	}
	if(info.length < 1) {/*Empty Array Passed. Okay */
		return;
	}
	if(TipType.getType(info[0]) === "Array") {/* Info a Numeric array & Not an assoc array? : make it one */
		for( x = 0; x < info.length; x++) {
			if((TipType.getType(info[x]) !== "Array") || (info[x].length < 1))/*For some reason this function was provided a malformed array */
				return TipType.raiseError("TipType: Could not understand...");
			tmp = {};
			tmp[name_key] = info[x][0];

			if(info[x].length > 1)
				tmp.type = info[x][1];
			if(info[x].length > 2)
				tmp[default_key] = info[x][2];
			info[x] = tmp;
			checks[info[x][name_key]] = tmp;
		}
	} else if(TipType.getType(info[0]) === "Object") {/* Info an assoc array? : check validity */
		for( x = 0; x < info.length; x++) {
			if((TipType.getType(info[x]) !== "Object"))/*For some reason this function was provided a malformed array  || (!info[x].hasOwnProperty[default_key])*/
				return TipType.raiseError("TipType: Could not understand...");
			if(info[x].hasOwnProperty(name_key))
				checks[info[x][name_key]] = info[x];
			else
				checks[expected[x]] = info[x];
			/* In an assoc array, make the var element optional */
		}

	} else {
		return TipType.raiseError("TipType: Malformed data given. It must be an array of arrays/objects");
	}

	for( x = 0; x < expected.length; x++) {/* For each actual parameter */

		if(checks.hasOwnProperty(expected[x]))
			if( typeof (passed[x]) !== "undefined") {/* An actual parameter was provided already */
				var type = (checks[expected[x]][type_key]);
				var okay = false, def = [];
				var value = passed[x];

				if( typeof (checks[expected[x]][type_key]) !== null) {/* Typeof param was included */

					if(TipType.getType(type) !== "Array") {/* always treat as array*/
						type = [type];
					}

					if(checks[expected[x]].hasOwnProperty(default_key)) {
						def = checks[expected[x]][default_key];
					}

					for( y = 0; (y < type.length) && (!okay); y++) {
						okay |= TipType.validateParam(type[y], value, def);
					}

					if(!okay) {
						var desc = "";
						if(value && value.toString)
							desc = value.toString().substr(0, 10);

						TipType.raiseError("TipType. Type Checking Assertion Failed on Param #" + (x + 1) + " \"" + expected[x] + "\". Received: " + desc + ", expected " + type.toString());
						/* @todo provide function information like above, perhaps in raiseerror */
					}
				}
				/* Okay, we passed validation */
				next.push(value);
				/* Use it */
			} else {/* Otherwise, generate a default */
				if(checks[expected[x]][default_key] == TipType.Err) {/* Not an optional parameter */
					TipType.raiseError("TipType: Required parameter missing P(" + (x + 1) + ")");
					failed = true;
				}

				if(!checks[expected[x]].hasOwnProperty(default_key)) {
					/* No default specified, and no parameter specified... so null */
					next.push(null);
				} else {
					next.push(checks[expected[x]][default_key]);
				}
			}
	}

	for(ind in checks) {
		if(checks.hasOwnProperty(ind))
			if(TipType.indexOf(expected, ind) == -1) {
				TipType.raiseError("TipType: Check provided for unknown variable. Function doesn't have a variable '" + ind + "'");
				failed = true;
			}
	}

	if((passed.join(",") != next.join(",")) && (!failed)) {
		/* Call again with correct default values */
		return caller.apply(this, next);
	}
	return false;
};

TipType.cachedFileContents = {};
TipType.cachedFunctionDeclarations = {};
/**
 * Class Constants
 */
TipType.undef = "undefined";
TipType.defined = "defined";

TipType.number = "number";
TipType.integer = "integer";
TipType.int = "int";
/* same as integer*/
TipType.string = "string";
TipType.object = "object";
TipType.array = "array";
TipType.arr = "arr";
/* same as array */
TipType['function'] = "function";
TipType.callback = "callback";
/* synonymous with function */
TipType.date = "date";
TipType.document = "document";
TipType.element = "element";
TipType.Err = []; 
// Used when indicating that an error should immediately be raised if no parameter is provided
TipType._blank = [];
//useful as a default value
/* dnu */

/**
 * getType
 * Excerpted from James Padolsey http://james.padolsey.com/javascript/checking-types-in-javascript/
 */
TipType.getType = function(o) {
	if(o === "") 
		return "String";
	if (typeof(o) === "undefined")
		return "Undefined";
	if (o === null)
		return "Null"; /* Modifications by Alex, to type falsey values */
		
	return !!o && Object.prototype.toString.call(o).match(/(\w+)\]/)[1];
}

/**
 * raiseError
 *
 * You *should* connect this function to your desired error-handler method. It should return falsey.
 */
TipType.raiseError = function(a) {
	alert(a);
	console.log(a);
	//debugger;
	return false;
};
/**
 * Basic functionality test
 */
TipType.runTest = function() {
	var tests = [["", [TipType.anything, TipType.string]], /* missing */
	[null, [TipType.anything]], [undefined, [TipType.anything]], [1, [TipType.anything, TipType.number, TipType.integer]], [3.14, [TipType.anything, TipType.number]], [" 22", [TipType.anything, TipType.number, TipType.integer, TipType.string]], ["2a", [TipType.anything, TipType.string]], [{}, [TipType.anything, TipType.map, TipType.object]], [(new Object()), [TipType.anything, TipType.map, TipType.object]], [[], [TipType.anything, TipType.array]], [(new Array()), [TipType.anything, TipType.array]], [(new Date()), [TipType.anything, TipType.date]], [window.document, [TipType.anything, TipType.document]], [document.getElementsByTagName("html")[0], [TipType.anything, TipType.element]], [document.createElement("div"), [TipType.anything, TipType.element]], [alert, [TipType.anything, type.func]], [
	function() {
	}, [TipType.anything, type.func]]];

	var types = [], x, y, matches;
	for(x in TipType) {
		if(TipType.hasOwnProperty(x) && (TipType.getType(TipType[x]) !== "Function")) {
			types.push(x);
		}
	}

	for( x = 0; x < tests.length; x++) {
		matches = tests[x][1];
		for( y = 0; y < types.length; y++) {
			if(TipType.validateParam(TipType[types[y]], tests[x][0], TipType._blank)) {
				delete matches[TipType.indexOf(matches, TipType[types[y]])];
			}
		}
		if(matches.join("").length)
			alert("Fails to match on " + [x] + " with " + matches.join(","));
	}
}
/**
 * Does the actual validation of a single type and a value
 *
 */
TipType.validateParam = function(type, value, def) {
	var okay=false;

	if(type === String) {/* Since instanceof doesn't believe "test" is an instance of string */
		type = TipType.string;
	}
	if(type === Number) {/* nor is 15 an instanceof number */
		type = TipType.number;
	}
	if (typeof(type)==='undefined')
		return (typeof(value)==='undefined');
		
	if((value === def)) {
		okay = true;
		/* We're always good when the value equals the default */
	} else if( typeof (type) === "string") {/* Looks like the type provided was a string, or a TipType.const,  */
		type = type.toLowerCase();

		if(TipType.testers.hasOwnProperty(type)) {
			okay = TipType.testers[type](value);
			/* Empty string means no validator */
		} else {
			TipType.raiseError("TipType: Unknown type check, unknown type: " + type);
			return true;
		}
	} else if(TipType.getType(type) === "Function") {/* Looks like the type provided was an actual object, e.g. jQuery, Array, user's class */
		okay = ( value instanceof type);
	}
	else {
		/* unknown type */
	}
	return okay;
}

TipType.testers = {};
/* Gratuitous violation of dry to follow */
TipType.testers[null] = function() {
	return true;
};
TipType.testers[TipType.defined] = function(x) {
	return (typeof(x) !== "undefined");
}; 

TipType.testers[TipType.undef] = function(value) {
	return typeof(value) === "undefined";
};

TipType.testers[TipType.number] = function(value) {
	return !isNaN(parseFloat(value)) && isFinite(value);
};
TipType.testers[TipType.integer] = function(value) {
	return !isNaN((value)) && (parseFloat(value) == parseInt(value));
};
TipType.testers[TipType['int']] = TipType.testers[TipType.integer];
TipType.testers[TipType.string] = function(value) {
	return (TipType.getType(value) === "String");
};
TipType.testers[TipType.object] = function(value) {
	return (TipType.getType(value) === "Object");
};
TipType.testers[TipType.array] = function(value) {
	return (TipType.getType(value) === "Array");
};
TipType.testers[TipType.arr] = TipType.testers[TipType.array];
TipType.testers[TipType['function']] = function(value) {
	return (TipType.getType(value) === "Function");
};
TipType.testers[TipType.callback] = TipType.testers[TipType['function']];

TipType.testers[TipType.date] = function(value) {
	return (TipType.getType(value) === "Date");
};
TipType.testers[TipType.document] = function(value) {
	return (TipType.getType(value) === "HTMLDocument");
};
TipType.testers[TipType.element] = function(value) {
	return ( value instanceof HTMLElement);
};



TipType.indexOf = function(arr,val ){
	for (var i = 0, j = arr.length; i < j; i++) {
         if (arr[i] === val) { return i; }
     }
     return -1;
}

/**
 * Name must not be a regex
 */
TipType.findActualFunctionSrcWithComments = function(name) {
	var file; 
	var fileContents = null; 
	/* if file == main file, don't do this, just use document.innerhtml */
	try { throw new Error("getting filename"); file = file[0][0][0]; } catch (e) { 
			if (!e.hasOwnProperty('stack')) {
				TipType.raiseError("Your browser doesn't support easy notation");
				return false;
			}
			file = e.stack.split('\n').splice(-2)[0].substr(1);
			file = file.substr(0, file.lastIndexOf(':')); /* Ignore line number */
		 };
	
	if (typeof(jQuery) === "undefined")
		return TipType.raiseError("TipType: Fatal Error: Your browser requires jQuery for easy notation");
		
	if (!TipType.cachedFileContents[file])
		jQuery.ajax(file, {async: false})
			.always(function(a,b,c) { 
				TipType.cachedFileContents[file] = c.responseText ; 
				TipType.cachedFunctionDeclarations[file] = {};
				 });
	
	if (TipType.cachedFunctionDeclarations[file].hasOwnProperty(name))
		return TipType.cachedFunctionDeclarations[file][name];
		
	var matches = TipType.cachedFileContents[file].match(new RegExp("function\\s?" + name + "\\([^{]*{", "gi")); /* Eventually we'll want to go in deeper for anonymous functions */
	
	if (matches.length > 1) {
		TipType.raiseError("Tip-Type cannot handle duplicate function declarations in firefox. Function: " + name);
	} else if (matches.length === 1) {
		TipType.cachedFunctionDeclarations[file][name] = matches[0];
		return TipType.cachedFunctionDeclarations[file][name] ;
	} else {
		return false;
	}
}
