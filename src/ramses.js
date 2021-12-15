
const debug = (a,b,c,d) => {
    
    console.log(a,b,c,d)
}

const multipleElement = (regex,string,type,iteration,stop)=>{
    const matches = string.matchAll(regex);
    const myamp = {
        type,
        icons:[]
    };
    let elements = [];
    
    for (const match of matches) {
        elements.push(match);    
    }
    console.log(elements);return;

    if (elements.length < 2) return false;
    
    for (const match in elements) {
        myamp.icons.push(ramsesII(elements[match][1],iteration+1))
    }

    //myamp.icons.push(ramsesII(match[1]));
    if (myamp.icons.length > 0) return myamp;
    return false;
}

const nestedElement = (regex,string,type,iteration,stop)=>{
    const matches = string.matchAll(regex);
    for (const match of matches) {
        var f = ramsesII(match.groups.first);
        var s = ramsesII(match.groups.second);
        if (f.length == 1) f = f[0];
        if (s.length == 1) s = s[0];

        const myamp = {
            type,
            icons:[
                f,
                s
            ]
        }
        const id = `REP${iteration}`;
        const gliph = match.input.replace(match[0],id);
        if (stop) return gliph;

        const result = ramsesII(gliph,iteration+1);

        let result_json = JSON.stringify(result);
        debug('Result Json',result_json);

        result_json = result_json.replace(`"${id}"`,JSON.stringify(myamp));
        //result_json = result_json.replace(`${id}`,JSON.stringify(myamp));
        debug('Replace Reference',result_json);
        debug('To array',JSON.parse(result_json));

        return JSON.parse(result_json);
    }
    return false;
}

const nestedElementSingle = (regex,string,type,iteration,stop)=>{
    const matches = string.matchAll(regex);
    for (const match of matches) {
        debug('The mach',match[1]);
        var f = ramsesII(match[1]);
        if (f.length == 1) f = f[0];

        const myamp = {
            type,
            icons:f
        }
        const id = `REP${iteration}`;
        const gliph = match.input.replace(match[0],id);
        if (stop) return gliph;

        const result = ramsesII(gliph,iteration+1);

        let result_json = JSON.stringify(result);
        debug('Result Json',result_json);

        result_json = result_json.replace(`"${id}"`,JSON.stringify(myamp));
        //result_json = result_json.replace(`${id}`,JSON.stringify(myamp));
        debug('Replace Reference',result_json);
        debug('To array',JSON.parse(result_json));

        return JSON.parse(result_json);
    }
    return false;
}



//      expr ::= mulexpr { addop mulexpr }
//   1  addop ::= "+" | "-"
//      mulexpr ::= powexpr { mulop powexpr }
//   2  mulop ::= "*" | "/"
//   3  powexpr ::= "-" powexpr | "+" powexpr | atom [ "^" powexpr ]
//   4  atom ::= ident [ "(" expr ")" ] | numeric | "(" expr ")"
//   5  numeric ::= /[0-9]+(\.[0-9]*)?([eE][\+\-]?[0-9]+)?/
//   5  ident ::= /[A-Za-z_][A-Za-z_0-9]*/



const tokenizer = (string) => {
    const tokenizeRegex = /[A-Za-z_][A-Za-z_0-9]*|\S/gi;
    const tokens = string.matchAll(tokenizeRegex);
    let elements = [];
    for (const token of tokens) {
        elements.push(token[0]);
    }
    return elements;
}

const parseExpr = (tokens)=>{
    const symbol = parseSymbol(tokens);
    console.log('First',symbol);

    if (!symbol) return false;
    
    let elements = [];

    if (symbol.consumed != undefined) {
        elements = Array.isArray(symbol.result) ? symbol.result : [symbol.result];
    }
    else {
        elements.push(symbol.result);
    }

    for (var i=symbol.consumed; i<tokens.length; i++) {
        if (tokens[i] != '-') {
            console.log('next symbol is ',tokens[i],i);
            break;
        }
        
        console.log('Parse Symbol input',tokens.slice(i+1));
        let symb = parseSymbol(tokens.slice(i+1));
        console.log('Symbol Return',symb);
        if (!symb) return elements;        
        elements.push(symb.result);
        
        if (symb.consumed > 1) {
            i+=symb.consumed+1;
        }
        else {
            i+=1;
        }
        console.log(i,tokens);
        console.log('elements',elements,symb.result);
    }
    return elements;
}

