//      expr ::= mulexpr { addop mulexpr }
//   1  addop ::= "+" | "-"
//      mulexpr ::= powexpr { mulop powexpr }
//   2  mulop ::= "*" | "/"
//   3  powexpr ::= "-" powexpr | "+" powexpr | atom [ "^" powexpr ]
//   4  atom ::= ident [ "(" expr ")" ] | numeric | "(" expr ")"
//   5  numeric ::= /[0-9]+(\.[0-9]*)?([eE][\+\-]?[0-9]+)?/
//   5  ident ::= /[A-Za-z_][A-Za-z_0-9]*/
let order = 0;
const tokenizer = (string) => {
    const tokenizeRegex = /[A-Za-z_][A-Za-z_0-9]*|\S/gi;
    const tokens = string.matchAll(tokenizeRegex);
    let elements = [];
    for (const token of tokens) {
        elements.push(token[0]);
    }
    return elements;
}

export const parseExpr = (tokens)=>{
    const symbol = parseSymbol(tokens);
    //console.log('Symbol parsed',symbol,tokens);
    if (!symbol) return false;
    
    let elements = [];

    if (symbol.consumed != undefined) {
        elements = Array.isArray(symbol.result) ? symbol.result : [symbol.result];
    }
    else {
        elements.push(symbol.result);
    }
    //console.log(symbol,tokens);
    for (var i=symbol.consumed; i<tokens.length; i++) {
        if (tokens[i] != '-') {
            //There are still tokens to be consumed but its not a -
            //Recursive call and with replacement
            //console.log(['REP',...tokens.slice(symbol.consumed)]);
            let res = parseExpr(['REP',...tokens.slice(symbol.consumed)]);  
            res[0].icons[0] = symbol.result;
            elements = res;
            return (elements);
            break;
        }

        let symb = parseSymbol(tokens.slice(i+1));

        if (!symb) return elements;  

        elements.push(symb.result);

        if (symb.consumed > 1) {
            i+=symb.consumed;
        }
        else {
            i+=1;
        }
    }
    return elements;
}

const parseSymbol = (tokens)=>{
    const subgroup = parseSubGroup(tokens);
    //console.log('Is subgroup',subgroup,tokens);
    if (subgroup) return subgroup;

    const nested = parseNested(tokens);
    //console.log('Is nested',nested,tokens);
    if (nested) return nested;

    const vertical = parseVertical(tokens);
    //console.log('Is vertical',vertical,tokens);
    if (vertical) return vertical;

    if (isIcon(tokens[0])) return {consumed:1,result:tokens[0]};
}

const nonVertical = (tokens) => {
    const nested = parseNested(tokens);
    if (nested) return nested;

    const subgroup = parseSubGroup(tokens);
    if (subgroup) return subgroup;

    if (isIcon(tokens[0])) return {consumed:1,result:tokens[0]};
}

const nonNested = (tokens) => {
    const subgroup = parseSubGroup(tokens);
    if (subgroup) return subgroup;

    if (isIcon(tokens[0])) return {consumed:1,result:tokens[0]};
}

const parseNonvertical = (tokens) => {
    const symbol = nonVertical(tokens);
    if (!symbol) return false;

    let consumed = symbol.consumed;
    return {consumed,result:symbol.result};
}

const parseNonNested = (tokens) => {
    const symbol = nonNested(tokens);
    //console.log('Non nested',symbol);
    if (!symbol) return false;

    let consumed = symbol.consumed;
    return {consumed,result:symbol.result};
}

