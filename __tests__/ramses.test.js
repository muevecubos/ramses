import ramses,{isIcon, parseCartouche, parseNested, parseSubGroup,parseVertical, ramsesII,ramsesIII,parseExpr, parseSymbol, tokenizer, consumeIcon, parseHorizontal, parseHorizontalSep, parseHGroup, parseDashed} from '../src/ramses';

describe('RamsesIII',()=>{

    describe('Tokenizer tests',()=>{
        it('tokenizes a only numeric symbol',()=>{
            expect(tokenizer('17-A-B')).toStrictEqual(
                ['17','-','A','-','B']
            )
        })
    })

    describe('ParseAlternativeHorizontal',()=>{
        it ('parsing alternative horizontal',()=>{
            expect(parseHorizontalSep(['A','*','B'])).toStrictEqual(
                {
                    consumed:3,
                    result:{
                        icons:['A','B'],
                        type:'*'
                    }
                }
            )
        })   

        it ('parsing alternative horizontal',()=>{
            expect(parseHorizontalSep(['A','*','B','*','C'])).toStrictEqual(
                {
                    consumed:5,
                    result:{
                        icons:['A','B','C'],
                        type:'*'
                    }
                }
            )
        })  
        
        it('parses complex expresion W19',()=>{

            expect(parseHorizontalSep(['(','Q3',':','X1',')','*','V28'])).toStrictEqual(
                {
                    consumed:7,
                    result:{
                        icons:[
                            {icons:['Q3','X1'],type:':'},
                            'V28'
                        ],
                        type:'*'
                    }
                }
            )
            
        })
    })

    describe('ParseHorizontal',()=>{

        it ('parses simple horizontal A-B',()=>{
            expect(parseHorizontal(['A','-','B'])).toStrictEqual(
                {
                    consumed:3,
                    icons:['A','B']
                }
            )
        });

        it ('parses multiple horizontal A-B-C-D',()=>{
            expect(parseHorizontal(['A','-','B','-','C','-','D'])).toStrictEqual(
                {
                    consumed:7,
                    icons:['A','B','C','D']
                }
            )
        })

    })

    it ('parses A-(B-C):D-E',()=>{
        expect(ramsesIII('A-(B-C):D-E')).toStrictEqual([
            'A',{icons:[['B','C'],'D'],type:':'},'E'
        ])
    })

    it('parses incomplete s-',()=>{
        expect(ramsesIII('s-')).toStrictEqual([])
    })

    it('parses incomplete <',()=>{
        expect(ramsesIII('<')).toStrictEqual([])
    })

    describe('Parse Nested',()=>{

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

        it('Parse Nested returns right elements if it is no nested',()=>{
            expect(parseNested(['a','-','b'])).toStrictEqual(false)
        })

        it('Parses vertical allowing subgroups (A-B)&C',()=>{
            expect(parseNested(['(','A','-','B',')','&','C'])).toStrictEqual(
                {consumed:7,result:{icons:[['A','B'],'C'],type:'&'}}
            )
        })

        it('parses A&B-C',()=>{
            expect(parseNested(['A','&','B','-','C'])).toStrictEqual({
                consumed:3,
                result:{
                    type:'&',
                    icons:[
                        'A',
                        'B'
                    ]
                }
            })
        })

        it('parses a nested group A&&&B',()=>{
            expect(parseNested(['A','&&&','B'])).toStrictEqual(
                {consumed:3,result:{type:'&&&',icons:['A','B']}}
            )
        })
        
        it('parses a nested group A&&&(B:C)',()=>{
            expect(parseNested(['A','&&&','(','B',':','C',')'])).toStrictEqual(
                {consumed:7,result:{type:'&&&',icons:['A',{icons:['B','C'],type:':'}]}}
            )
        })
        
        it('parses a nested group A&&&(B&C)',()=>{
            expect(parseNested(['A','&&&','(','B','&','C',')'])).toStrictEqual(
                {consumed:7,result:{type:'&&&',icons:['A',{icons:['B','C'],type:'&'}]}}
            )
        })
    
    })


    it('parses a nested group A&&&(B&C)',()=>{
        expect(ramsesIII('A&&&(B&C)')).toStrictEqual([
            {type:'&&&',icons:['A',{icons:['B','C'],type:'&'}]}
        ])
    })


    describe('IsIcon',()=>{

        it('checks for an icon',()=>{
            expect(isIcon('A')).toBe(true);
        });
    
        it('checks for an icon &',()=>{
            expect(isIcon('&')).toBe(false);
        });
    })

    describe('IsVertical',()=>{
        it ('does not fail on invalid :',()=>{
            expect(parseVertical(['A',':'])).toStrictEqual(false)
        })
    })

    describe('ParseSubGroup',()=>{
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

        it('parses a group (t-p&c)',()=>{
            expect(parseSubGroup(['(','t','-','p','&','c',')'])).toStrictEqual({
                consumed:7,
                result:[
                    't',
                    {type:'&',icons:['p','c']}
                ]
            })
        })

        it ('inverted group (t-p)\\',()=>{
            expect(parseSubGroup(['(','t','-','p',')','\\'])).toStrictEqual(
                {
                    consumed:6,
                    result:{
                        inverted:true,
                        icons:[
                            "t","p"
                        ],
                        type:'h'
                    }
                })
        })
    })

    describe('ConsumeSymbol',()=>{
        it ('Returns a simple inverted',()=>{
            expect (consumeIcon(['A','\\'])).toStrictEqual(
                {consumed:2,result:{icon:'A',inverted:true}}
            )
        })

        it ('Returns a simple inverted followed by more things',()=>{
            expect (consumeIcon(['A','\\','-','B'])).toStrictEqual(
                {consumed:2,result:{icon:'A',inverted:true}}
            )
        })
    })


    it('Recognizes a simple symbol',()=>{
        expect(ramsesIII('A')).toStrictEqual(
            ['A']
        )
    })

    it('Recognizes a simple symbol',()=>{
        expect(ramsesIII('A')).toStrictEqual(
            ['A']
        )
    })

    it('Horizontal -',()=>{
        expect(ramsesIII('A-B-C')).toStrictEqual(
            ['A','B','C']
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

    it('Recognizes a alternative vertical',()=>{
        expect(ramsesIII('A;B')).toStrictEqual(
            [{type:';',icons:['A','B']}]
        )
    })

    it('Recognizes multiple simple verticals',()=>{
        expect(ramsesIII('A:B:C:D')).toStrictEqual(
            [{type:':',icons:['A','B','C','D']}]
        )
    })

    it('Recognizes multiple simple alternative verticals',()=>{
        expect(ramsesIII('A;B;C;D')).toStrictEqual(
            [{type:';',icons:['A','B','C','D']}]
        )
    })

    it ('does not fail on invalid :',()=>{
        expect(parseSymbol(['A',':'])).toStrictEqual(false)
    })
    
    it('Recognizes multiple verticals',()=>{
        expect(ramsesIII('(A-B):C:D')).toStrictEqual(
            [{type:':',icons:[['A','B'],'C','D']}]
        )
    })

    describe('Incomplete Syntaxis',()=>{

        it('Recognizes incomplete syntaxis missing :',()=>{
            expect(ramsesIII('A:C:D:')).toStrictEqual(
                []
            )
        })
    
        it('Recognizes incomplete syntaxis ::',()=>{
            expect(ramsesIII('::')).toStrictEqual([])
        })
    
        it('Ignores malformed expression',()=>{
            expect(parseExpr([':'])).toStrictEqual(false)
        })
    
        it('Recognizes incomplete syntaxis missing : with one symbol',()=>{
            expect(ramsesIII('A:')).toStrictEqual([])
        })
    
        it('Recognizes incomplete syntaxis missing )',()=>{
            expect(ramsesIII('(A-B')).toStrictEqual(
                ['A','B']
            )
        })
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
                    type:'serekh',
                    icons:['A','B']}
        })
    })

    it('parses a simple HWT <H-A-B>',()=>{
        expect(parseCartouche('<H-A-B->')).toStrictEqual(
            {
                consumed:8,
                result:{
                    type:'hwt',
                    icons:['A','B']}
        })
    })


    describe('Ramses multiple real symbols tests',()=>{
        it('parses A-B*C',()=>{
            expect(ramsesIII('A-B*C')).toStrictEqual([
                'A',
                {type:'*',icons:['B','C']}
            ])
        })
       
       
        it('parses M17-Y5D:N35:N5*Z1',()=>{
            expect(ramsesIII('M17-Y5D:N35:N5*Z1')).toStrictEqual([
                'M17',
                {type:':',icons:['Y5D','N35',{type:'*',icons:['N5','Z1']}]}
            ])
        })
        
        
        it('parses A*B*C&D',()=>{
            expect(ramsesIII('A*B*C&D')).toStrictEqual([
                {
                    type:"*",
                    icons:['A', 'B', { type:"&", icons:['C', 'D'] }]
                }
            ])
        })

        it('parses A&B*C',()=>{
            
            expect(ramsesIII('A&B*C')).toStrictEqual([
                {
                    type:'*',
                    icons:[
                        {type:'&',icons:['A','B']},
                        'C',
                    ]
                }
            ])
        })

        it('parses A-B*C*D',()=>{
            expect(ramsesIII('A-B*C*D')).toStrictEqual([
                'A',
                {type:'*',icons:['B','C','D']}
            ])
        })

        it('parses A-B*C-D',()=>{
            expect(ramsesIII('A-B*C-D')).toStrictEqual([
                'A',
                {type:'*',icons:['B','C']},
                'D'
            ])
        })

        it('parses B*C:D',()=>{
            expect(ramsesIII('B*C:D')).toStrictEqual([{
                type:":",
                icons: [
                    {type:'*',icons:['B','C']},
                    'D'
                ]
            }      
        ])});


        it('parses A:B&C',()=>{
            expect(ramsesIII('A:B&C')).toStrictEqual([{
                type:":",
                icons:['A', { type:"&", icons:['B', 'C'] }],
                }     
        ])});
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
                        {
                            type:'&',
                            icons:[
                                'n',
                                'ra'
                            ]
                        },
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

    

    it('parses a vertical with subgroup E:(E-F&G)',()=>{
        const result = ramsesIII('E:(E-F&G)');
        expect (result).toStrictEqual([
            {
                type:":",
                icons:[
                    'E',
                    [
                        'E',
                        {
                            type:'&',
                            icons:[
                                'F','G'
                            ]
                        }
                    ]
                ]
            }
        ])
    })

    it('parses a vertical with subgroup A-<-B-C&D-E:(E-F&G)->-E:(E-F&G)',()=>{
        const result = ramsesIII('A-<-B-C&D-E:(E-F&G)->-E:(E-F&G)');
        expect (result).toStrictEqual([
            'A',
            {
                type:'cartouche',
                icons:[
                    'B',
                    {
                        type:'&',
                        icons:['C','D']
                    },
                    {
                        type:":",
                        icons:[
                            'E',
                            [
                                'E',
                                {
                                    type:'&',
                                    icons:[
                                        'F','G'
                                    ]
                                }
                            ]
                        ]
                    }
                ]
            },
            {
                type:":",
                icons:[
                    "E",
                    [
                        'E',
                        {
                            type:'&',
                            icons:['F','G']
                        }
                    ]
                ]
            }
        ])
    })

    it('parses a vertical with subgroup A-<-B-C&D-E:(E-F&G)->-E:E-F&G',()=>{
        const result = ramsesIII('A-<-B-C&D-E:(E-F&G)->-E:E-F&G');
        expect (result).toStrictEqual([
            'A',
            {
                type:'cartouche',
                icons:[
                    'B',
                    {
                        type:'&',
                        icons:['C','D']
                    },
                    {
                        type:":",
                        icons:[
                            'E',
                            [
                                'E',
                                {
                                    type:'&',
                                    icons:['F','G']
                                }
                            ]
                        ]
                    },
                    
                    
                ]
            },
            {
                type:":",
                icons:[
                    "E",
                    'E',    
                ]
            },
            {
                type:'&',
                icons:['F','G']
            }
        ])
    })


    


    it('subgroup can be a expr A-(B:(C-D))',()=>{
        const result = ramsesIII('A-(B:(C-D))');
        expect (result).toStrictEqual([
            'A',
            {
                type:':',
                icons:[
                    'B',
                    [
                        'C','D'
                    ]
                ]
            },

        ])
    })


    it ('Identifies subgrup correctly A:(B:C)',()=>{
        const result = ramsesIII('A:(B:C)');
        expect (result).toStrictEqual([{
            type:':',
            icons:[
                'A',
                {
                    type:":",
                    icons:[
                        'B','C'
                    ]
                }
            ]    
         }])
    })
    
    it ('Identifies subgrup correctly (A:B):C',()=>{
        const result = ramsesIII('(A:B):C');
        expect (result).toStrictEqual([{
            type:':',
            icons:[
                {
                    type:":",
                    icons:[
                        'A','B'
                    ]
                },
                'C'
            ]    
         }])
    })

    it ('Identifies subgrup correctly (A&B):C',()=>{
        const result = ramsesIII('(A&B):C');
        expect (result).toStrictEqual([{
            type:':',
            icons:[
                {
                    type:"&",
                    icons:[
                        'A','B'
                    ]
                },
                'C'
            ]    
         }])
    })
    
    it ('Identifies subgrup correctly A:(B-C:D)',()=>{
        const result = ramsesIII('A:(B-C:D)');
        expect (result).toStrictEqual([{
            type:':',
            icons:[
                'A',
                [
                    'B',
                    {
                        type:":",
                        icons:[
                            'C','D'
                        ]
                    },
                ] 
            ]    
         }])
    })
    
    it ('Identifies subgrup correctly A:(B-(C:D))',()=>{
        const result = ramsesIII('A:(B-(C:D))');
        expect (result).toStrictEqual([{
            type:':',
            icons:[
                'A',
                [
                    'B',
                    {
                        type:":",
                        icons:[
                            'C','D'
                        ]
                    },
                ] 
            ]    
         }])
    })
    
    it ('Identifies subgrup correctly ((A:B)-C):D',()=>{
        const result = ramsesIII('((A:B)-C):D');
        //console.log(JSON.stringify(result));
        expect (result).toStrictEqual([
            {
                type:':',
                icons:[
                    [
                        {
                            type:':',
                            icons:['A','B']
                        },
                        'C'
                    ],
                    'D'
                ]
            }
        ])
    })

    it ('Nested group with &&& A&&&B',()=>{
        const result = ramsesIII('A&&&B');
        expect (result).toStrictEqual([
            {
                type:'&&&',
                icons:[
                    'A',
                    'B'
                ]
            }
        ])
    })

    describe('Inverted parsing',()=>{

        it ('Expression with inverted',()=>{
            const result = ramsesIII('A-B-(C-D)\\');
            expect (result).toStrictEqual([
                'A','B',{
                    type:'h',
                    inverted:true,
                    icons:[
                        'C','D'
                    ]
                }
            ])
        })
        
        it ('Expression with inverted A\\-B',()=>{
            const result = ramsesIII('A\\-B');
            expect (result).toStrictEqual([
                {
                    inverted:true,
                    icon:'A'
                },
                'B'
            ])
        })
    
        it ('Expression with inverted (A-B)\\-C',()=>{
            const result = ramsesIII('(A-B)\\-C');
            expect (result).toStrictEqual([
                {
                    type:'h',
                    inverted:true,
                    icons:['A','B']
                },
                'C'
            ])
        })
    
        it ('Expression with inverted (A:B)\\-C',()=>{
            const result = ramsesIII('(A:B)\\-C');
            expect (result).toStrictEqual([
                {
                    type:':',
                    inverted:true,
                    icons:['A','B']
                },
                'C'
            ])
        })

        it ('Expression with inverted A\ ',()=>{
            const result = ramsesIII("A\\");
            expect (result).toStrictEqual([
                {    
                    inverted:true,
                    icon:"A"
                },
                
            ])
        })
    })
    
    
    it ('Parses * groups correctly W18-(Q3:X1)*V28-A1',()=>{
        const result = ramsesIII('W19-(Q3:X1)*V28-A1');
        expect (result).toStrictEqual([
            "W19",
            {
                "type": "*",
                "icons": [
                    {
                        "type": ":",
                        "icons": [
                            "Q3",
                            "X1"
                        ]
                    },
                    "V28"
                ]
            },
            "A1"
        ])
    })
   
    it ('Parses complex expression V30:U2 - Aa11:X1 - (S29-F35):D21 - G43',()=>{
        const result = ramsesIII('V30:U2-Aa11:X1-(S29-F35):D21-G43');
        expect (result).toStrictEqual([
            {
                type:':',
                icons:['V30','U2']
            },
            {
                type:':',
                icons:['Aa11','X1']
            },
            {
                type:':',
                icons:[
                    ['S29','F35'],
                    'D21'
                ]
            },
            'G43'
        ])
    })

    it ('Parses Bug 10 A:B-C*D:F:G',()=>{
        const result = ramsesIII('A:B-C*D:F:G');
        expect (result).toStrictEqual([
            {
              "type":":",
              "icons":[
                "A",
                "B"
              ]
            }, {
              "type":":",
              "icons":[
                {
                  "type":"*",
                  "icons":[
                    "C",
                    "D"
                  ]
                },
                "F",
                "G"
              ]
            }
          ])
    })
    
    it ('Parses Bug 11 A-B*C:D:E-F:G-H:I:J-K-L:M*N-O-P',()=>{
        const result = ramsesIII('A-B*C:D:E-F:G-H:I:J-K-L:M*N-O-P');
        expect (result).toStrictEqual([
            "A",
            {
              "type":":",
              "icons":[
                {
                  "type":"*",
                  "icons":[
                    "B",
                    "C"
                  ]
                },
                "D",
                "E"
              ]
            }, {
              "type":":",
              "icons":[
                "F",
                "G"
              ]
            }, {
              "type":":",
              "icons":[
                "H",
                "I",
                "J"
              ]
            },
            "K",
            {
              "type":":",
              "icons":[
                "L",
                {
                  "type":"*",
                  "icons":[
                    "M",
                    "N"
                  ]
                },
              ]
            },
            "O",
            "P"
          ])
    })

    describe('Parse Dashing',()=>{
        it ('parses dashed icon #1',()=>{
            expect(parseDashed("#1")).toStrictEqual({
                consumed:1,
                dashed:"1"
            });
        })

        it ('parses dashed icon #1234',()=>{
            expect(parseDashed("#1234")).toStrictEqual({
                consumed:1,
                dashed:"1234"
            });
        })

        it ('parses dashed icon #34',()=>{
            expect(parseDashed("#34")).toStrictEqual({
                consumed:1,
                dashed:"34"
            });
        })

        it ('skips dashed icon #32',()=>{
            expect(parseDashed("#32")).toStrictEqual(false);
        })

        it ('parses dashed icon #4',()=>{
            expect(parseDashed("#4")).toStrictEqual({
                consumed:1,
                dashed:"4"
            });
        })

        it ('parses dashed icon #14',()=>{
            expect(parseDashed("#14")).toStrictEqual({
                consumed:1,
                dashed:"14"
            });
        })

        it('checks symbol A#1',()=>{
            expect(parseHorizontal(["A","#1"])).toStrictEqual({
                consumed:2,
                icons:[{
                    icons:'A',
                    dashed:'1'
                }]
            });
        })

        it('checks multiple A#1-B#23',()=>{
            expect(ramsesIII("A#1-B#23")).toStrictEqual(
                [{
                    icons:'A',
                    dashed:'1'
                },
                {icons:'B',dashed:'23'}]
            );
        })

        it('construct with : can be dashed',()=>{
            expect(ramsesIII("C-A:B#1")).toStrictEqual(
                ["C",
                {icons:['A',{icons:"B",dashed:'1'}],type:':'}]
            );
        })
    });
})

/**
 * @deprecated
 * 
 */
// it('parses complex with * A-<-B*C&D*E:E*F&G->-E:E*F&G',()=>{
//     const result = ramsesIII('A-<-B*C&D*E:E*F&G->-E:E*F&G');
//     expect (result).toStrictEqual([
//         'A',
//         {
//             type:'cartouche',
//             icons:[
//                 'B',
//                 {
//                     type:'&',
//                     icons:['C','D']
//                 },
//                 {
//                     type:":",
//                     icons:[
//                         'E',
//                         'E',
//                     ]
//                 },
//                 {
//                     type:'&',
//                     icons:['F','G']
//                 }
//             ]
//         },
//         {
//             type:":",
//             icons:[
//                 "E",
//                 'E',    
//             ]
//         },
//         {
//             type:'&',
//             icons:['F','G']
//         }
//     ])
// })
