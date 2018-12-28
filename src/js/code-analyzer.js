import {evalProgram} from './evalJson';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {parseProgram};

let nodes =[];
let edges =[];
let nodeIndex =0;
let colors =[];


function parseProgram(codeToParse, code, argsVals,env) {
    let program =  esprima.parseScript(codeToParse);
    colors = evalProgram(code, argsVals, env);
    parseGlobals(program);
}
function parseGlobals(program){
    for (let i = 0; i < program.body.length; i++) {
        if (program.body[i].type === 'VariableDeclaration') {
            if(nodes.isEmpty()|| nodes[nodes.length-1].type!== 'LetAssExp') {
                let node= {type: 'LetAssExp', array: [escodegen.generate(program[i])], index: nodeIndex};
                nodes.push(node);
                nodeIndex++;
                addEdge(node);
            }
            else
                nodes[nodes.length-1].array.push(escodegen.generate(program[i]));
        }

        else {
            parseBody([program.body[i]]);
        }
    }

}
function parseBody(program){
    let currNode =[];
    for (let i = 0; i < program.body.length; i++) {
        if(isPrimitive(program[i])) {
            parsePrimitive(program[i]);
        }
        else if(program[i].type === 'FunctionDeclaration')
        {
            parseBody(program[i].body.body);
        }
        else if(isCond(program[i])){
            parseCond(program[i]);
            currNode=[];
        }
    }
}

function isPrimitive(program) {
    return (program.type === 'VariableDeclaration') || (program.type === 'AssignmentExpression') || (program.type === 'ExpressionStatement');

}
function parsePrimitive(program){
    if(nodes.isEmpty()|| nodes[nodes.length-1].type!== 'LetAssExp') {
        let node= {type: 'LetAssExp', array: [escodegen.generate(program)], index: nodeIndex};
        nodes.push(node);
        nodeIndex++;
        addEdge(node);
    }
    else
        nodes[nodes.length-1].array.push(escodegen.generate(program));

}
function isCond(program){
    return program.type === 'IfStatement' || program.type === 'WhileStatement';

}
function parseCond(program){
    if(program.type === 'IfStatement')
        parseIfExp(program);
    else
        parseWhileExp(program);

}
function parseWhileExp(program) {
    let nullNode = {type: 'NullNode', index: nodeIndex};
    addEdge(nullNode);
    nodes.push(nullNode);
    nodeIndex++;
    let whileNode = {type: 'WhileNode', test: esprima.parseScript(program.test), index: nodeIndex};
    nodes.push(whileNode);
    nodeIndex++;
    addEdge(whileNode);
    if (program.body.type === 'BlockStatement') {
        parseBody(program.body.body);
    }
    else {
        parseBody([program.body]);
    }
    edges[edges.length - 1].to = nullNode.index;
    edges.push({from: whileNode.index, to: undefined});
}
function parseIfExp(program) {
    addIfNode(program);
    parseBlockStatement(program.consequent);
    if (program.alternate !== null) {
        let typeAlt = program.alternate.type;
        if (typeAlt === 'IfStatement')
            parseIfExp(program.alternate);
        else {
            parseBlockStatement(program.alternate);

        }
    }
}
function addIfNode(program){
    let ifNode = {type: 'IfNode', test: esprima.parseScript(program.test), index: nodeIndex};
    nodes.push(ifNode);
    nodeIndex++;
    addEdge(ifNode);
}
function addEdge(node){
    if (!edges.isEmpty) {
        edges[edges.length - 1].to(node.index);
        edges.push({from:node.index, to: undefined});
    }
    else {
        edges.push({from: node.index, to: undefined});
    }
}

function parseBlockStatement(program){
    if (program.type !== 'BlockStatement')
        parseBody([program]);
    else {
        parseBody(program.body);
    }
}