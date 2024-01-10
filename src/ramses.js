//      expr ::= mulexpr { addop mulexpr }
//   1  addop ::= "+" | "-"
//      mulexpr ::= powexpr { mulop powexpr }
//   2  mulop ::= "*" | "/"
//   3  powexpr ::= "-" powexpr | "+" powexpr | atom [ "^" powexpr ]
//   4  atom ::= ident [ "(" expr ")" ] | numeric | "(" expr ")"
//   5  numeric ::= /[0-9]+(\.[0-9]*)?([eE][\+\-]?[0-9]+)?/
//   5  ident ::= /[A-Za-z_][A-Za-z_0-9]*/

const h_sep = "-";			// horizontal group as in "A-B"
const h_sep_alt = "*";		// horizontal group as in "A*B"
const horizontal_sep = [h_sep,h_sep_alt];
const v_sep_2 = ';';
const v_sep = ":";			// vertical group as in "A:B"
const vertical_sep= [v_sep,v_sep_2];
const v_sep_alt = ".";		// vertical group as in "A.B"
const n_sep = "&";			// nested group as in "A&B"
const nn_sep = "&&&";		// nested group as in "A&&&(B:C)"
const nnn_sep = "^^^";		// nested group as in "A^^^B"			// TO DO ("D388A" = "F35^^^D28")
const s_sep_i = "(";		// subgroup initial as in "A:(B-C)"
const s_sep_e = ")";		// subgroup ending as in "A:(B-C)"
const c_sep_i = "<";		// cartouche as in "<-A-B->" / serekh as in "<S-A-B->" / hwt initial as in "<H-A-B->"
const c_sep_e = ">";		// cartouche as in "<-A-B->" / serekh as in "<S-A-B->" / hwt initial as in "<H-A-B->"
const inverted = "\\";
const nested_separators = [n_sep,nn_sep];

/*
// DASH MODIFIERS:
   const d_sep_i = "#b";				// starts a whole dashed area as in "A-#b-B-C#e-D" will dash signs B and C
   const d_sep_e = "#e";				// ends a whole dashed area as in "A-#b-B-C#e-D" will dash signs B and C
   const dashed_c = "//";				// adds a full squared dash as in "A-//-B"
   const dashed_s = "/";				// adds a small squared dash as in "A-B:(/-C)"
   const dashed_h = "h/";				// adds a horizontal area dash as in "A-h/:B" will add a h-dashed area on the top vertical group with sign B
   const dashed_v = "v/";				// adds a vertical area dash as in "A-v/-B"
// COLOR MODIFIERS (applying to group of signs):
// If red will add a "red" property to "custom" object to all the tokens affected (see below):
*  const red_i = "$r";					// starts red text as in "A-$r-B-C-$b-D-E" will paint red signs B and C
   const black_i = "$b";				// starts black text as in "A-$r-B-C-$b-D-E" will paint black signs A (as usual) and D and E as well
// TRANSFORMATOR MODIFIERS (applying only to individual signs):
*  const flip = "{sign}\"				// flips horizontally the sign that goes with as in "A-B\-C" will flip the sign B
*  const rotate = "{sign}\R{degrees}"	// rotates the sign that goes with x degrees clockwise as in "A-B\R20-C" will rotate sign B 20Âº
*  const scale = "{sign}\{scale}"		// scales the sign that goes with x percent as in "A-B\50-C" will make sign B at 50%
// APPEARANCE MODIFIERS (applying only to individual signs):
*  const dashed_a = "{sign}#{areas}";	// individual dashes the sign that goes with as in "A-B#23-C" will dash areas 2 and 3 of sign B
										// areas 1, 2, 3 and 4 go clockwise starting from top-left corner
										// You can hash a group of icons within a "(A-B)#124"
*  const ignored = "{sign}\i"			// marks the sign that goes with as ignored as in "A-B\i-C" will mark as ignored sign B
*  const red = "{sign}\red"				// marks the sign that goes with as red as in "A-B\red-C" will paint only the sign B red
*  const highlighted = "{sign}!"		// marks the sign that goes with as highlighted as in "A-B!-C" will paint only the sign B highlighted
*  const sic = "{sign}§"				// marks the sign as "sic"
*  const question = "{sign}~"			// marks the sign as "question"
*  const determinative = "{sign}@"		// marks the sign that goes with as highlighted as in "A-B-C@" will paint only the sign C as a determinative
// Replace the whole area dashers with custom token sign identifiers, as follows:
// "//" => "Zz8"
// "/"  => "Zz9"
// "h/" => "Zz10"
// "v/" => "Zz11"
// In case of properties marked with "*" will be added into a "custom" object to the token as follows:
// 		custom:{
//			scale:##scale_value || null,
//			flip:true || null,
//			rotation:##rotation_value || null,
//			dash:##dashed_areas || null,
//			ignored:true || null,
//			red:true || null,
//		},
//
// Example:
//		custom:{
//			scale:0.4,		// 40%
//			flip:true,
//			rotation:15,	// 15 deg
//			dash:'134',		// areas 1, 3 and 4 are dashed
//			red:true,
//		},
*/

