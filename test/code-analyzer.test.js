import assert from 'assert';
import {makeTable, parseCode, makeDoubleArray, makeTableHTML} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.deepEqual(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.deepEqual(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
});


describe('The javascript parser', () => {
    it('is parsing a simple  function correctly', () => {
        assert.deepEqual(
            JSON.stringify(parseCode('function average(x,y){ let avg=(x+y)/2; return avg;}', {loc:true})),
            '{"type":"Program","body":[{"type":"FunctionDeclaration","id":{"type":"Identifier","name":"average"},"params":[{"type":"Identifier","name":"x"},{"type":"Identifier","name":"y"}],"body":{"type":"BlockStatement","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"avg"},"init":{"type":"BinaryExpression","operator":"/","left":{"type":"BinaryExpression","operator":"+","left":{"type":"Identifier","name":"x"},"right":{"type":"Identifier","name":"y"}},"right":{"type":"Literal","value":2,"raw":"2"}}}],"kind":"let"},{"type":"ReturnStatement","argument":{"type":"Identifier","name":"avg"}}]},"generator":false,"expression":false,"async":false}],"sourceType":"script"}'
        );
    });
});
describe('The javascript parser', () => {
    it('is parsing a simple  function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeTable('function binarySearch(X, V, n){\n' +
                '    let low, high, mid;\n' +
                '    low = 0;\n' +
                '    high = n - 1;\n' +
                '    while (low <= high) {\n' +
                '        mid = (low + high)/2;\n' +
                '        if (X < V[mid])\n' +
                '            high = mid - 1;\n' +
                '        else if (X > V[mid])\n' +
                '            low = mid + 1;\n' +
                '        else\n' +
                '            return mid;\n' +
                '    }\n' +
                '    return -1;\n' +
                '}', {loc:true})),
            '[{"line":1,"type":"FunctionDeclaration","name":"binarySearch"},{"line":1,"type":"variable declaration","name":"X"},{"line":1,"type":"variable declaration","name":"V"},{"line":1,"type":"variable declaration","name":"n"},{"line":2,"type":"variable declaration","name":"low"},{"line":2,"type":"variable declaration","name":"high"},{"line":2,"type":"variable declaration","name":"mid"},{"line":3,"type":"AssignmentExpression","name":"low","value":"0"},{"line":4,"type":"AssignmentExpression","name":"high","value":"n - 1"},{"line":5,"type":"WhileStatement"},{"line":6,"type":"AssignmentExpression","name":"mid","value":"(low + high) / 2"},{"line":7,"type":"If Statement","condition":"X < V[mid]"},{"line":8,"type":"AssignmentExpression","name":"high","value":"mid - 1"},{"line":9,"type":"ElseIf Statement","condition":"X > V[mid]"},{"line":10,"type":"AssignmentExpression","name":"low","value":"mid + 1"},{"line":12,"type":"ReturnStatement","value":"mid"},{"line":14,"type":"ReturnStatement","value":"-1"}]'
        );
    });
});
describe('My  Make Double Array func ', () => {
    it('is parsing a simple  function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeDoubleArray(makeTable('function average(x,y){let z=1;return (x+y+z)/3;}'))),
            '[[1,"FunctionDeclaration","average","",""],[1,"variable declaration","x","",""],[1,"variable declaration","y","",""],[1,"variable declaration","z","",""],[1,"ReturnStatement","","","(x + y + z) / 3"]]'
        );
    });
});
describe('My  Make Double Array func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeDoubleArray(makeTable('function max(x,y){\n' +
                '    if(x>y)\n' +
                'return x;\n' +
                'else if(x=y){\n' +
                'return y;\n' +
                '}\n' +
                'else\n' +
                'return x+y;\n' +
                '}'))),
            '[[1,"FunctionDeclaration","max","",""],[1,"variable declaration","x","",""],[1,"variable declaration","y","",""],[2,"If Statement","","x > y",""],[3,"ReturnStatement","","","x"],[4,"ElseIf Statement","","x = y",""],[8,"ReturnStatement","","","x + y"]]'
        );
    });
});
describe('My  Make Double Array func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeDoubleArray(makeTable('function whileFunc(z){while (z<4) z=z+1; for(let i=0; i<z; i++){z=z-1;}}'))),
            '[[1,"FunctionDeclaration","whileFunc","",""],[1,"variable declaration","z","",""],[1,"WhileStatement","","",""],[1,"AssignmentExpression","z","","z + 1"],[1,"For Statement","","let i = 0;i < zi++",""],[1,"AssignmentExpression","z","","z - 1"]]'
        );
    });
});
describe('My  Make Double Array func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeDoubleArray(makeTable('function whileFunc(z){while (z<4) z=z+1; for(let i=0; i<z; i++)z=z-1;}'))),
            '[[1,"FunctionDeclaration","whileFunc","",""],[1,"variable declaration","z","",""],[1,"WhileStatement","","",""],[1,"AssignmentExpression","z","","z + 1"],[1,"For Statement","","let i = 0;i < zi++",""],[1,"AssignmentExpression","z","","z - 1"]]'
        );
    });
});



