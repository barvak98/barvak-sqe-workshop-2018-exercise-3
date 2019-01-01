import assert from 'assert';
import {parseCode, parseProgram} from '../src/js/code-analyzer';
import * as esprima from 'esprima';

let parsedCode1 = parseCode('function foo(x, y, z){\n' +
    '    let a = x + 1;\n' +
    '    let b = a + y;\n' +
    '    let c = 0;\n' +
    '    \n' +
    '    if (b < z) {\n' +
    '        c = c + 5;\n' +
    '    } else if (b < z * 2) {\n' +
    '        c = c + x + 5;\n' +
    '    } else {\n' +
    '        c = c + z + 5;\n' +
    '    }\n' +
    '    \n' +
    '    return c;\n' +
    '}\n');

describe('The javascript parser', () => {
    it('is parsing the 1th test correctly', () => {
        assert.deepEqual(
            parseProgram('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n',parsedCode1,  esprima.parseScript('1,2,3'),[] ),
            'node1=>operation: #1\n' +
            'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0; |approved\n' +
            'node2=>condition: #2\n' +
            'b < z |approved\n' +
            'node3=>operation: #3\n' +
            'c = c + 5; |rejected\n' +
            'node4=>condition: #4\n' +
            'b < z * 2 |approved\n' +
            'node5=>operation: #5\n' +
            'c = c + x + 5;\n' +
            'c = c + z + 5; |approved\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node6=>operation: #6\n' +
            'return c |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3->dummy0\n' +
            'node2(no)->node4\n' +
            'node4(yes)->node5\n' +
            'node5->dummy0\n' +
            'node4(no)->dummy0\n' +
            'dummy0->node6\n' );
    });
});
let parsedCode2 = parseCode('function foo(x, y, z){\n' +
    '   let a = x + 1;\n' +
    '   let b = a + y;\n' +
    '   let c = 0;\n' +
    '   \n' +
    '   while (a < z) {\n' +
    '       c = a + b;\n' +
    '       z = c * 2;\n' +
    '       a++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n');

describe('The javascript parser', () => {
    it('is parsing the 2nd test correctly', () => {
        assert.deepEqual(
            parseProgram('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   let b = a + y;\n' +
                '   let c = 0;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       c = a + b;\n' +
                '       z = c * 2;\n' +
                '       a++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n',parsedCode2,  esprima.parseScript('1,2,3'),[] ),
            'node1=>operation: #1\n' +
            'let a = x + 1;\n' +
            'let b = a + y;\n' +
            'let c = 0; |approved\n' +
            'node2=>operation: #2\n' +
            'null |approved\n' +
            'node3=>condition: #3\n' +
            'a < z |approved\n' +
            'node4=>operation: #4\n' +
            'c = a + b;\n' +
            'z = c * 2;\n' +
            'a++; |approved\n' +
            'node5=>operation: #5\n' +
            'return z |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2->node3\n' +
            'node3(yes)->node4\n' +
            'node4->node2\n' +
            'node3(no)->node5\n' );
    });
});
let parsedCode3 =parseCode('function foo(x, y, z){\n' +
    '     while (x < z) {\n' +
    '     if(1<2)\n' +
    'x++;\n' +
    'else\n' +
    'y++;\n' +
    '   }\n' +
    '   \n' +
    '   return z;\n' +
    '}\n');

describe('The javascript parser', () => {
    it('is parsing the 3 test correctly', () => {
        assert.deepEqual(
            parseProgram('function foo(x, y, z){\n' +
                '     while (x < z) {\n' +
                '     if(1<2)\n' +
                'x++;\n' +
                'else\n' +
                'y++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n',parsedCode3,  esprima.parseScript('1,2,3'),[] ),
            'node1=>operation: #1\n' +
            'null |approved\n' +
            'node2=>condition: #2\n' +
            'x < z |approved\n' +
            'node3=>condition: #3\n' +
            '1 < 2 |approved\n' +
            'node4=>operation: #4\n' +
            'x++; |approved\n' +
            'node5=>operation: #5\n' +
            'y++; |rejected\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node6=>operation: #6\n' +
            'return z |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3(yes)->node4\n' +
            'node4->dummy0\n' +
            'node3(no)->node5\n' +
            'node5->dummy0\n' +
            'dummy0->node1\n' +
            'node2(no)->node6\n' +
            'dummy0->node6\n' );
    });
});
let parsedCode4 =parseCode('let a=1;\n' +
    'function test(z){\n' +
    'if(a>1){\n' +
    'a++;\n' +
    '}\n' +
    'else{\n' +
    'a=a+2;\n' +
    '}\n' +
    'return a;\n' +
    '}');