export const tokenizer = (string) => {
	const tokenizeRegex = /&&&|[A-Za-z_\/\[\]][A-Za-z_\/\[\]0-9]*[\§\~\!|\@]?|\S/gi;
	const tokens = string.matchAll(tokenizeRegex);
	let elements = [];
	for(const token of tokens) {
		elements.push(token[0]);
	}

	return elements;
};

export const parseHorizontalSep = (tokens) => {
	if(tokens.length < 3) return false;
	
	const symbol = parseSymbol(tokens);
	if(!symbol) return false;
	
	let consumed = symbol.consumed;
	
	const result = {
		type:h_sep_alt,
		icons:[
			symbol.result,
		],
	};

	for(var i = consumed; i < tokens.length; i++) {
		if(tokens[i] != h_sep_alt) return false;

		let symb = parseSymbol(tokens.slice(i + 1));

		if(!symb) return false;
		consumed++;
		result.icons.push(symb.result);
		consumed += symb.consumed;
		i += (symb.consumed > 1) ? symb.consumed : 1;
	}
	
	return {consumed,result};
}

export const parseHorizontal = (tokens) => {
	const symbol = parseSymbol(tokens);

	if(!symbol) return false;

	const to_result = typeof symbol.result == 'string' ? [symbol.result] : [symbol.result];

	const result = {
		consumed:symbol.consumed,
		icons: Array.isArray(symbol.result) ? symbol.result : to_result
	}
	//console.log('Parseh',result);
	
	for(var i = result.consumed; i < tokens.length; i++) {
		if(!horizontal_sep.includes(tokens[i])) {
			return result;
			// let res = parseExpr(['REP', ...tokens.slice(symbol.consumed)]); 
			// if(res === false) return elements;

			// res[0].icons[0] = symbol.result;
			// elements = res;
			// return (elements);
		}

		let symb = parseSymbol(tokens.slice(i + 1));

		if(!symb) return result;
		result.consumed++;
		//console.log('Symbol',symb,result);
		result.icons.push(symb.result);
		result.consumed += symb.consumed;
		i += (symb.consumed > 1) ? symb.consumed : 1;
	}
	//console.log('here');
	return result;
}

export const parseExpr = (tokens, prev) => {
	const result = parseHorizontal(tokens);

	if(result === false) return false;
	
	const remaining = tokens.slice(result.consumed);

	if(remaining.length == 0) return Array.isArray(result.icons) ? result.icons:[result.icons];

	//console.log('Result',result);
	//console.log('Remaining',remaining);

	const remaining_res = parseHorizontal(['REP',...remaining]);
	//console.log('Will fill with',result.icons);
	//console.log('Remaingint_res',remaining_res.icons);

	remaining_res.icons[0].icons[0] = result.icons.length == 1 ? result.icons[0] : [...result.icons];
	//console.log('Replaced',remaining_res.icons);
	return Array.isArray(remaining_res.icons) ? remaining_res.icons:[remaining_res.icons];
	
	
	return;

	//console.log('Call parse expre with',tokens)
	
	const symbol = parseSymbol(tokens);
	
	//console.log('Symbol',symbol);
	
	
	if(!symbol) return false;
	
	let elements = [];

	if(symbol.consumed != undefined) {
		elements = Array.isArray(symbol.result) ? symbol.result : [symbol.result];
	} else {
		elements.push(symbol.result);
	}
	
	for(var i = symbol.consumed; i < tokens.length; i++) {
		//console.log('Next',tokens[i]);
		if(!horizontal_sep.includes(tokens[i])) {
		//if(tokens[i] != h_sep && tokens[i] != h_sep_alt) {
			
			//There are still tokens to be consumed but its not a -
			//Recursive call and with replacement
			//console.log(['REP',...tokens.slice(symbol.consumed)]);
			//console.log('enter??',tokens)
			// let res = parseExpr([tokens.slice(symbol.consumed)]); 
			// if(res === false) return elements; 

			// elements.push(res);
			//console.log(['REP', ...tokens.slice(symbol.consumed)]);
			let res = parseExpr(['REP', ...tokens.slice(symbol.consumed)]); 
			if(res === false) return elements;

			res[0].icons[0] = symbol.result;
			elements = res;
			return (elements);
		}

		let symb = parseSymbol(tokens.slice(i + 1));
		//console.log('Parsing second',symb,tokens.slice(i + 1));
		if(!symb) return elements;

		elements.push(symb.result);

		i += (symb.consumed > 1) ? symb.consumed : 1;
	}
	//console.log('Final elements',elements);
	return elements;
};