describe('My  Make HTML table func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeTableHTML(makeDoubleArray(makeTable('function func (a, b){ return a+b; }')))),
            '"<table border=1><thead><tr><th>Line</th><th>Type</th><th>Name</th><th>Condition</th><th>Value</th></tr></thead><tr><td>1</td><td>FunctionDeclaration</td><td>func</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>a</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>b</td><td></td><td></td></tr><tr><td>1</td><td>ReturnStatement</td><td></td><td></td><td>a + b</td></tr></table>"'
        );
    });
});
describe('My  Make HTML table func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeTableHTML(makeDoubleArray(makeTable('function min (x,y){\n' +
                'if(x<y)\n' +
                'return x;\n' +
                'else\n' +
                'return y;\n' +
                '}')))),
            '"<table border=1><thead><tr><th>Line</th><th>Type</th><th>Name</th><th>Condition</th><th>Value</th></tr></thead><tr><td>1</td><td>FunctionDeclaration</td><td>min</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>x</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>y</td><td></td><td></td></tr><tr><td>2</td><td>If Statement</td><td></td><td>x < y</td><td></td></tr><tr><td>3</td><td>ReturnStatement</td><td></td><td></td><td>x</td></tr><tr><td>5</td><td>ReturnStatement</td><td></td><td></td><td>y</td></tr></table>"'
        );
    });
});
describe('My  Make HTML table func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeTableHTML(makeDoubleArray(makeTable('function func (a, b){ return a+b; }')))),
            '"<table border=1><thead><tr><th>Line</th><th>Type</th><th>Name</th><th>Condition</th><th>Value</th></tr></thead><tr><td>1</td><td>FunctionDeclaration</td><td>func</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>a</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>b</td><td></td><td></td></tr><tr><td>1</td><td>ReturnStatement</td><td></td><td></td><td>a + b</td></tr></table>"'
        );
    });
});
describe('My  Make HTML table func ', () => {
    it('is parsing a simple function correctly', () => {
        assert.deepEqual(
            JSON.stringify(makeTableHTML(makeDoubleArray(makeTable('function diff( x, y){\n' +
                'let dif;\n' +
                'if(x>y){\n' +
                'dif= x-y;\n' +
                '}\n' +
                'else\n' +
                'dif= y-x;\n' +
                'return dif;\n' +
                '}')))),
            '"<table border=1><thead><tr><th>Line</th><th>Type</th><th>Name</th><th>Condition</th><th>Value</th></tr></thead><tr><td>1</td><td>FunctionDeclaration</td><td>diff</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>x</td><td></td><td></td></tr><tr><td>1</td><td>variable declaration</td><td>y</td><td></td><td></td></tr><tr><td>2</td><td>variable declaration</td><td>dif</td><td></td><td></td></tr><tr><td>3</td><td>If Statement</td><td></td><td>x > y</td><td></td></tr><tr><td>7</td><td>AssignmentExpression</td><td>dif</td><td></td><td>y - x</td></tr><tr><td>8</td><td>ReturnStatement</td><td></td><td></td><td>dif</td></tr></table>"'
        );
    });
});

