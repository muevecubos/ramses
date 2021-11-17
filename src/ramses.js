
const debug = (a,b,c,d) => {
    return
    console.log(a,b,c,d)
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

export const ramsesII = (string,iteration=0,stop=false) => {
    debug('Initial',string);
    const element = '[^\:\(\)\-]+'
    const sub = `\\(${element}\\-${element}\\)`;
    const subOrElement = `((${sub})|(${element}))`;
    const vertical = `(?<first>${subOrElement}):(?<second>${subOrElement})`;
    const amp = `(?<first>${element})\&(?<second>${element})`;
    const cart = `<(?:S|H)?-([^>]*?)->`;

    const cartReg = new RegExp(cart,'gi');
    const ampReg = new RegExp(amp,'gi');
    const verticalReg = new RegExp(vertical,'gi');

    const checkCart = nestedElementSingle(cartReg,string,'cartouche',iteration,stop);
    if (checkCart !== false) return checkCart;

    const checkamp = nestedElement(ampReg,string,'&',iteration,stop);
    if (checkamp !== false) return checkamp;

    const checkvert = nestedElement(verticalReg,string,':',iteration,stop);
    if (checkvert !== false) return checkvert;

    const match_simple = new RegExp(`(${element})`,'gi');

    const matches = string.matchAll(match_simple);
    const results = [];
    for(const match of matches) {
        debug(match);
        results.push(match[0])
    }   
    return results;
}


const ramses = (string,iteration=0) => {
    console.log('Ramses Start:',string);
    const element = '[^\:\(\)\-]+'
    const sub = `\\(${element}\\-${element}\\)`;
    const subOrElement = `((${sub})|(${element}))`;
    const vertical = `(?<first>${subOrElement}):(?<second>${subOrElement})`

    //Check for a vertical first
    const verticalReg = new RegExp(vertical,'gi');
    const verticalMatches = string.matchAll(verticalReg);
    for (const verticalMatch of verticalMatches) {
        console.log(verticalMatch);
        const myvert = {
            type:':',
            icons:[
                verticalMatch.groups.first,
                verticalMatch.groups.second
            ]
        }

        const myvert_string = JSON.stringify(myvert);

        console.log('Vertical to string',myvert,myvert_string);

        const id = `REP${iteration}`;
        const new_gliph = verticalMatch.input.replace(verticalMatch[0],id);
        console.log('NewGliph',new_gliph);

        const result = ramses(new_gliph,iteration+1);

        let result_json = JSON.stringify(result);

        console.log('Result Json',result_json);

        result_json = result_json.replace(`"${id}"`,JSON.stringify(myvert));
        result_json = result_json.replace(`${id}`,JSON.stringify(myvert));
        

        console.log('Replace Reference',result_json);

        console.log('To array',JSON.parse(result_json));

        return JSON.parse(result_json);
        // const result = ramses(verticalMatch.input.replace(verticalMatch[0],'REPLACEMENT'+iteration),iteration+1);
        // let myverjson = JSON.stringify(myvert);
        // console.log(myverjson);
        // console.log('STringi',JSON.stringify(result));
        // console.log('ripli',JSON.stringify(result).replace('REPLACEMENT'+iteration,myverjson));

        return JSON.parse(JSON.stringify(result).replace('REPLACEMENT'+iteration,myverjson));
    }

    const match_simple = new RegExp(`((?<vertical>${vertical})|(?<single>(${element})))`,'gi');

    const matches = string.matchAll(match_simple);
    const results = [];
    for(const match of matches) {
        console.log(match);
        // if (match.groups.vertical) {

        //     var f = ramses(match.groups.first);
        //     var s = ramses(match.groups.second);
        //     if (f.length == 1) f = f[0];
        //     if (s.length == 1) s = s[0];

        //     results.push({
        //         type:':',
        //         icons:[
        //             f,
        //             s
        //         ]
        //     })
        // }
        // else {
            results.push(match[0])
        //}

    }   
    return results;;

}

export default ramses;