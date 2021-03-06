import ramses,{isIcon, parseCartouche, parseNested, parseSubGroup,parseVertical, ramsesII,ramsesIII,parseExpr, parseSymbol} from '../src/ramses';

describe('RamsesIII',()=>{

    it('parses a nested group A&B',()=>{
        expect(parseNested(['A','&','B'])).toStrictEqual(
            {consumed:3,result:{type:'&',icons:['A','B']}}
        )
    })
    
    it('parses multiple nested group A&BC',()=>{
        expect(parseNested(['A','&','B','&','C'])).toStrictEqual(
            {consumed:5,result:{type:'&',icons:['A','B','C']}}
        )
    })

    it('checks for an icon',()=>{
        expect(isIcon('A')).toBe(true);
    });

    it('checks for an icon &',()=>{
        expect(isIcon('&')).toBe(false);
    });

    it('Recognizes a simple symbol',()=>{
        expect(ramsesIII('A')).toStrictEqual(
            ['A']
        )
    })

    it('Recognizes a nested group',()=>{
        expect(ramsesIII('A-B&C')).toStrictEqual(
            ['A',{type:'&',icons:['B','C']}]
        )
    })

    it('Recognizes a simple vertical',()=>{
        expect(ramsesIII('A:B')).toStrictEqual(
            [{type:':',icons:['A','B']}]
        )
    })

    it('Recognizes multiple simple verticals',()=>{
        expect(ramsesIII('A:B:C:D')).toStrictEqual(
            [{type:':',icons:['A','B','C','D']}]
        )
    })

    it ('does not fail on invalid :',()=>{
        expect(parseVertical(['A',':'])).toStrictEqual(false)
    })

    it ('does not fail on invalid :',()=>{
        expect(parseSymbol(['A',':'])).toStrictEqual(false)
    })
    
    it('Parse Nested returns right elements if it is no nested',()=>{
        expect(parseNested(['a','-','b'])).toStrictEqual(false)
    })

    it('Recognizes multiple verticals',()=>{
        expect(ramsesIII('(A-B):C:D')).toStrictEqual(
            [{type:':',icons:[['A','B'],'C','D']}]
        )
    })

    it('Recognizes incomplete syntaxis missing :',()=>{
        expect(ramsesIII('A:C:D:')).toStrictEqual(
            [{type:':',icons:['A','C','D']}]
        )
    })

    it('Recognizes incomplete syntaxis ::',()=>{
        expect(ramsesIII('::')).toStrictEqual([])
    })

    it('Ignores malformed expression',()=>{
        expect(parseExpr([':'])).toStrictEqual(false)
    })

    it('Recognizes incomplete syntaxis missing :',()=>{
        expect(ramsesIII('A:')).toStrictEqual([])
    })

    it('Recognizes incomplete syntaxis missing )',()=>{
        expect(ramsesIII('(A-B')).toStrictEqual(
            ['A','B']
        )
    })

    it('Recognizes multiple nested with subgroup t&w&(t-a)',()=>{
        expect(ramsesIII('t&w&(a-b)')).toStrictEqual(
            [{icons:['t','w',['a','b']],type:'&'}]
        )
    })

    it('Recognizes nested expression t&w&(t-n:N5)',()=>{
        expect(ramsesIII('t&w&(a-n:N5)')).toStrictEqual(
            [{icons:['t','w',['a',{icons:['n','N5'],type:':'}]],type:'&'}]
        )
    })

    it('Parses vertical allowing subgroups (A-B)&C',()=>{
        expect(parseNested(['(','A','-','B',')','&','C'])).toStrictEqual(
            {consumed:7,result:{icons:[['A','B'],'C'],type:'&'}}
        )
    })

    it('Recognizes a simple chain A-B-C-D',()=>{
        expect(ramsesIII('A-B-C-D')).toStrictEqual(
            ['A','B','C','D']
        )
    })

    it('Recognizes a chain with vertical A-B:C',()=>{
        expect(ramsesIII('A-B:C')).toStrictEqual(
            ['A',{type:':',icons:['B','C']}]
        )
    })

    it ('parse group identifies a simple group (t-p)',()=>{
        expect(parseSubGroup(['(','t','-','p',')'])).toStrictEqual(
            {consumed:5,result:[
            "t","p"
        ]})
    })

    it ('parse group identifies a tripe group (t-z-p)',()=>{
        expect(parseSubGroup(['(','t','-','z','-','p',')'])).toStrictEqual(
            {consumed:7,result:["t","z","p"]}
        )
    })

    it('parses a group (t-p)',()=>{
        expect(ramsesIII('(t-p)')).toStrictEqual([
            "t","p"
        ])
    })

    it('parses expressioon t-p&c',()=>{
        expect(parseExpr(['t','-','p','&','c'])).toStrictEqual([
                't',
                {type:'&',icons:['p','c']}
            ])
    })

    it('parses a group (t-p&c)',()=>{
        expect(parseSubGroup(['(','t','-','p','&','c',')'])).toStrictEqual({
            consumed:7,
            result:[
                't',
                {type:'&',icons:['p','c']}
            ]
        })
    })

    it('parses a group with vertial i-mn:n-Htp-A1',()=>{
        expect(ramsesIII('i-mn:n-Htp-A1')).toStrictEqual([
            "i",{type:':',icons:['mn','n']},'Htp','A1'
        ])
    })

    it('parses a group with vertial and subgroup A:(B-C)',()=>{
        expect(parseVertical('A:(B-C)')).toStrictEqual(
            {
                consumed:7,
                result:{
                    type:':',
                    icons:['A',['B','C']]}
        })
    })

   
    it('parses a group with vertial and subgroup ra-Htp:(t-p)-A1',()=>{
        expect(ramsesIII('ra-Htp:(t-p)-A1')).toStrictEqual([
            "ra",{type:':',icons:['Htp',['t','p']]},'A1'
        ])
    })

    it('parses a simple cartouche <-A-B->',()=>{
        expect(parseCartouche('<-A-B->')).toStrictEqual(
            {
                consumed:7,
                result:{
                    type:'cartouche',
                    icons:['A','B']}
        })
    })

    it('parses a cartouche with : <-A-B:C->',()=>{
        expect(parseCartouche('<-A-B:C->')).toStrictEqual(
            {
                consumed:9,
                result:{
                    type:'cartouche',
                    icons:['A',
                        {
                            type:':',
                            icons:['B','C']
                        }
                ]}
        })
    })

    it('parses a simple SEREKH <S-A-B>',()=>{
        expect(parseCartouche('<S-A-B->')).toStrictEqual(
            {
                consumed:8,
                result:{
                    type:'cartouche',
                    icons:['A','B']}
        })
    })

    it('parses a simple HWT <H-A-B>',()=>{
        expect(parseCartouche('<H-A-B->')).toStrictEqual(
            {
                consumed:8,
                result:{
                    type:'cartouche',
                    icons:['A','B']}
        })
    })


    it('parses t-G39&ra',()=>{
        expect(ramsesIII('t-G39&ra')).toStrictEqual([
            't',
            {type:'&',icons:['G39','ra']}
        ])
    })

    it('parses (t-G39&ra)',()=>{
        expect(ramsesIII('A-(t-G39&ra)')).toStrictEqual([
            'A',
            [
                't',
                {type:'&',icons:['G39','ra']}
            ]
        ])
    })

    it('parses ra-mn:(t-G39&ra)',()=>{
        expect(ramsesIII('ra-mn:(t-G39&ra)')).toStrictEqual([
                "ra",
                {
                    type:':',
                    icons:[
                        'mn',
                        [
                            't',
                            {
                                type:'&',
                                icons:[
                                    'G39',
                                    'ra'
                                ]
                            }
                        ]
                    ]
                }
            ])
    })
    it('parses mn:a:b:(n&ra):c:d',()=>{
        expect(ramsesIII('mn:a:b:(n&ra):c:d')).toStrictEqual([
                {
                    type:':',
                    icons:[
                        'mn',
                        'a',
                        'b',
                        [{
                            type:'&',
                            icons:[
                                'n',
                                'ra'
                            ]
                        }],
                        'c',
                        'd'
                    ]
                }
            ])
    })


    it('parses sA&ra-N1',()=>{
        expect(ramsesIII('sA&ra-N1')).toStrictEqual([
            {
                type:'&',
                icons:[
                    'sA',
                    'ra'
                ]
            },
            'N1'
        ])
    })

    it('parses incomplete s-',()=>{
        expect(ramsesIII('s-')).toStrictEqual([])
    })

    it('parses incomplete <',()=>{
        expect(ramsesIII('<')).toStrictEqual([])
    })

})
