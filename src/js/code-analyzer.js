import {evalProgram} from './evalJson';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {parseProgram, parseCode};

let nodes =[];
let edges =[];
let nodeIndex =0;
let colors =[];
let condIndex =0;
let ifCounter =0;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};
function parseProgram(codeToParse, code, argsVals,env) {
    let program =  esprima.parseScript(codeToParse);
    let c = evalProgram(code, argsVals, env);
    parseColors(c);
    parseGlobals(program);
}
function parseColors(c){
    for(let i=0; i<c.length; i++){
        colors[i] = c[i] === 'green';
    }
}
function parseGlobals(program) {
    for (let i = 0; i < program.body.length; i++) {
        if (program.body[i].type === 'VariableDeclaration') {
            if (nodes.isEmpty() || nodes[nodes.length - 1].type !== 'LetAssExp') {
                let node = {type: 'LetAssExp', array: [escodegen.generate(program.body[i])], index: nodeIndex, color: true};
                nodes.push(node);
                nodeIndex++;
                addEdge(node);
            }
            else
                nodes[nodes.length - 1].array.push(escodegen.generate(program.body[i]));
        }

        else {
            parseBody([program.body[i]], true);
        }
    }

}

function parseBody(program, color){
    for (let i = 0; i < program.length; i++) {
        if(isPrimitive(program[i])) {
            parsePrimitive(program[i], color);
        }
        else if(program[i].type === 'FunctionDeclaration')
        {
            parseBody(program[i].body.body, color);
        }
        else if(isCond(program[i])){
            parseCond(program[i], color);
        }
    }
}

function isPrimitive(program) {
    return (program.type === 'VariableDeclaration') || (program.type === 'AssignmentExpression') || (program.type === 'ExpressionStatement');

}
function parsePrimitive(program, color){
    if(nodes.length===0|| nodes[nodes.length-1].type!== 'LetAssExp') {
        let node= {type: 'LetAssExp', array: [escodegen.generate(program)], index: nodeIndex, color: color};
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

function parseCond(program, color){
    if(program.type === 'IfStatement')
        parseIfExp(program, color);
    else
        parseWhileExp(program, color);

}
function parseWhileExp(program, color) {
    let whileColor = colors[condIndex];
    condIndex++;
    let nullNode = {type: 'NullNode', index: nodeIndex, color:color};
    addEdge(nullNode);
    nodes.push(nullNode);
    nodeIndex++;
    let test = program.test;
    let test1 =  escodegen.generate(test);
    let whileNode = {type: 'WhileNode', test: test1, index: nodeIndex, color: color};
    nodes.push(whileNode);
    nodeIndex++;
    addEdge(whileNode);
    parseBlockStatement(program.body, color&& whileColor);
    edges[edges.length - 1].to = nullNode.index;
    edges.push({from: whileNode.index, to: undefined});
}
function parseIfExp(program, color) {
    let ifColor = colors[condIndex];
    condIndex++;
    let ifNode = addIfNode(program, color);
    parseBlockStatement(program.consequent, ifColor && color);
    let lastNodeConsIndex = nodeIndex;
    if(program.alternate!=null) {
        checkAlt(program, ifNode, color, ifColor, lastNodeConsIndex);
    }
}
function checkAlt(program, ifNode, color, ifColor, lastNodeConsIndex){
    ifCounter++;
    if ( program.alternate.type === 'IfStatement')
        parseElseIfExp(program.alternate, ifNode, color && !ifColor);
    else {
        parseBlockStatement(program.alternate, color && !ifColor);
        edges[lastNodeConsIndex].to = undefined;
        connectToDummy();
    }
}
function connectToDummy(){
    for(let i=0; i<ifCounter; i++){
        if(edges[edges.length-1-i].to=== undefined)
            edges[i].to = nodeIndex;
    }
    let dummyNode = {type: 'DummyNode', index: nodeIndex};
    nodes.push(dummyNode);
    nodeIndex++;
}
function parseElseIfExp(program, prevIfNode){
    let ifNode= addElseIfNode(program, prevIfNode);
    parseBlockStatement(program.consequent);
    let lastNodeConsIndex = nodeIndex;
    if (program.alternate !== null) {
        let typeAlt = program.alternate.type;
        if (typeAlt === 'IfStatement')
            parseElseIfExp(program.alternate,ifNode);
        else {
            parseBlockStatement(program.alternate);
            edges[lastNodeConsIndex].to=undefined;
            connectToDummy();
        }
    }

}
function addIfNode(program, color){
    let ifNode = {type: 'IfNode', test: escodegen.generate(program.test), index: nodeIndex, color: color};
    nodes.push(ifNode);
    nodeIndex++;
    addEdge(ifNode);
    return ifNode;
}
function addElseIfNode(program, prevIfNode, color){
    let ifNode = {type: 'IfNode', test: escodegen.generate(program.test), index: nodeIndex, color: color};
    nodes.push(ifNode);
    edges.push({from:prevIfNode.index, to: nodeIndex});
    nodeIndex++;
    return ifNode;
}
function addEdge(node){
    if (edges.length!==0) {
        let e = edges[edges.length - 1];
        e.to=(node.index);
        edges.push({from:node.index, to: undefined});
    }
    else {
        edges.push({from: node.index, to: undefined});
    }
}

function parseBlockStatement(program, color){
    if (program.type !== 'BlockStatement')
        parseBody([program], color);
    else {
        parseBody(program.body, color);
    }
}