export const parseSymbol = (tokens) => {
	//console.log(tokens,tokens.length);
	
	const cartouche = parseCartouche(tokens);
	//console.log('Cartouche',cartouche,tokens);
	if(cartouche) return cartouche;

	const vertical = parseVertical(tokens);
	//console.log('Is vertical',vertical,tokens);
	if(vertical) return vertical;

	const subgroup = parseSubGroup(tokens);
	// console.log('Subgroup',subgroup,tokens);
	// console.log('Tha tokens',tokens);
	// if(tokens.length < 11 && tokens.length > 3){
	// 	console.log('Subgroup',subgroup,tokens);
	// 	return;
	// }
	if(subgroup) return subgroup;

	const nested = parseNested(tokens);
	//console.log('Is nested',nested,tokens);
	
	if(nested) return nested;

	return consumeIcon(tokens);
	//if(isIcon(tokens[0]) && tokens.length == 1) return { consumed:1, result:tokens[0] };

	//return false;
};

// novert ::= nested | subgroup | cartouche | icon
const nonVertical = (tokens) => {
	const nested = parseNested(tokens);
	if(nested) return nested;

	const subgroup = parseSubGroup(tokens);
	if(subgroup) return subgroup;

	const cartouche = parseCartouche(tokens);
	if(cartouche) return cartouche;

	const result = consumeIcon(tokens);
	
	if(result) return result;

	if(isIcon(tokens[0])) {
		return {
			consumed:1,
			result:tokens[0],
		};
	}
};

const nonNested = (tokens) => {
	const subgroup = parseSubGroup(tokens);

	if(subgroup) return subgroup;

	const result = consumeIcon(tokens);

	if(result) return result;

	if(isIcon(tokens[0])) {
		return {
			consumed:1,
			result:tokens[0],
		};
	}
};

const parseNonvertical = (tokens) => {
	const symbol = nonVertical(tokens);
	if(!symbol) return false;

	let consumed = symbol.consumed;

	return {
		consumed,
		result:symbol.result,
	};
};

const parseNonNested = (tokens) => {
	const symbol = nonNested(tokens);
	if(!symbol) return false;

	let consumed = symbol.consumed;
	
	return {
		consumed,
		result:symbol.result,
	};
};

// vertical ::= expr { ":" expr}
export const parseVertical = (tokens) => {
	if(tokens.length < 3) return false;

	let consumed = 0;
	const expr = parseNonvertical(tokens);
	
	if(!expr) return false;

	const vertical = {
		type:v_sep,
		icons:[
			expr.result,
		],
	};

	consumed += expr.consumed;

	for(var i = consumed; i < tokens.length; i++) {
		if(!vertical_sep.includes(tokens[i])) break;
		consumed++;
		
		let expr = parseNonvertical(tokens.slice(i + 1));
		
		if(!expr && vertical.icons.length == 1) {
			return {
				consumed,
				result:vertical.icons[0],
			};
		}

		if(expr.result == undefined) break;

		consumed += expr.consumed;
		i += expr.consumed;
		//if(Array.isArray(expr.result)) expr.result = expr.result[0];
		vertical.icons.push(expr.result);
	}
	
	if(vertical.icons.length == 1) {
		return {
			consumed,
			result:vertical.icons[0],
		};
	}

	return {
		consumed,
		result:vertical,
	};
};

export const parseNested = (tokens) => {
	if(tokens.length < 3) return false;
	let consumed = 0;

	const first = parseNonNested(tokens);
	
	const nested = {
		type:n_sep,
		icons:[
			first.result,
		],
	};

	consumed += first.consumed;

	let next = null;
	let must_match_separator = true;
	
	for(var i = first.consumed; i < tokens.length; i++) {
		//console.log(tokens,must_match_separator,tokens[i]);
		if(must_match_separator && !nested_separators.includes(tokens[i])) {
			break;
		}

		if(nested_separators.includes(tokens[i])) {
			if(next == null) {
				next = tokens[i];
				nested.type = next;
			}

			if(tokens[i] == next) {
				consumed++;
				must_match_separator = false;
				continue;
			}
		}
		
		let expr = parseNonNested(tokens.slice(i));
		
		if(!expr && nested.icons.length == 1) {
			return {
				consumed,
				result:nested.icons[0],
			};
		}
		
		consumed += expr.consumed;
		i += expr.consumed - 1;
		nested.icons.push(expr.result);
		must_match_separator = true;
	}

	if(nested.icons.length < 2) return false;

	return {
		consumed,
		result:nested,
	};

	// for(var i=first.consumed; i < tokens.length; i++) {
		
	// 	if(tokens[i] != n_sep) {
	// 		if(nested.icons.length < 2) return false;

	// 		return {
	// 			consumed,
	// 			result:nested,
	// 		};
	// 	}

	// 	consumed++;
	// 	i++;

	// 	let expr = parseNonNested(tokens.slice(i));

	// 	if(!expr && nested.icons.length == 1) {
	// 		return {
	// 			consumed,
	// 			result:nested.icons[0],
	// 		};
	// 	}

	// 	if(expr.result == undefined) break;

	// 	consumed += expr.consumed;
	// 	i += expr.consumed - 1;		//Will auto increase TODO migrate to while
	// 	nested.icons.push(expr.result);
	// }

	// if(nested.icons.length == 1) {
	// 	return {
	// 		consumed,
	// 		result:nested.icons[0],
	// 	};
	// }

	// return {
	// 	consumed,
	// 	result:nested,
	// };
};

