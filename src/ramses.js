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
const dashed = "#";
const horizontal_sep = [h_sep];
const v_sep = ":";			// vertical group as in "A:B"
const v_sep_2 = ";";		// fluid vertical group as in "A;B"
const vertical_sep= [v_sep,v_sep_2];
const n_sep = "&";			// nested group as in "A&B"
const nn_sep = "&&&";		// nested group as in "A&&&(B:C)"
const nnn_sep = "^^^";		// nested group as in "A^^^B"			// TO DO ("D388A" = "F35^^^D28")
const s_sep_i = "(";		// subgroup initial as in "A:(B-C)"
const s_sep_e = ")";		// subgroup ending as in "A:(B-C)"
const c_sep_i = "<";		// cartouche as in "<-A-B->" / serekh as in "<S-A-B->" / hwt initial as in "<H-A-B->"
const c_sep_e = ">";		// cartouche as in "<-A-B->" / serekh as in "<S-A-B->" / hwt initial as in "<H-A-B->"
const inverted = "\\";
const nested_separators = [n_sep,nn_sep];
const d_sep_i = "#b";				// starts a whole dashed area as in "A-#b-B-C#e-D" will dash signs B and C
const d_sep_e = "#e";				// ends a whole dashed area as in "A-#b-B-C#e-D" will dash signs B and C
const red_i = "$r";					// starts red text as in "A-$r-B-C-$b-D-E" will paint red signs B and C
const black_i = "$b";				// starts black text as in "A-$r-B-C-$b-D-E" will paint black signs A (as usual) and D and E as well
const red = "\\red"				// marks the sign that goes with as red as in "A-B\red-C" will paint only the sign B red
const highlighted = "!"		// marks the sign that goes with as highlighted as in "A-B!-C" will paint only the sign B highlighted
/*
// DASH MODIFIERS:
   const dashed_c = "//";				// adds a full squared dash as in "A-//-B"
   const dashed_s = "/";				// adds a small squared dash as in "A-B:(/-C)"
   const dashed_h = "h/";				// adds a horizontal area dash as in "A-h/:B" will add a h-dashed area on the top vertical group with sign B
   const dashed_v = "v/";				// adds a vertical area dash as in "A-v/-B"
// COLOR MODIFIERS (applying to group of signs):
// If red will add a "red" property to "custom" object to all the tokens affected (see below):
// TRANSFORMATOR MODIFIERS (applying only to individual signs):
*  const flip = "{sign}\"				// flips horizontally the sign that goes with as in "A-B\-C" will flip the sign B
*  const rotate = "{sign}\R{degrees}"	// rotates the sign that goes with x degrees clockwise as in "A-B\R20-C" will rotate sign B 20º
*  const scale = "{sign}\{scale}"		// scales the sign that goes with x percent as in "A-B\50-C" will make sign B at 50%
// APPEARANCE MODIFIERS (applying only to individual signs):
*  const dashed_a = "{sign}#{areas}";	// individual dashes the sign that goes with as in "A-B#23-C" will dash areas 2 and 3 of sign B
										// areas 1, 2, 3 and 4 go clockwise starting from top-left corner
										// You can hash a group of icons within a "(A-B)#124"
*  const ignored = "{sign}\i"			// marks the sign that goes with as ignored as in "A-B\i-C" will mark as ignored sign B


*  const sic = "{sign}§"				// marks the sign as "sic"
*  const question = "{sign}~"			// marks the sign as "question"
*  const determinative = "{sign}@"		// marks the sign that goes with as highlighted as in "A-B-C@" will paint only the sign C as a determinative
// Replace the whole area dashers with custom token sign identifiers, as follows:
// "//" => "Zz4"
// "/"  => "Zz4A"
// "h/" => "Zz4B"
// "v/" => "Zz4C"
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
	const tokenizeRegex = /&&&|#b|#e|\$r|\$b|\\red|!|#[1234]+|[A-Za-z_\/\[\]0-9][A-Za-z_\/\[\]0-9]*[\§\%\~|\@]?|\S/gi;
	const tokens = string.matchAll(tokenizeRegex);
	let elements = [];
	for(const token of tokens) {
		elements.push(token[0]);
	}

	return elements;
};

const groupable = (tokens) => {

	const subgroup = parseSubGroup(tokens);
	if(subgroup) return subgroup;

	const nested  = parseNested(tokens);
	if(nested) return nested;

	const symbol = isIcon(tokens[0]) ? {result:tokens[0],consumed:1} : false;

	const inverted = isInverted([symbol.result], tokens[symbol.consumed]);
	if(inverted) {
		return {result:inverted,consumed:symbol.consumed+1}
	}

	const has_options = consumeIconOptions(tokens.slice(symbol.consumed));
	let found = false;
	if(has_options) {
		found = true;
		symbol.consumed += has_options.consumed;
		if (typeof symbol.result == 'string') {
			symbol.result = {
				icon:symbol.result,
				dynamic:has_options.dynamic
			}
		}
		else {
			symbol.result.dynamic = has_options.dynamic;
		}
	}

	return symbol;
}

export const parseHorizontalSep = (tokens) => {
	if(tokens.length < 3) return false;
	let consumed = 0;

	const symbol = groupable(tokens);

	if(!symbol) return false;
	consumed+= symbol.consumed;

	
	const result = {
		type:h_sep_alt,
		icons:[
			symbol.result
		],
	};
	let is_valid = false;
	
	for(var i = consumed; i < tokens.length; i++) {
		if(tokens[i] != h_sep_alt) {
			break;
		}
		i++;
		consumed++;
		
		let symb = groupable(tokens.slice(i));
		// console.log('GroupableIteration',symb);
		result.icons.push(symb.result);
		consumed+= symb.consumed;
		if(!symb) return is_valid ? {consumed,result} : false;
		is_valid = result.icons.length>1;
	}
	if (!is_valid) return false;
	//console.log('returnresult',{consumed,result})
	return {consumed,result};
}

const addDashedToSymbol = (symbol,tokens) => {
	if (tokens.length == 0) return false;
	let dashed = parseDashed(tokens[0]);
	if (!dashed ) return false;
	
	if (typeof symbol.result != 'object') {
		symbol.result = {
			icon:symbol.result,
			dashed:dashed.dashed
		}
	}
	else {
		symbol.result.dashed = dashed.dashed
	}
		
	symbol.consumed+=dashed.consumed;
	return true;
}

export const parseHorizontal = (tokens) => {
	let symbol = parseSymbol(tokens);
		
	if(!symbol) return false;
	const result = {}

	result.consumed = symbol.consumed;
	const to_result = typeof symbol.result == 'string' ? [symbol.result] : [symbol.result];
	result.icons = Array.isArray(symbol.result) ? symbol.result : to_result
	
	for(var i = symbol.consumed; i < tokens.length; i++) {
		if(!horizontal_sep.includes(tokens[i])) {
			return result;
		}
		const remaining = tokens.slice(i + 1);
		if (remaining.length == 0) return false;

		let symb = parseDashedHorizontal(tokens.slice(i + 1));

		if (!symb) {
			symb = parseColoredExpression(tokens.slice(i + 1));
		}

		if (!symb) {
			symb = parseSymbol(tokens.slice(i + 1));
		}
		if(!symb) return result;

		if (symb?.result) {
			result.icons.push(symb.result);
		}
		if (symb?.icons) {
			result.icons.push(...symb.icons);
		}
		result.consumed += symb.consumed+1;
		i += (symb.consumed > 1) ? symb.consumed : 1;
	}
	return result;
}

export const parseDashedExpr = (tokens) => {
	if (tokens[0] != d_sep_i) return false;
	if (tokens[1] != h_sep) return false;
	const sub_tokens = [];
	let valid = false;
	for (var i = 2; i < tokens.length; i++) {
		if (tokens[i] == d_sep_e && sub_tokens[sub_tokens.length-1]==h_sep) {
			sub_tokens.splice(-1);
			valid = true;
			break;
		}
		sub_tokens.push(tokens[i]);
	}
	if (!valid) return false;
	
	const expr = parseExprNonRecursive(sub_tokens);
	if (expr === false) return false;

	//Dash separated expression
	if (expr?.icons) {
		return {
			consumed:expr.consumed+4,
			icons:expr.icons.map(icon=>{
				if (typeof icon =='string') return {icons:[icon],dashed:"1234"}
				return {
					...icon,
					dashed:'1234'
				}
			})
		};
	}
	
	return {
		consumed:expr.consumed+4,
		icons:{
			icons:expr.icons,
			dashed:"1234"
		}
	}

	if (tokens[expr.consumed+2] != h_sep) return false;
	if (tokens[expr.consumed+3] != d_sep_e) return false;
	//Add dashed to the inner expression
	if (expr.icons.length == 1) {
		return {
			consumed:expr.consumed+4,
			icons:{
				...expr.icons[0],
				dashed:"1234"
			}
		}
	}

	return {
		consumed:expr.consumed+4,
		icons:{
			icons:expr.icons,
			dashed:"1234"
		}
	}
}

export const parseDashedHorizontal = (tokens) => {
	if (tokens[0] != d_sep_i) return false;
	if (tokens[1] != h_sep) return false;
	let sub_expression = [];
	let valid = false;
	for (var i = 2; i < tokens.length; i++) {
		if (tokens[i] == d_sep_e && sub_expression[sub_expression.length-1]==h_sep) {
			sub_expression.splice(-1);
			valid = true;
			break;
		}
		sub_expression.push(tokens[i]);
	}

	if (!valid) return false;
	const expr = parseHorizontal(sub_expression);
	if (expr === false) return false;	

	//Add dashed to the inner expression
	if (expr.icons.length == 1) {
			return {
				consumed:expr.consumed+4,
				icons:expr.icons.map(icon=>{
					if (typeof icon =='string') return {icons:[icon],dashed:"1234"}
					return {
						...icon,
						dashed:'1234'
					}
				})
			};
		
	}

	return {
		consumed:expr.consumed+4,
		result:{
			icons:expr.icons,
			dashed:"1234"
		}
	}
}

export const parseColoredExpression = (tokens) => {
	const colors = [red_i,black_i];
	if (!colors.includes(tokens[0])) return false;

	if (tokens[1] != h_sep) return false;
	const sub_tokens = [];
	let consumed = 2;
	for (var i = 2; i < tokens.length; i++) {
		if (colors.includes(tokens[i]) && sub_tokens[sub_tokens.length-1]==h_sep) {
			sub_tokens.splice(-1);
			break;
		}
		consumed++;
		sub_tokens.push(tokens[i]);
	}
	const expr = parseExprNonRecursive(sub_tokens);
	if (expr === false) return false;

	if (tokens[0] == black_i) return {
		consumed:expr.consumed+consumed,
		icons:expr.icons	
	}
	

	//Red color
	if (expr?.icons) {
		return {
			consumed:expr.consumed+consumed,
			icons:expr.icons.map(icon=>{
				if (typeof icon =='string') return {icons:[icon],red:true}
				return {
					...icon,
					red:true
				}
			})
		};
	}
	
	return {
		consumed:expr.consumed+consumed,
		icons:{
			icons:expr.icons,
			red:true
		}
	}
}


const parseExprNonRecursive = (tokens) => {
	const result = parseHorizontal(tokens);
	if(result === false) return false;

	return result;
}


const returnExprResult = (result,tokens)=>{
	const remaining = tokens.slice(result.consumed);
	const parsed = result.icons;
	if(remaining.length == 0) {
		return parsed;
	}

	const remaining_res = parseExpr(['REP',...remaining]);

	remaining_res[0] = parsed;

	return remaining_res;
}


export const parseExpr = (tokens, prev=undefined) => {
	if (prev != undefined && JSON.stringify(tokens) == JSON.stringify(prev)) return false;
	let result = parseDashedExpr(tokens);

	if (result === false) {
		result = parseColoredExpression(tokens);
	}

	if (result === false) {
		result = parseHorizontal(tokens);
	}
	if(result === false) return false;

	let remaining = tokens.slice(result.consumed);

	if(remaining.length == 0) return Array.isArray(result.icons) ? result.icons:[result.icons];

	if (remaining[0] == red) {
		const last_index = result.icons.length-1;
		if (typeof result.icons[last_index] == 'string') {
			result.icons[last_index] = {icon:result.icons[last_index]};
		}
		result.icons[last_index].red = true;
		result.consumed++;
		remaining = remaining.slice(1);
	}

	if (remaining[0] == highlighted) {
		const last_index = result.icons.length-1;
		if (typeof result.icons[last_index] == 'string') {
			result.icons[last_index] = {icon:result.icons[last_index]};
		}
		result.icons[last_index].highlighted = true;
		result.consumed++;
		remaining = remaining.slice(1);
	}

	if(remaining.length == 0) return Array.isArray(result.icons) ? result.icons:[result.icons];

	const remaining_res = parseExpr(['REP',...remaining],tokens);

	if (remaining_res == false) return [];

	if (Array.isArray(remaining_res)) {
		return [...result.icons,...remaining_res.slice(1)];
	}
	return Array.isArray(remaining_res.icons) ? remaining_res.icons:[remaining_res.icons];
};

export const parseSymbol = (tokens) => {	
	const cartouche = parseCartouche(tokens);
	//console.log('Cartouche',cartouche,tokens);
	if(cartouche) return cartouche;
	
	const vertical = parseVertical(tokens);
	//console.log('Is vertical',vertical,tokens);
	if(vertical) return vertical;
	
	const h_group = parseHorizontalSep(tokens);
	// console.log('HGroup',tokens,h_group);
	if(h_group) return h_group;

	const subgroup = parseSubGroup(tokens);
	// console.log('subgroup',subgroup);
	if(subgroup) return subgroup;

	const nested = parseNested(tokens);
	//console.log('Is nested',nested,tokens);
	if(nested) return nested;

	return consumeDashedIcon(tokens);
	//if(isIcon(tokens[0]) && tokens.length == 1) return { consumed:1, result:tokens[0] };

	//return false;
};

// novert ::= horizontal_ nested | subgroup | cartouche | icon
const nonVertical = (tokens) => {

	const horizontal = parseHorizontalSep(tokens);
	if (horizontal) return horizontal;
	
	const nested = parseNested(tokens);
	if(nested) return nested;

	const subgroup = parseSubGroup(tokens);
	if(subgroup) return subgroup;

	const cartouche = parseCartouche(tokens);
	if(cartouche) return cartouche;

	//console.log('Going to consume icon',tokens);
	const result = consumeIcon(tokens);
	//console.log('Consumed ->',result);

	if(result) return result;

	if(isIcon(tokens[0])) {
		return {
			consumed:1,
			result:tokens[0],
		};
	}
};

const nonNested = (tokens) => {

	// const h_group = parseHorizontalSep(tokens);
	
	// if(h_group) return h_group;
	
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
	// console.log('Non Vertical',expr);
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

		vertical.type = tokens[i];	// totes les agrupacions verticals d'un mateix bloc han de ser iguals (o tots ":" o tots ";")

		const remaining = tokens.slice(i + 1)
		if (remaining.length == 0) break;
		let expr = parseNonvertical(remaining);
		if(!expr && vertical.icons.length == 1) {
			return {
				consumed,
				result:vertical.icons[0],
			};
		}

		if(expr.result == undefined) {
			return false;			
			break;
		}

		consumed += expr.consumed;
		i += expr.consumed;
		//if(Array.isArray(expr.result)) expr.result = expr.result[0];
		vertical.icons.push(expr.result);
	}

	if (vertical.icons.length < 2) return false;

	if(vertical.icons.length == 1) {
		return {
			consumed,
			result:vertical.icons[0],
		};
	}

	const result = {
		consumed,
		result:vertical,
	};
	const is_dashed = addDashedToSymbol(result,tokens.slice(consumed));
	if (is_dashed) {
		return result;
	}

	return result;
};

// export const parseNested = (tokens) => {
// 	if(tokens.length < 3) return false;
// 	let consumed = 0;

// 	const icon = isIcon(tokens[0]) ? tokens[0] : false;

// 	if (!icon) return false;
// 	console.log(icon,tokens);
// 	consumed++;
// 	const nested = {
// 		type:n_sep,
// 		icons:[
// 			icon,
// 		],
// 	};
// 	let next = null;
// 	let must_match_separator = true;
// 	for (var i = consumed; i < tokens.length; i++) {

// 		console.log(i,tokens[i]);

// 		if(must_match_separator && !nested_separators.includes(tokens[i])) {
// 			break;
// 		}

// 		if(nested_separators.includes(tokens[i])) {
// 			if(next == null) {
// 				next = tokens[i];
// 				nested.type = next;
// 			}

// 			if(tokens[i] == next) {
// 				consumed++;
// 				must_match_separator = false;
// 				continue;
// 			}
// 		}
// 		console.log('next',i,tokens[i])
// 		let next_icon = isIcon(tokens[i]) ? tokens[i] : false;
// 		console.log('afet',next_icon);
// 		if (next_icon === false) return false;

// 		nested.icons.push(next_icon);
// 		console.log(nested);
// 		consumed++;
// 	}

// 	if(nested.icons.length < 2) return false;

// 	return {
// 		consumed,
// 		result:nested,
// 	};

// }


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

	const result = {
		consumed,
		result:nested,
	};

	addDashedToSymbol(result,tokens.slice(consumed));

	return result;

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
	let parity = 0;
	for(var i = start; i < tokens.length; i++) {
		if(tokens[i] == c_sep_i) parity++;
		if(tokens[i] == c_sep_e) {
			//if(tokens[i - 1] != h_sep) return false;
			if(parity == 0) {
				consumed++;
				break;
			} else {
				parity--;
			}
		}
		sub_tokens.push(tokens[i]);
	}
	if(sub_tokens.length == 0) return false;

	if(sub_tokens[0] == h_sep && sub_tokens[sub_tokens.length - 1] == h_sep) {
		consumed += sub_tokens.length;
		sub_tokens = sub_tokens.slice(1, -1);
	}
	cartouche.icons = parseExpr(sub_tokens);

	const result = {
		consumed,
		result:cartouche,
	};

	addDashedToSymbol(result,tokens.slice(consumed));
	return result;
};

export const parseDashed = (token) => {
	let consumed = 0;
	// console.log("parseDashed",token);
	const regex_tokens = token.matchAll(/[#1-4]/gi);
	const tokens = [];
	for(const token of regex_tokens) {
		tokens.push(token[0]);
	}
	if (tokens.length == 0) return false;
	// console.log(tokens,'test');
	//console.log('parseDashed',tokens);
	if (tokens[consumed] != dashed) return false;

	consumed++;
	let dashresult = "";
	let index = 1;
	let is_valid = false;
	let found = false;

	const numericReg = /[1-4]/i;

	for (var i = consumed; i<tokens.length; i++) {
		// console.log('evaluating',tokens[i])
		if (!numericReg.test(tokens[i])) break;
		found = false;
		for (var j = index; j < 5; j++) {
			if (parseInt(tokens[i]) != j) continue;
			index = j;
			consumed++;
			dashresult += ""+j;
			is_valid = true;
			found = true;
		}
		if (!found) {
			is_valid = false;
			break;
		}

	}
	//console.log(dashresult)

	if (is_valid) {
		return {consumed:1,dashed:dashresult}
	}

	return false;
	
}


export const isIcon = (token) => {
	const operatorRegex = /(-|:|\&|\<|\*|#b|#e)/gi;
	return !operatorRegex.test(token);
};

export const consumeIcon = (tokens) => {
	//console.log('ConsumeIcon',tokens);
	if(!isIcon(tokens[0])) return false;

	const result = {consumed:1,result:tokens[0]};

	if(tokens.length == 1) return result;

	let found = false;

	const inverted = isInverted([tokens[0]], tokens[1]);
	if(inverted != false) {
		found = true;
		result.consumed = 2;
		result.result = inverted;
	}

	const has_options = consumeIconOptions(tokens.slice(result.consumed));
	if(has_options) {
		found = true;
		result.consumed += has_options.consumed;
		if (typeof result.result == 'string') {
			result.result = {
				icon:result.result,
				dynamic:has_options.dynamic
			}
		}
		else {
			result.result.dynamic = has_options.dynamic;
		}
	}

	if (found) return result;
	
	return false;
	
}

const consumeJsonAlike = (tokens) => {
	if(tokens[0] != '{') return false;
	let consumed = 1;
	let is_valid = false;

	for (var i = 1; i < tokens.length; i++) {
		if(tokens[i] == '}') {
			consumed++;
			is_valid = true;
			break;
		}
		consumed++;
	}
	if (!is_valid) return false;

	const json_string = tokens.slice(0,consumed ).join('');
	//Add " to parse json
	const fixedJSON = json_string.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
	const json = JSON.parse(fixedJSON);

	return {consumed,dynamic:json};
}

const consumeIconOptions = (tokens) => {
	return consumeJsonAlike(tokens);
}

export const consumeDashedIcon = (tokens) => {

	if(!isIcon(tokens[0])) return false;

	const result = {consumed:1,result:tokens[0]};
	
	if(tokens.length == 1) return result;
	
	let found = false;
	
	const inverted = isInverted([tokens[0]], tokens[1]);
	if(inverted != false) {
		found = true;
		found = true;
		result.consumed = 2;
		result.result = inverted;
	}
	
	const has_options = consumeIconOptions(tokens.slice(result.consumed));

	if(has_options) {
		found = true;
		result.consumed += has_options.consumed;
		if (typeof result.result == 'string') {
			result.result = {
				icon:result.result,
				dynamic:has_options.dynamic
			}
		}
		else {
			result.result.dynamic = has_options.dynamic;
		}
	}

	// console.log('Before dash',result);
	const dash_added = addDashedToSymbol(result,tokens.slice(result.consumed));
	if (dash_added) {
		return result
	}

	if (found) return result;
	
	//return false;
	return { consumed:1, result:tokens[0] };
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

const RamsesState = {
	current_color:'black'
}

// A-<-B-C&D-E:(E-F&G)->-E:(E-F&G)
// A-<-B*C&D*E:E*F&G->-E:E*F&G

// -
// & / &&& / ^^^
// : / .
// ()
// < / <S / <H
//

// dash_expr :: "#b" expr "#e"
// expr ::= symbol {"-" symbol}
// nested ::= icon { "& | &&"  icon} {dashed}
// h_groupable ::= subgroup | nested
// vertical ::= novert { ":" novert} {dashed}
// horizontal ::= symbol {dash symbol}
// cartouche ::= < horizontal >
// h_grouping ::= h_groupable "*" h_groupable { "*" h_groupable}
// dashed ::= "#" { ("1"|"2"|"3"|"4") any combination in asc order from 1 to 4 max one of each}  
// symbol ::= cartouche | vertical | h_grouping | subgroup | nested | icon
// symbol_dashed ::= symbol {"#"1234}
// subgroup ::= "(" expr ")"
// novert ::=  h_grouping | nested | subgroup | cartouche |  icon
// nonest ::= subggroup | icon --- parseNested
export const ramsesIII = (string) => {
	
	const result = parseExpr(tokenizer(string),null,RamsesState);
	if(result == false) return [];
	return result;
};

export default ramsesIII;