// vertical ::= expr { ":" expr}
export const parseVertical = (tokens) => {
    if (tokens.length < 3) return false;
    let consumed = 0;
    const expr = parseNonvertical(tokens);
    
    if (!expr) return false;

    const vertical = {
        type:':',
        icons:[
            expr.result
        ]
    }
    consumed+=expr.consumed;
    for (var i=consumed; i<tokens.length; i++) {
        if (tokens[i] != ':') break;
        consumed++;
        
        let expr = parseNonvertical(tokens.slice(i+1));
        //console.log('Non vertical',expr);
        
        if (!expr) {
            if (vertical.icons.length == 1) return {consumed,result:vertical.icons[0]};
        }

        if (expr.result == undefined) break;

        consumed+=expr.consumed;
        i+=expr.consumed;
        //if (Array.isArray(expr.result)) expr.result = expr.result[0];
        vertical.icons.push(expr.result);
        
    }
    if (vertical.icons.length == 1) return {consumed,result:vertical.icons[0]};
    return {consumed,result:vertical};
}

export const parseNested = (tokens)=>{
    // const icon = isIcon(tokens[0]);
    // if (!icon) return false;

    if (tokens.length<3) return false;
    let consumed = 0;

    const first =  parseNonNested(tokens);
    //console.log('first',first);

    const nested = {
        type:'&',
        icons:[
            first.result
        ]
    }
    //console.log('tokens',tokens);
    consumed += first.consumed;
    for (var i=first.consumed; i <tokens.length; i++) {

        if (tokens[i] != '&') return false;
        consumed++;
        i++;
        
        let expr = parseNonNested(tokens.slice(i));
        //console.log('next no nest',expr);
        if (!expr) {
            if (nested.icons.length == 1) return {consumed,result:nested.icons[0]};
        }
        //console.log(tokens[i]);

        if (expr.result == undefined) break;

        consumed+=expr.consumed;
        i+=expr.consumed-1;         //Will auto increase TODO migrate to while
        nested.icons.push(expr.result);
    }
    if (nested.icons.length == 1) return {consumed,result:nested.icons[0]};
    return {consumed,result:nested};
}

export const parseSubGroup = (tokens) => {
    if (tokens[0] != '(') return false;
    let consumed = 1;
    
    const sub = [];
    for (var i = consumed; i < tokens.length; i++) {
        if (tokens[i] == ')') {
            consumed++;
            break;
        }
        sub.push(tokens[i]);
        consumed++;
    }
    //console.log('Sub Group',sub);
    return {consumed,result:parseExpr(sub)};
}


export const parseCartouche = (tokens) => {
    let consumed = 0;
    if (tokens[consumed] != '<') return false;
    consumed++;

    let start = 1;
    if (tokens[consumed] == 'S' || tokens[consumed] == 'H') {
        start++;
        consumed++;
    }

    const cartouche = {
        type:'cartouche',
        icons:[]
    };

    //Get tokens until we find >
    let sub_tokens = [];
    for (var i = start; i < tokens.length; i++) {
        if (tokens[i] == '>') {
            if(tokens[i-1] != '-') return false;
            consumed++;
            break;
        }
        sub_tokens.push(tokens[i]);
    }
    if (sub_tokens[0]== '-' && sub_tokens[sub_tokens.length-1] == '-') {
        consumed += sub_tokens.length;
        sub_tokens = sub_tokens.slice(1,-1);
    }
    cartouche.icons = parseExpr(sub_tokens);    
    const d = {
        consumed,
        result:cartouche
    }
    return d;
}


export const isIcon = (token) => {
    const operatorRegex = /(-|:|\&)/gi;
    return !operatorRegex.test(token)
}
 
// expr ::= symbol {"-" symbol}
// nested ::= icon { "&" icon}
// vertical ::= novert { ":" novertt}
// horizontal ::= symbol {dash symbol}
// cartouche ::= < horizontal >
// symbol ::= subgroup | nested | vertical | icon
// subgroup ::= "(" icon {"-" icon} ")"
// novert ::= nested | subgroup |icon
// nonest ::= subggroup | icon
export const ramsesIII = (string,iteration=0) => {
    const tokens = tokenizer(string);
    const result = parseExpr(tokens);
    //console.log('Final',result);
    return result;
}