import ramses,{isIcon, parseNested, parseSubGroup,parseVertical, ramsesII,ramsesIII} from '../src/ramses';

describe('RamsesIII',()=>{

    // it('parses a nested group A&B',()=>{
    //     expect(parseNested(['A','&','B'])).toStrictEqual(
    //         {consumed:3,result:{type:'&',icons:['A','B']}}
    //     )
    // })

    // it('checks for an icon',()=>{
    //     expect(isIcon('A')).toBe(true);
    // });

    // it('checks for an icon &',()=>{
    //     expect(isIcon('&')).toBe(false);
    // });

    // it('Recognizes a simple symbol',()=>{
    //     expect(ramsesIII('A')).toStrictEqual(
    //         ['A']
    //     )
    // })

    // it('Recognizes a nested group',()=>{
    //     expect(ramsesIII('A-B&C')).toStrictEqual(
    //         ['A',{type:'&',icons:['B','C']}]
    //     )
    // })

    // it('Recognizes a simple vertical',()=>{
    //     expect(ramsesIII('A:B')).toStrictEqual(
    //         [{type:':',icons:['A','B']}]
    //     )
    // })

    // it('Recognizes a simple chain A-B-C-D',()=>{
    //     expect(ramsesIII('A-B-C-D')).toStrictEqual(
    //         ['A','B','C','D']
    //     )
    // })

    // it('Recognizes a chain with vertical A-B:C',()=>{
    //     expect(ramsesIII('A-B:C')).toStrictEqual(
    //         ['A',{type:':',icons:['B','C']}]
    //     )
    // })

    // it ('parse group identifies a simple group (t-p)',()=>{
    //     expect(parseSubGroup(['(','t','-','p',')'])).toStrictEqual(
    //         {consumed:4,result:[
    //         "t","p"
    //     ]})
    // })

    // it ('parse group identifies a tripe group (t-z-p)',()=>{
    //     expect(parseSubGroup(['(','t','-','z','-','p',')'])).toStrictEqual(
    //         {consumed:6,result:["t","z","p"]}
    //     )
    // })

    // it('parses a group (t-p)',()=>{
    //     expect(ramsesIII('(t-p)')).toStrictEqual([
    //         "t","p"
    //     ])
    // })

    it('parses a group with vertial i-mn:n-Htp-A1',()=>{
        expect(ramsesIII('i-mn:n-Htp-A1')).toStrictEqual([
            "i",{type:':',icons:['mn','n']},'Htp','A1'
        ])
    })

    // it('parses a group with vertial and subgroup A:(B-C)',()=>{
    //     expect(parseVertical('A:(B-C)')).toStrictEqual(
    //         {
    //             consumed:6,
    //             result:{
    //                 type:':',
    //                 icons:['A',['B','C']]}
    //     })
    // })

   
    // it('parses a group with vertial and subgroup ra-Htp:(t-p)-A1',()=>{
    //     expect(ramsesIII('ra-Htp:(t-p)-A1')).toStrictEqual([
    //         "ra",{type:':',icons:['Htp',['t','p']]},'A1'
    //     ])
    // })

})


