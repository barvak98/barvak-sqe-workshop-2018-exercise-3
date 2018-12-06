import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const makeTable  =(code) => {
    let jsonData = esprima.parseScript(code ,{loc:true});
    return parseBody(jsonData.body);

};
export {parseCode, makeTable, makeDoubleArray, checkIfUndefined, makeTableHTML };
function  makeDoubleArray( array) {
    let doubleArray = [];
    for (let i = 0; i < array.length; i++) {
        let tmpArr = [array[i].line, array[i].type, array[i].name, array[i].condition, array[i].value];
        tmpArr=checkIfUndefined(tmpArr);
        doubleArray.push(tmpArr);
    }
    return doubleArray;
}

function checkIfUndefined(array){
    if(array[2]===undefined)
        array[2]='';
    if(array[3]===undefined)
        array[3]='';
    if(array[4]===undefined)
        array[4]='';
    return array;
}
function makeTableHTML(myArray) {
    var result = '<table border=1>';
    result+='<thead><tr>' +
        '<th>Line</th>'+
        '<th>Type</th>'+
        '<th>Name</th>'+
        '<th>Condition</th>'+
        '<th>Value</th>'+
        '</tr></thead>';
    for(let i=0; i<myArray.length; i++) {
        result += '<tr>';
        for(let j=0; j<myArray[i].length; j++){
            result += '<td>'+myArray[i][j]+'</td>';
        }
        result += '</tr>';
    }
    result += '</table>';

    return result;
}
function parseFunctionDeclaration(bodyElement) {
    let array=[];
    let funcLine ={line: bodyElement.loc.start.line,type:bodyElement.type,name: bodyElement.id.name, condition:undefined, value:undefined };
    array= array.concat(funcLine);
    const parameters = bodyElement.params.map((params)=>parseFunctionParams(params));
    array=array.concat(parameters);
    let funcBody=parseBody(bodyElement.body.body);
    return array.concat(funcBody);
}
function parseFunctionParams(params){
    return({ line: params.loc.start.line,type:'variable declaration',name: params.name, condition:undefined, value: undefined});
}
function parseVariableDeclaratoin(bodyElement) {
    let arr=[];
    for(let i=0; i<bodyElement.declarations.length; i++) {
        let varaible = ({
            line: bodyElement.declarations[i].loc.start.line,
            type: 'variable declaration',
            name: bodyElement.declarations[i].id.name,
            condition: undefined,
            value: undefined
        });
        arr = arr.concat(varaible);
    }
    return arr;

}

function parseWhileStatement(bodyElement) {
    let array=[];
    let cond = {line: bodyElement.loc.start.line, type: bodyElement.type, name:undefined, condition: bodyElement.value, value:undefined};
    array=array.concat(cond);
    if(bodyElement.body.type==='BlockStatement')
        return array.concat(parseBody(bodyElement.body.body));
    else
        return array.concat(parseBody([bodyElement.body]));
}

function parseIfStatement(bodyElement, isElseIf) {
    let array=[],consequenceIf = [];
    let type='If Statement';
    if(isElseIf)
        type='ElseIf Statement';
    let test = {line: bodyElement.loc.start.line, type: type, name:undefined,condition: escodegen.generate(bodyElement.test), value: undefined};
    array=array.concat(test);
    if(bodyElement.consequent.type==='BlockStatement')
        consequenceIf=parseBody(bodyElement.consequent);
    else
        consequenceIf=parseBody([bodyElement.consequent]);
    array=array.concat(consequenceIf);
    let typeAlt= bodyElement.alternate.type;
    let altIf=[];
    if(typeAlt==='IfStatement')
        altIf = parseIfStatement(bodyElement.alternate, true);
    else
        altIf = parseBody([bodyElement.alternate]);
    return array.concat(altIf);
}
function parseExpressionStatement(bodyElement){
    return parseBody([bodyElement.expression]);
}

function parseReturnStatement(bodyElement) {
    return ({line: bodyElement.loc.start.line, type: bodyElement.type, name:undefined, condition:undefined, value:escodegen.generate(bodyElement.argument)});

}

function parseAssignmentExpression(bodyElement) {
    return {line:bodyElement.loc.start.line, type: bodyElement.type, name: bodyElement.left.name, condition:undefined, value: escodegen.generate(bodyElement.right)};
}
function  parseForStatement(bodyElement) {
    let array=[];
    let condition= escodegen.generate(bodyElement.init)+escodegen.generate(bodyElement.test)+escodegen.generate(bodyElement.update);
    let init = {line: bodyElement.loc.start.line, type: 'For Statement', name:undefined, condition: condition, value:undefined};
    array=array.concat(init);
    if(bodyElement.body.type==='BlockStatement')
        return array.concat(parseBody(bodyElement.body.body));
    else
        return array.concat(parseBody([bodyElement.body]));
}
function parseBody ( code) {
    let array=[];
    for (let i = 0; i < code.length; i++) {
        array=array.concat(parsePrimitiveExps(code[i]));
        array=array.concat(parseComplexExps(code[i]));
    }
    return array;
}
function parsePrimitiveExps (body){
    let array=[];
    switch (body.type) {
    case 'VariableDeclaration' :
        array = array.concat(parseVariableDeclaratoin(body));
        break;
    case 'AssignmentExpression' :
        array = array.concat(parseAssignmentExpression(body));
        break;
    case 'ReturnStatement' :
        array = array.concat(parseReturnStatement(body));
        break;
    case 'ExpressionStatement':
        array = array.concat(parseExpressionStatement(body));
    }

    return array;
}

function parseComplexExps (body){
    let array=[];
    switch (body.type) {
    case 'FunctionDeclaration' :
        array=array.concat(parseFunctionDeclaration(body));
        break;
    case 'IfStatement' :
        array= array.concat(parseIfStatement(body, false));
        break;
    case 'ForStatement' :
        array= array.concat(parseForStatement(body));
        break;
    case 'WhileStatement':
        array= array.concat(parseWhileStatement(body));
        break;
    }
    return array;
}