const parseSymbol = (tokens)=>{
    
    const subgroup = parseSubGroup(tokens);
    if (subgroup) return subgroup;

    const nested = parseNested(tokens);
    if (nested) return nested;

    const vertical = parseVertical(tokens);
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

const parseNonvertical = (tokens) => {
    const symbol = nonVertical(tokens);
    if (!symbol) return false;

    let consumed = symbol.consumed;

    //const elements = [symbol.result];
    // for (var i=1; i<tokens.length; i=i+2) {
    //     if (tokens[i] != '-') break;
    //     consumed++;
    //     let symb = nonVertical(tokens.slice(i+1));
    //     if (!symb) break;
    //     consumed+=symb.consumed;
    //     elements.push(symb.result);
    // }
    // if (elements.length==1) return {consumed,result:elements[0]};
    // console.log('Parsesub',consumed,elements);
    //return {consumed,result:elements};
    return {consumed,result:symbol.result};
}

// vertical ::= expr { ":" expr}
export const parseVertical = (tokens) => {
    
    if (tokens.length < 3) return false;
    let consumed = 0;
    const expr = parseNonvertical(tokens);
    console.log('Parse sub vertical',expr);
    if (!expr) return false;

    const vertical = {
        type:':',
        icons:[
            expr.result
        ]
    }
    consumed+=expr.consumed;

    for (var i=1; i<tokens.length; i++) {
        if (tokens[i] != ':') break;
        consumed++;
        let expr = parseNonvertical(tokens.slice(i+1));
        if (!expr) {
            if (vertical.icons.length == 1) return {consumed,result:vertical.icons[0]};
            //return vertical;
        }
        consumed+=expr.consumed;
        vertical.icons.push(expr.result);
        
    }
    if (vertical.icons.length == 1) return {consumed,result:vertical.icons[0]};
    return {consumed,result:vertical};
}

export const parseNested = (tokens)=>{
    const icon = isIcon(tokens[0]);
    if (!icon) return false;

    if (tokens.length<3) return false;
    let consumed = 1;
    const nested = {
        type:'&',
        icons:[
            tokens[0]
        ]
    }

    for (var i=1; i< tokens.length; i+=2) {
        if (tokens[i] != '&') return false;
        consumed++;
        const nextIcon = isIcon(tokens[i+1]);
        if (!nextIcon) return false;
        consumed++;
        nested.icons.push(tokens[i+1]);
    }
    return {consumed,result:nested};
}

export const parseSubGroup = (tokens) => {
    if (tokens[0] != '(') return false;
    if (!isIcon(tokens[1])) return false;
    let consumed = 0;
    const subgroup = [tokens[1]];
    consumed++;
    for(var i = 2; i<tokens.length; i++) {
        if (tokens[i] != '-') break;
        consumed++;
        if (isIcon(tokens[i+1])) {
            subgroup.push(tokens[i+1]);
            i++;
            consumed++;
        }
    }
    if (tokens[i] != ')') return false;
    consumed++;
    return {consumed,result:subgroup};
}

export const isIcon = (token) => {
    const operatorRegex = /(-|:|\&)/gi;
    return !operatorRegex.test(token)
}
 
// expr ::= symbol {"-" symbol}
// nested ::= icon { "&" icon}
// vertical ::= novert { ":" novertt}
// horizontal ::= symbol {dash symbol}
// symbol ::= subgroup | nested | vertical | icon
// subgroup ::= "(" icon {"-" icon} ")"
// novert ::= nested | subgroup |icon
export const ramsesIII = (string,iteration=0) => {
    
    const operatorRegex = /(-|:)/gi;
    const tokens = tokenizer(string);

    const result = parseExpr(tokens);
    console.log('Final',result);
    return result;


    return;
    console.log(tokens);
    let elements = [];
    const operators = [];
    let currentstring = string;
    for (const token of tokens) {
        
        console.log(token);
        if (!operatorRegex.test(token[0])) {
            currentstring = currentstring.replace(token[0],'');
            console.log(currentstring);
            elements.push(token[0]);
            continue;
        }

        if(token[0] === '-') {
            currentstring = currentstring.replace(token[0],'');
            console.log(currentstring);
            return elements.concat(ramsesIII(currentstring,iteration+1));
        }

        if(token[0] === ':') {
            currentstring = currentstring.replace(token[0],'');
            console.log(currentstring);
            return elements.concat(ramsesIII(currentstring,iteration+1));
        }

    }


    return elements;

}


export const ramsesII = (string,iteration=0,stop=false) => {
    debug('Initial',string);
    const special = '(:|\\(|\\)|&|\-)';
    const element = '[^\:\(\)\-]+'
    const sub = `\\(${element}\\-${element}\\)`;
    const subOrElement = `((${sub})|(${element}))`;
    const vertical = `(?<first>${subOrElement}):(?<second>${subOrElement})`;
    const amp = `(?<first>${element})\&(?<second>${element})`;
    const vert2 = `(${element})(?:\:|$)`
    console.log(vert2);
    const cart = `<(?:S|H)?-([^>]*?)->`;

    const cartReg = new RegExp(cart,'gi');
    const ampReg = new RegExp(amp,'gi');
    const verticalReg = new RegExp(vert2,'gi');

    const specialReg = new RegExp(special,'ig');
    const match_special = specialReg.test(string);
    console.log('Has special',match_special);
    if (match_special !== true) {
        console.log('No Special return',string);
        if (iteration == 0) return [string];
        return string;
    }

    // const checkCart = nestedElementSingle(cartReg,string,'cartouche',iteration,stop);
    // if (checkCart !== false) return checkCart;

    // const checkamp = nestedElement(ampReg,string,'&',iteration,stop);
    // if (checkamp !== false) return checkamp;

    const checkvert = multipleElement(verticalReg,string,':',iteration,stop);
    if (checkvert !== false) {
        if (iteration == 0 && !Array.isArray(checkvert)) return [checkvert]
        return checkvert;
    }

    const match_simple = new RegExp(`(${element})`,'gi');
    const matches = string.matchAll(match_simple);
    const results = [];
    for(const match of matches) {
        debug(match);
        results.push(match[0])
    }   
    return results;
}



export default ramsesII;