describe('The javascript parser', () => {
    it('is parsing the 4th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=1;\n' +
                'function test(z){\n' +
                'if(a>1){\n' +
                'a++;\n' +
                '}\n' +
                'else{\n' +
                'a=a+2;\n' +
                '}\n' +
                'return a;\n' +
                '}',parsedCode4,  esprima.parseScript('1'),[] ),
            'node1=>operation: #1\n' +
            'let a = 1; |approved\n' +
            'node2=>condition: #2\n' +
            'a > 1 |approved\n' +
            'node3=>operation: #3\n' +
            'a++;\n' +
            'a = a + 2; |rejected\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node4=>operation: #4\n' +
            'return a |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3->dummy0\n' +
            'node2(no)->dummy0\n' +
            'dummy0->node4\n' );
    });
});


let parsedCode5 =parseCode('let a=1;\n' +
    'function test(z){\n' +
    'if(a>1){\n' +
    'a++;\n' +
    '}\n' +
    'else{\n' +
    'a=a+2;\n' +
    '}\n' +
    'return a;\n' +
    '}\n' +
    'let b=1;');

describe('The javascript parser', () => {
    it('is parsing the 5th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=1;\n' +
                'function test(z){\n' +
                'if(a>1){\n' +
                'a++;\n' +
                '}\n' +
                'else{\n' +
                'a=a+2;\n' +
                '}\n' +
                'return a;\n' +
                '}\n' +
                'let b=1;',parsedCode5,  esprima.parseScript('2'),[] ),
            'node1=>operation: #1\n' +
            'let a = 1; |approved\n' +
            'node2=>condition: #2\n' +
            'a > 1 |approved\n' +
            'node3=>operation: #3\n' +
            'a++;\n' +
            'a = a + 2; |rejected\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node4=>operation: #4\n' +
            'return a |approved\n' +
            'node5=>operation: #5\n' +
            'let b = 1; |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3->dummy0\n' +
            'node2(no)->dummy0\n' +
            'dummy0->node5\n' +
            'undefined' );
    });
});



let parsedCode6 =parseCode('let a=1;\n' +
    'function test(z){\n' +
    'if(a>1){\n' +
    'a++;\n' +
    '}\n' +
    'else{\n' +
    'let t=6;\n' +
    '}\n' +
    'return a;\n' +
    '}');

describe('The javascript parser', () => {
    it('is parsing the 6th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=1;\n' +
                'function test(z){\n' +
                'if(a>1){\n' +
                'a++;\n' +
                '}\n' +
                'else{\n' +
                'let t=6;\n' +
                '}\n' +
                'return a;\n' +
                '}',parsedCode6,  esprima.parseScript('2'),[] ),
            'node1=>operation: #1\n' +
            'let a = 1; |approved\n' +
            'node2=>condition: #2\n' +
            'a > 1 |approved\n' +
            'node3=>operation: #3\n' +
            'a++; |rejected\n' +
            'node4=>operation: #4\n' +
            'let t = 6; |approved\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node5=>operation: #5\n' +
            'return a |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3->dummy0\n' +
            'node2(no)->node4\n' +
            'node4->dummy0\n' +
            'dummy0->node5\n' );
    });
});let parsedCode7 =parseCode('let a=1;\n' +
    'function test(x,y,z){\n' +
    'if(x>7){\n' +
    'x++;\n' +
    '}\n' +
    'else if(y>5){\n' +
    'y++;\n' +
    '}\n' +
    'else if(z<1){\n' +
    'z++;\n' +
    '}\n' +
    'return z;\n' +
    '}');

describe('The javascript parser', () => {
    it('is parsing the 7th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=1;\n' +
                'function test(x,y,z){\n' +
                'if(x>7){\n' +
                'x++;\n' +
                '}\n' +
                'else if(y>5){\n' +
                'y++;\n' +
                '}\n' +
                'else if(z<1){\n' +
                'z++;\n' +
                '}\n' +
                'return z;\n' +
                '}',parsedCode7,  esprima.parseScript('4,5,6'),[] ),
            'node1=>operation: #1\n' +
            'let a = 1; |approved\n' +
            'node2=>condition: #2\n' +
            'x > 7 |approved\n' +
            'node3=>operation: #3\n' +
            'x++; |rejected\n' +
            'node4=>condition: #4\n' +
            'y > 5 |approved\n' +
            'node5=>operation: #5\n' +
            'y++; |rejected\n' +
            'node6=>condition: #6\n' +
            'z < 1 |approved\n' +
            'node7=>operation: #7\n' +
            'z++; |rejected\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node8=>operation: #8\n' +
            'return z |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3->dummy0\n' +
            'node2(no)->node4\n' +
            'node4(yes)->node5\n' +
            'node5->dummy0\n' +
            'node4(no)->node6\n' +
            'node6(yes)->node7\n' +
            'node7->dummy0\n' +
            'dummy0->node8\n');
    });
});

let parsedCode8 =parseCode('let a=[1,2,3];\n' +
    'function f (x,y){\n' +
    'x= a[0];\n' +
    'let a=[1,2,3,4];\n' +
    'while(a[0]<8)\n' +
    'x++;\n' +
    'return x;\n' +
    '}');

