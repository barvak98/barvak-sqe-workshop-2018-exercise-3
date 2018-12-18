import assert from 'assert';
import {parseCode, parseProgram} from '../src/js/code-analyzer';
import * as esprima from 'esprima';
describe('The javascript parser', () => {
    it('is parsing the 1th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('function foo(x,y){\n' +
                'if(x<y)\n' +
                '{\n' +
                'return 5;\n' +
                '}\n' +
                '}\n'), esprima.parseScript('1,2'),[]),
            '<pre>\n' +
            'function foo(x, y) {\n' +
            '\n' +
            '<span style="background-color:green;">     if (x < y) </span>\n' +
            '\n' +
            '        return 5;\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});


describe('The javascript parser', () => {
    it('is parsing the second test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('function foo(arr){\n' +
                '   if(arr[0]<10)\n' +
                '{\n' +
                'if(arr[1]<0)\n' +
                'return x;\n' +
                '}\n' +
                '}\n'), esprima.parseScript('[1,2,3]'),[]),
            '<pre>\n' +
            'function foo(arr) {\n' +
            '\n' +
            '<span style="background-color:green;">     if (arr[0] < 10) </span>\n' +
            '\n' +
            '<span style="background-color:red;">         if (arr[1] < 0) </span>\n' +
            '\n' +
            '            return;\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});



describe('The javascript parser', () => {
    it('is parsing the 3 test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('function foo(x, arr){\n' +
                '   x= arr;\n' +
                '   if(x[1]<10)\n' +
                'return 5;\n' +
                '}\n'), esprima.parseScript('1, [1,2,3,4]'),[]),
            '<pre>\n' +
            'function foo(x, arr) {\n' +
            '\n' +
            '    (x = [\n' +
            '\n' +
            '        1,\n' +
            '\n' +
            '        2,\n' +
            '\n' +
            '        3,\n' +
            '\n' +
            '        4\n' +
            '\n' +
            '    ])\n' +
            '\n' +
            '<span style="background-color:green;">     if (x[1] < 10) </span>\n' +
            '\n' +
            '        return 5;\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing the 4th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    while (a < z) {\n' +
                '        c = a + b;\n' +
                '        z = c * 2;\n' +
                '    }\n' +
                '    \n' +
                '    return z;\n' +
                '}\n'), esprima.parseScript('1, 2, 3'),[]),
            '<pre>\n' +
            'function foo(x, y, z) {\n' +
            '\n' +
            '<span style="background-color:green;">     while (x + 1 < z) </span>\n' +
            '\n' +
            '        (z = (x + 1 + (x + 1 + y)) * 2)\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '    return z;\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});

describe('The javascript parser', () => {
    it('is parsing the 5th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('let a =1;\n' +
                'function foo(x, y, z){\n' +
                'if(a<3)\n' +
                'x=x+1;\n' +
                '}\n'), esprima.parseScript('1, 2, 3'),[]),
            '<pre>\n' +
            'let a = 1;\n' +
            '\n' +
            'function foo(x, y, z) {\n' +
            '\n' +
            '<span style="background-color:green;">     if (1 < 3) </span>\n' +
            '\n' +
            '        (x = x + 1)\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});

describe('The javascript parser', () => {
    it('is parsing the 6th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('let a =1;\n' +
                'function foo(x, y, z){\n' +
                'if(a<3)\n' +
                'x=x+1;\n' +
                'else\n' +
                'x=x+2;\n' +
                '}'), esprima.parseScript('1,2,3'),[]),
            '<pre>\n' +
            'let a = 1;\n' +
            '\n' +
            'function foo(x, y, z) {\n' +
            '\n' +
            '<span style="background-color:green;">     if (1 < 3) </span>\n' +
            '\n' +
            '        x = x + 1\n' +
            '\n' +
            '    else\n' +
            '\n' +
            '        x = x + 2;\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});

describe('The javascript parser', () => {
    it('is parsing the 7th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('let a=[1,2,3,4];\n' +
                'function f (){\n' +
                'let b=[1];\n' +
                'let arr1=a;\n' +
                'if(arr1[1]<4)\n' +
                '{\n' +
                'return 5;\n' +
                '}\n' +
                'else{\n' +
                'return 9;\n' +
                '}\n' +
                '}'), esprima.parseScript(''),[]),
            '<pre>\n' +
            'let a = [\n' +
            '\n' +
            '    1,\n' +
            '\n' +
            '    2,\n' +
            '\n' +
            '    3,\n' +
            '\n' +
            '    4\n' +
            '\n' +
            '];\n' +
            '\n' +
            'function f() {\n' +
            '\n' +
            '<span style="background-color:green;">     if (2 < 4) </span>\n' +
            '\n' +
            '        return 5;\n' +
            '\n' +
            '    } else {\n' +
            '\n' +
            '        return 9;\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});

describe('The javascript parser', () => {
    it('is parsing the 8th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('function f (x, a){\n' +
                'a[1]=5;\n' +
                'while (x<8)\n' +
                'x=x+1;\n' +
                '}\n'), esprima.parseScript('2, [1,2]'),[]),
            '<pre>\n' +
            'function f(x, a) {\n' +
            '\n' +
            '    (a[1] = 5)\n' +
            '\n' +
            '<span style="background-color:green;">     while (x < 8) </span>\n' +
            '\n' +
            '        (x = x + 1)\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});

describe('The javascript parser', () => {
    it('is parsing the 9th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('let a=[1,2,3,4];\n' +
                'function f (){\n' +
                'let b=[1];\n' +
                'let arr1=a;\n' +
                'if(arr1[1]<4)\n' +
                '{\n' +
                'return 5;\n' +
                '}\n' +
                'else if (arr1[1]>7){\n' +
                'return 9;\n' +
                '}\n' +
                '}'), esprima.parseScript(''),[]),
            '<pre>\n' +
            'let a = [\n' +
            '\n' +
            '    1,\n' +
            '\n' +
            '    2,\n' +
            '\n' +
            '    3,\n' +
            '\n' +
            '    4\n' +
            '\n' +
            '];\n' +
            '\n' +
            'function f() {\n' +
            '\n' +
            '<span style="background-color:green;">     if (2 < 4) </span>\n' +
            '\n' +
            '        return 5;\n' +
            '\n' +
            '<span style="background-color:red;">     } else if (2 > 7) </span>\n' +
            '\n' +
            '        return 9;\n' +
            '\n' +
            '    }\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});


describe('The javascript parser', () => {
    it('is parsing the 10th test correctly', () => {
        assert.deepEqual(
            parseProgram(parseCode('function f (x, arr){\n' +
                'x=arr;\n' +
                '}'), esprima.parseScript('1, [1,2]'),[]),
            '<pre>\n' +
            'function f(x, arr) {\n' +
            '\n' +
            '    (x = [\n' +
            '\n' +
            '        1,\n' +
            '\n' +
            '        2\n' +
            '\n' +
            '    ])\n' +
            '\n' +
            '}\n' +
            '</pre>'
        );
    });
});
