import ramses,{ramsesII} from '../src/ramses';

describe('Parsing glyphs',()=>{

    it('detects simple groups: ra-ms-s-s-A1',()=>{

        expect(ramsesII('ra-ms-s-s-A1')).toStrictEqual([
            'ra',
            'ms',
            's',
            's',
            'A1'
        ]);
    })

    it('parses vertical mn:n',()=>{
        expect(ramsesII('mn:n')).toStrictEqual([{
            type:':',
            icons:[
                "mn",
                "n"
            ]
         }])
    })
    it('parses a group (t-p)',()=>{
        expect(ramsesII('(t-p)')).toStrictEqual([
            "t","p"
        ])
    })

    it('detects vertical groups: i-mn:n-Htp-A1',()=>{
        expect(ramsesII('i-mn:n-Htp-A1')).toStrictEqual([
            'i',
            {
                type:":",
                icons:[
                    "mn",
                    "n",
                ]
            },
            'Htp',
            'A1'
        ]);
    })

    it('detects subgrups: ra-Htp:(t-p)-A1',()=>{
        expect(ramsesII('ra-Htp:(t-p)-A1')).toStrictEqual([
            'ra',
            {
                type:":",
                icons:[
                    "Htp",
                    [
                        "t",
                        "p"
                    ],
                ]
            },
            'A1'
        ]);
    })
 
    it('detects another additional group: ra-Htp:(t-p:n)',()=>{
        expect(ramsesII('ra-Htp:(t-p:n)',0,true)).toStrictEqual(
            "ra-Htp:(t-REP0)"
        );

        expect(ramsesII('ra-Htp:(t-REP0)',1,true)).toStrictEqual(
            "ra-REP1"
        );

        expect(ramsesII('ra-REP1',1,true)).toStrictEqual(
            ["ra","REP1"]
        );

        expect(ramsesII('ra-Htp:(t-REP0)')).toStrictEqual(
            ["ra",
            {type:":",
            icons:[
                'Htp',
                [
                    't',
                    'REP0'
                ]
            ]}]
        );

        expect(ramsesII('ra-Htp:(t-p:n)',0)).toStrictEqual([
            'ra',
            {
                type:":",
                icons:[
                    "Htp",
                    [
                        "t",
                        {
                            type:":",
                            icons:[
                                "p",
                                "n"
                            ]
                        }
                    ],
                ]
            },
        ]);
        
    })

    it('detect the & ra-mn:(t-G39&ra)',()=>{

        expect(ramsesII('(t-REP0)')).toStrictEqual(
            ['t','REP0']
        )

        expect(ramsesII('t-G39&ra',0,true)).toStrictEqual(
            "t-REP0"
        );

        expect(ramsesII('ra-mn:(t-G39&ra)',0)).toStrictEqual([
            'ra',
            {
                type:":",
                icons:[
                    "mn",
                    [
                        "t",
                        {
                            type:"&",
                            icons:[
                                "G39",
                                "ra"
                            ]
                        }
                    ],
                ]
            },
        ]);
    })

    it('detects the nested if appeares more than one time ra-mn:(t-G39&ra)-pa-jj:(l-G34&rap)',()=>{

        expect(ramsesII('ra-mn:(t-G39&ra)-pa-jj:(l-G34&rap)',0)).toStrictEqual([
            'ra',
            {
                type:":",
                icons:[
                    "mn",
                    [
                        "t",
                        {
                            type:"&",
                            icons:[
                                "G39",
                                "ra"
                            ]
                        }
                    ],
                ]
            },
            'pa',
            {
                type:":",
                icons:[
                    "jj",
                    [
                        "l",
                        {
                            type:"&",
                            icons:[
                                "G34",
                                "rap"
                            ]
                        }
                    ],
                ]
            },
        ]);
    })

    it('detects the cartouche A-<H-B-C:(D-E)->',()=>{

        expect(ramsesII('A-<H-B-C:(D-E)->')).toStrictEqual([
            'A',
            {
                type:"cartouche",
                icons:[
                    "B",
                    {
                        type:":",
                        icons:[
                            "C",
                            [
                                "D",
                                "E"
                            ]
                        ]
                    }   
                ]
            },
        ]);

        expect(ramsesII('A-<S-B-C:(D-E)->')).toStrictEqual([
            'A',
            {
                type:"cartouche",
                icons:[
                    "B",
                    {
                        type:":",
                        icons:[
                            "C",
                            [
                                "D",
                                "E"
                            ]
                        ]
                    }   
                ]
            },
        ]);

        expect(ramsesII('A-<-B-C:(D-E)->')).toStrictEqual([
            'A',
            {
                type:"cartouche",
                icons:[
                    "B",
                    {
                        type:":",
                        icons:[
                            "C",
                            [
                                "D",
                                "E"
                            ]
                        ]
                    }   
                ]
            },
        ]);
    })
});