describe('The javascript parser', () => {
    it('is parsing the 8th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=[1,2,3];\n' +
                'function f (x,y){\n' +
                'x= a[0];\n' +
                'let a=[1,2,3,4];\n' +
                'while(a[0]<8)\n' +
                'x++;\n' +
                'return x;\n' +
                '}',parsedCode8,  esprima.parseScript('1,2'),[] ),
            'node1=>operation: #1\n' +
            'let a = [\n' +
            '    1,\n' +
            '    2,\n' +
            '    3\n' +
            '];\n' +
            'x = a[0];\n' +
            'let a = [\n' +
            '    1,\n' +
            '    2,\n' +
            '    3,\n' +
            '    4\n' +
            ']; |approved\n' +
            'node2=>operation: #2\n' +
            'null |approved\n' +
            'node3=>condition: #3\n' +
            'a[0] < 8 |approved\n' +
            'node4=>operation: #4\n' +
            'x++; |approved\n' +
            'node5=>operation: #5\n' +
            'return x |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2->node3\n' +
            'node3(yes)->node4\n' +
            'node4->node2\n' +
            'node3(no)->node5\n');
    });
});



let parsedCode9 =parseCode('let a=[1,2,3];\n' +
    'function f (){\n' +
    'let b=1;\n' +
    'let c=a[0]+b;\n' +
    'let x= a[0];\n' +
    'let a=[1,2,3,4];\n' +
    'while(a[0]<8)\n' +
    'x++;\n' +
    'return x;\n' +
    '}');

describe('The javascript parser', () => {
    it('is parsing the 9th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=[1,2,3];\n' +
                'function f (){\n' +
                'let b=1;\n' +
                'let c=a[0]+b;\n' +
                'let x= a[0];\n' +
                'let a=[1,2,3,4];\n' +
                'while(a[0]<8)\n' +
                'x++;\n' +
                'return x;\n' +
                '}',parsedCode9,  esprima.parseScript(''),[] ),
            'node1=>operation: #1\n' +
            'let a = [\n' +
            '    1,\n' +
            '    2,\n' +
            '    3\n' +
            '];\n' +
            'let b = 1;\n' +
            'let c = a[0] + b;\n' +
            'let x = a[0];\n' +
            'let a = [\n' +
            '    1,\n' +
            '    2,\n' +
            '    3,\n' +
            '    4\n' +
            ']; |approved\n' +
            'node2=>operation: #2\n' +
            'null |approved\n' +
            'node3=>condition: #3\n' +
            'a[0] < 8 |approved\n' +
            'node4=>operation: #4\n' +
            'x++; |approved\n' +
            'node5=>operation: #5\n' +
            'return x |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2->node3\n' +
            'node3(yes)->node4\n' +
            'node4->node2\n' +
            'node3(no)->node5\n');
    });
});


/*
let parsedCode10 =parseCode('let a=1;\n' +
    'function test(x,y,z){\n' +
    'if(x>7){\n' +
    'x++;\n' +
    '}\n' +
    'else if(y>5){\n' +
    'y++;\n' +
    '}\n' +
    'else if(z<1){\n' +
    'z++;\n' +
    '}\n' +
    'return z;\n' +
    '}');

describe('The javascript parser', () => {
    it('is parsing the10th test correctly', () => {
        assert.deepEqual(
            parseProgram('let a=1;\n' +
                'function test(x,y,z){\n' +
                'if(x>7){\n' +
                'x++;\n' +
                '}\n' +
                'else if(y>5){\n' +
                'y++;\n' +
                '}\n' +
                'else if(z<1){\n' +
                'z++;\n' +
                '}\n' +
                'return z;\n' +
                '}',parsedCode7,  esprima.parseScript('4,5,6'),[] ),
            'node1=>operation: #1\n' +
            'let a = 1; |approved\n' +
            'node2=>condition: #2\n' +
            'x > 7 |approved\n' +
            'node3=>operation: #3\n' +
            'x++; |rejected\n' +
            'node4=>condition: #4\n' +
            'y > 5 |approved\n' +
            'node5=>operation: #5\n' +
            'y++; |rejected\n' +
            'node6=>condition: #6\n' +
            'z < 1 |approved\n' +
            'node7=>operation: #7\n' +
            'z++; |rejected\n' +
            'dummy0=>operation: \n' +
            ' |approved\n' +
            'node8=>operation: #8\n' +
            'return z |approved\n' +
            '\n' +
            'node1->node2\n' +
            'node2(yes)->node3\n' +
            'node3->dummy0\n' +
            'node2(no)->node4\n' +
            'node4(yes)->node5\n' +
            'node5->dummy0\n' +
            'node4(no)->node6\n' +
            'node6(yes)->node7\n' +
            'node7->dummy0\n' +
            'dummy0->node8\n');
    });
});
*/