export const parseSubGroup = (tokens) => {
	if(tokens[0] != s_sep_i) return false;

	let consumed = 1;

	const sub = [];
	let parity = 0;
	for(var i = consumed; i < tokens.length; i++) {
		if(tokens[i] == s_sep_i) parity++;
		if(tokens[i] == s_sep_e) {
			consumed++;
			if(parity == 0) {
				break;
			} else {
				parity--;
			}
		} else {
			consumed++;
		}
		sub.push(tokens[i]);
	}

	//console.log('Sub',sub);
	const sub_exp = parseExpr(sub);
	//console.log('Sub result',sub_exp);
	const result = {
		consumed,
		result: (Array.isArray(sub_exp) && sub_exp.length == 1) ? sub_exp[0] : sub_exp ,
	};

	// console.log('Before inverted',result);
	const inverted = isInverted(result.result, tokens[consumed]);
	// console.log('Inverted',inverted);
	if(inverted) {
		result.consumed++;
		result.result = inverted;
	}

	return result;
};

export const parseCartouche = (tokens) => {
	let consumed = 0;
	if(tokens[consumed] != c_sep_i) return false;
	consumed++;

	let type = 'cartouche';
	let start = 1;

	if(tokens[consumed] == 'S') {
		type = 'serekh';
		start++;
		consumed++;
	} else if(tokens[consumed] == 'H') {
		type = 'hwt';
		start++;
		consumed++;
	} else if(tokens[consumed] == 'F') {
		type = 'enclosure';
		start++;
		consumed++;
	}

	const cartouche = {
		type,
		icons:[],
	};

	//Get tokens until we find >
	let sub_tokens = [];
	for(var i = start; i < tokens.length; i++) {
		if(tokens[i] == c_sep_e) {
			if(tokens[i - 1] != h_sep) return false;
			consumed++;
			break;
		}
		sub_tokens.push(tokens[i]);
	}

	if(sub_tokens.length == 0) return false;

	if(sub_tokens[0] == h_sep && sub_tokens[sub_tokens.length - 1] == h_sep) {
		consumed += sub_tokens.length;
		sub_tokens = sub_tokens.slice(1, -1);
	}

	cartouche.icons = parseExpr(sub_tokens);

	return {
		consumed,
		result:cartouche
	};
};

export const isIcon = (token) => {
	const operatorRegex = /(-|:|\&|\<)/gi;
	return !operatorRegex.test(token);
};

export const consumeIcon = (tokens) => {
	if(!isIcon(tokens[0])) return false;

	if(tokens.length == 1) return { consumed:1, result:tokens[0] };

	const inverted = isInverted([tokens[0]], tokens[1]);
	if(inverted != false) {
		return {
			consumed:2,
			result:inverted,
		};
	}

	return false;
	//return { consumed:1, result:tokens[0] };
}

const isInverted = (symbol, token) => {
	if(token != inverted) return false;
	if (Array.isArray(symbol) ) {
		if (symbol.length == 1) {
			return {
				inverted:true,
				icon:symbol[0]
			}
		}

		return {
			type:'h',
			inverted:true,
			icons:symbol
		}
	}

	return {...symbol,inverted:true}
}

// A-<-B-C&D-E:(E-F&G)->-E:(E-F&G)
// A-<-B*C&D*E:E*F&G->-E:E*F&G

// -
// & / &&& / ^^^
// : / .
// ()
// < / <S / <H
//

// expr ::= symbol {"-" symbol}
// nested ::= icon { "& | &&"  icon}
// vertical ::= novert { ":" novert}
// horizontal ::= symbol {dash symbol}
// cartouche ::= < horizontal >
// symbol ::= cartouche | subgroup | nested | vertical | icon 
// subgroup ::= "(" expr ")"
// novert ::= nested | subgroup | cartouche |  | icon
// nonest ::= subggroup | icon
export const ramsesIII = (string) => {
	const result = parseExpr(tokenizer(string));
	if(result == false) return [];
	return result;
};

export default ramsesIII;