describe('Parsing glyphs',()=>{



    // it('Parses a single element with no special characters',()=>{
    //     expect(ramsesII('a')).toStrictEqual([
    //         'a'
    //     ])
    // })

    // it('Works with multiple vertical separators a:b:c:d',()=>{
    //     expect(ramsesII('a:b:c:d')).toStrictEqual(
    //         [
    //             {
    //                 type:':',
    //                 icons:[
    //                     'a','b','c','d'
    //                 ]
    //             }
    //         ]
    //     )
    // })

    // it('detects simple groups: ra-ms-s-s-A1',()=>{

    //     expect(ramsesII('ra-ms-s-s-A1')).toStrictEqual([
    //         'ra',
    //         'ms',
    //         's',
    //         's',
    //         'A1'
    //     ]);
    // })

    // it('parses vertical mn:n',()=>{
    //     expect(ramsesII('mn:n')).toStrictEqual([{
    //         type:':',
    //         icons:[
    //             "mn",
    //             "n"
    //         ]
    //      }])
    // })

    // it('parses a group (t-p)',()=>{
    //     expect(ramsesII('(t-p)')).toStrictEqual([
    //         "t","p"
    //     ])
    // })



    // it('detects subgrups: ra-Htp:(t-p)-A1',()=>{
    //     expect(ramsesII('ra-Htp:(t-p)-A1')).toStrictEqual([
    //         'ra',
    //         {
    //             type:":",
    //             icons:[
    //                 "Htp",
    //                 [
    //                     "t",
    //                     "p"
    //                 ],
    //             ]
    //         },
    //         'A1'
    //     ]);
    // })
 
    // it('detects another additional group: ra-Htp:(t-p:n)',()=>{
    //     expect(ramsesII('ra-Htp:(t-p:n)',0,true)).toStrictEqual(
    //         "ra-Htp:(t-REP0)"
    //     );

    //     expect(ramsesII('ra-Htp:(t-REP0)',1,true)).toStrictEqual(
    //         "ra-REP1"
    //     );

    //     expect(ramsesII('ra-REP1',1,true)).toStrictEqual(
    //         ["ra","REP1"]
    //     );

    //     expect(ramsesII('ra-Htp:(t-REP0)')).toStrictEqual(
    //         ["ra",
    //         {type:":",
    //         icons:[
    //             'Htp',
    //             [
    //                 't',
    //                 'REP0'
    //             ]
    //         ]}]
    //     );

    //     expect(ramsesII('ra-Htp:(t-p:n)',0)).toStrictEqual([
    //         'ra',
    //         {
    //             type:":",
    //             icons:[
    //                 "Htp",
    //                 [
    //                     "t",
    //                     {
    //                         type:":",
    //                         icons:[
    //                             "p",
    //                             "n"
    //                         ]
    //                     }
    //                 ],
    //             ]
    //         },
    //     ]);
        
    // })

    // it('detect the & ra-mn:(t-G39&ra)',()=>{

    //     expect(ramsesII('(t-REP0)')).toStrictEqual(
    //         ['t','REP0']
    //     )

    //     expect(ramsesII('t-G39&ra',0,true)).toStrictEqual(
    //         "t-REP0"
    //     );

    //     expect(ramsesII('ra-mn:(t-G39&ra)',0)).toStrictEqual([
    //         'ra',
    //         {
    //             type:":",
    //             icons:[
    //                 "mn",
    //                 [
    //                     "t",
    //                     {
    //                         type:"&",
    //                         icons:[
    //                             "G39",
    //                             "ra"
    //                         ]
    //                     }
    //                 ],
    //             ]
    //         },
    //     ]);
    // })

    // it('detects the nested if appeares more than one time ra-mn:(t-G39&ra)-pa-jj:(l-G34&rap)',()=>{

    //     expect(ramsesII('ra-mn:(t-G39&ra)-pa-jj:(l-G34&rap)',0)).toStrictEqual([
    //         'ra',
    //         {
    //             type:":",
    //             icons:[
    //                 "mn",
    //                 [
    //                     "t",
    //                     {
    //                         type:"&",
    //                         icons:[
    //                             "G39",
    //                             "ra"
    //                         ]
    //                     }
    //                 ],
    //             ]
    //         },
    //         'pa',
    //         {
    //             type:":",
    //             icons:[
    //                 "jj",
    //                 [
    //                     "l",
    //                     {
    //                         type:"&",
    //                         icons:[
    //                             "G34",
    //                             "rap"
    //                         ]
    //                     }
    //                 ],
    //             ]
    //         },
    //     ]);
    // })

    // it('detects the cartouche A-<H-B-C:(D-E)->',()=>{

    //     expect(ramsesII('A-<H-B-C:(D-E)->')).toStrictEqual([
    //         'A',
    //         {
    //             type:"cartouche",
    //             icons:[
    //                 "B",
    //                 {
    //                     type:":",
    //                     icons:[
    //                         "C",
    //                         [
    //                             "D",
    //                             "E"
    //                         ]
    //                     ]
    //                 }   
    //             ]
    //         },
    //     ]);

    //     expect(ramsesII('A-<S-B-C:(D-E)->')).toStrictEqual([
    //         'A',
    //         {
    //             type:"cartouche",
    //             icons:[
    //                 "B",
    //                 {
    //                     type:":",
    //                     icons:[
    //                         "C",
    //                         [
    //                             "D",
    //                             "E"
    //                         ]
    //                     ]
    //                 }   
    //             ]
    //         },
    //     ]);

    //     expect(ramsesII('A-<-B-C:(D-E)->')).toStrictEqual([
    //         'A',
    //         {
    //             type:"cartouche",
    //             icons:[
    //                 "B",
    //                 {
    //                     type:":",
    //                     icons:[
    //                         "C",
    //                         [
    //                             "D",
    //                             "E"
    //                         ]
    //                     ]
    //                 }   
    //             ]
    //         },
    //     ]);
    // })
});