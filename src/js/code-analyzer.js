import * as esprima from 'esprima';
//import * as escodegen from 'escodegen';


let params=[];
let argsValues=[];
const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const makeTable  =(code) => {
    let jsonData = esprima.parseScript(code ,{loc:true});
    return parseBody(jsonData.body);

};
export {parseCode, makeTable, makeDoubleArray, makeTableHTML, parseProgram };
function  makeDoubleArray( array) {
    let doubleArray = [];
    for (let i = 0; i < array.length; i++) {
        let tmpArr = [array[i].line, array[i].type, array[i].name, array[i].condition, array[i].value];
        doubleArray.push(tmpArr);
    }
    return doubleArray;
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
function parseFunctionDeclaration(func , env) {
    parseFunctionParams(func.params, env);
    func=parseBody(func.body.body, env);
    return func;
}

function parseFunctionParams(parameters, env){
    for(let i=0; i<parameters.length; i=i+1){
        params.push(parameters[i].name);
        env[parameters[i].name]= argsValues[i].right;
    }
}


function parseVariableDeclaration(vardecl, env) {
    for (let i = 0; i < vardecl.declarations.length; i++) {
        if (vardecl.declarations[i].init.type === 'ArrayExpression') {
            let right = vardecl.declarations[i].init.elements;
            for(let i=0; i<right.length; i=i+1){
                right[i]= substitute(right[i], env);
            }
            vardecl.declarations[i].init = right;
            env[vardecl.declarations[i].id.name] = right;
        }
        else {
            let right = substitute(vardecl.declarations[i].init, env);
            vardecl.declarations[i].init = right;
            env[vardecl.declarations[i].id.name] = right;
        }
    }
    return null;

}

function parseWhileStatement(program, env){
    //let cond = {line: bodyElement.loc.start.line, type: bodyElement.type, name:undefined, condition: bodyElement.value, value:undefined};
    if(program.body.type==='BlockStatement')
        return (parseBody(program.body.body), env);
    else
        return (parseBody([program.body]), env);
}

function parseIfStatement(bodyElement, isElseIf, env) {
    let newEnv = deepCopyEnv(env);
    bodyElement.test =parseBody(bodyElement.test);
    if (bodyElement.consequent.type === 'BlockStatement')
        bodyElement.consequent = parseBody(bodyElement.consequent.body, env);
    else
        bodyElement.consequent = parseBody([bodyElement.consequent], env);
    let typeAlt = bodyElement.alternate.type;
    if (typeAlt === 'IfStatement')
        bodyElement.alternate = parseIfStatement(bodyElement.alternate, true, newEnv);
    else
        bodyElement.alternate = parseBody(bodyElement.alternate.body, newEnv);
    return bodyElement;
}

function parseExpressionStatement(bodyElement, env){
    return parseBody([bodyElement.expression], env);
}

function parseReturnStatement(retStatement, env) {
    retStatement = substitute(retStatement.argument, env);
    return retStatement;
}

function parseAssignmentExpression(assignExp, env) {
    let name;
    if (assignExp.left.type === 'MemberExpression') {
        name = assignExp.left.object.name;
        assignExp.left.property = substitute(assignExp.left.property);
        assignExp.right = substitute(assignExp.right, env);
        env[name][assignExp.left.property.value] = assignExp.right;
    }
    else {
        name = assignExp.left.name;
        assignExp.right = substitute(assignExp.right, env);
        env[name] = assignExp.right;
    }
    if (isFuncArgument(name))
        return assignExp;
    else
        return null;
}


function deepCopyEnv(oldEnv){
    let newEnv=[];
    for(let arg in oldEnv){
        newEnv[arg]=oldEnv[arg];
    }
    return newEnv;

}
function substitute (expr, env){
    switch (expr.type) {
    case 'BinaryExpression':
        return BinaryExpSub(expr, env);
    case 'Identifier':
        return identifierSub(expr, env);
    case 'MemberExpression':
        return memberExpSub(expr, env);
    case 'Literal':
        return expr;
    }

}
function memberExpSub(expr, env){
    let name=expr.object.name;
    expr.property=substitute(expr.property,env);
    if (!isFuncArgument(name)) {
        let tmp= env[name];
        return tmp[expr.property.value];
    }
    else
        return expr;
}

function BinaryExpSub( expr, env){
    expr.left=substitute(expr.left, env);
    expr.right=substitute(expr.right, env);
    return expr;
}

function isFuncArgument(name) {
    let exist = params.indexOf(name);
    if(exist===-1)
        return false;
    return true;
}

function identifierSub (expr, env){
    if (!isFuncArgument(expr.name)) {
        if (env[expr.name] !== undefined) {
            return env[expr.name];
        }
    }
    return expr;
}
function parseProgram(program, argsVals,env){
    let body=program.body;
    argsValues= argsVals.body[0].expression.expressions; // returns as Expression statement
    program.body=parseBody(body, env);
    return program;
}
function parseBody ( program , env ) {
    for (let i = 0; i < program.length; i++) {
        program[i]=(parsePrimitiveExps(program[i], env));
    }
    return program;
}
function parsePrimitiveExps (program , env ){
    if (program.type === 'VariableDeclaration') {
        program = parseVariableDeclaration(program, env);
    } else if (program.type === 'AssignmentExpression') {
        program = (parseAssignmentExpression(program, env));
    } else if (program.type === 'ReturnStatement') {
        program = (parseReturnStatement(program, env));
    } else if (program.type === 'ExpressionStatement') {
        program = (parseExpressionStatement(program, env));
    }
    else
        program= parseComplexExps(program, env);

    return program;
}

function parseComplexExps (program , env  ){
    let newEnv= deepCopyEnv(env);
    if (program.type === 'FunctionDeclaration') {
        program = (parseFunctionDeclaration(program, env));
    } else if (program.type === 'IfStatement') {
        program = (parseIfStatement(program, false, newEnv));
    } else if (program.type === 'WhileStatement') {
        program = (parseWhileStatement(program, newEnv));
    }
    return program;
}