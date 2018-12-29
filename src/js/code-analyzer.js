import {evalProgram} from './evalJson';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';
export {parseProgram, parseCode};

let nodes;
let edges;
let nodeIndex;
let colors;
let condIndex;
let ifCounter;

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};
function parseProgram(codeToParse, code, argsVals,env) {
    nodes=[];
    edges=[];
    colors=[];
    nodeIndex=0;
    condIndex=0;
    ifCounter=0;
    let program =  esprima.parseScript(codeToParse);
    let c = evalProgram(code, argsVals, env);
    parseColors(c);
    parseGlobals(program);
    let str =makeNodesString();
    str+= makeEdgesString();
    return str;
}
function parseColors(c){
    for(let i=0; i<c.length; i++){
        let v = c[i] === 'green';
        colors.push(v);
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
function checkFuncOrReturn(program){
    return (program.type === 'FunctionDeclaration' || program.type === 'ReturnStatement');
}
function parseBody(program, color){
    for (let i = 0; i < program.length; i++) {
        if(isPrimitive(program[i])) {
            parsePrimitive(program[i], color);
        }
        else if(checkFuncOrReturn(program[i]))
        {
            funcAndReturn(program[i], color);
        }
        else if(isCond(program[i])){
            parseCond(program[i], color);
        }
    }
}
function funcAndReturn(program, color){
    if(program.type ==='FunctionDeclaration')
        parseBody(program.body.body, color);
    else
        parseReturnStatement(program);
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
    ifCounter =1;
    let ifColor = colors[condIndex];
    condIndex++;
    let ifNode = addIfNode(program, color);
    parseBlockStatement(program.consequent, ifColor && color);
    let lastNodeConsIndex = edges.length-1;          //// -1 ???????????????????????????????
    if(program.alternate!=null) {
        checkAlt(program, ifNode, color, ifColor, lastNodeConsIndex);
    }
}
function checkAlt(program, ifNode, color, ifColor, lastNodeConsIndex){
    ifCounter++;
    if ( program.alternate.type === 'IfStatement')
        parseElseIfExp(program.alternate, ifNode, color && !ifColor);
    else {
        parseElseExp(program.alternate, color && !ifColor);
        edges[lastNodeConsIndex-1].to = undefined;
        connectToDummy();
    }
}

function parseElseExp(program, ifNode, color){
    edges.push({from: ifNode.index, to: nodeIndex});
    if(checkElseBlock(program))
    {
        let node = {type: 'LetAssExp', array: [escodegen.generate(program.body[0])], index: nodeIndex, color: color};
        nodes.push(node);  nodeIndex++;  addEdge(node);
        let rest = program.body.slice(1);
        if(rest.length>0)
            parseBlockStatement(rest);
    }
    else if(program.type === 'VariableDeclaration' || program.type ==='ExpressionStatement'){
        let node = {type: 'LetAssExp', array: [escodegen.generate(program.body[0])], index: nodeIndex, color: color};
        nodes.push(node);
        edges.push({from:nodeIndex, to: undefined});
        nodeIndex++;
    }
    else{
        parseBlockStatement(program,color);
    }
}
function checkElseBlock(program){
    return (program.type === 'BlockStatement' && program.body[0].type ==='VariableDeclaration' || program.body[0].type ==='ExpressionStatement');
}
function connectToDummy(){
    for(let i=0; i<edges.length && ifCounter>0; i++){
        if(edges[edges.length-1-i].to=== undefined) {
            edges[edges.length-1-i].to = nodeIndex;
            ifCounter--;
        }
    }
    let dummyNode = {type: 'DummyNode', index: nodeIndex};
    nodes.push(dummyNode);
    edges.push({from:nodeIndex, to: undefined});
    nodeIndex++;
}
function parseElseIfExp(program, prevIfNode, color){
    let ifColor = colors[condIndex];
    condIndex++;
    let ifNode= addElseIfNode(program, prevIfNode, color);
    addEdge(ifNode); ///////////////////////////////////////////////////// ?????????????
    parseBlockStatement(program.consequent);
    let lastNodeConsIndex = edges.length -1;
    if (program.alternate !== null) {
        ifCounter++;
        let typeAlt = program.alternate.type;
        if (typeAlt === 'IfStatement')
            parseElseIfExp(program.alternate,ifNode);
        else {
            parseElseExp(program.alternate,ifNode, color && !ifColor);
            edges[lastNodeConsIndex].to = undefined;
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

function parseReturnStatement(program){
    let returnNode = {type: 'ReturnNode',value: 'return '+ escodegen.generate(program.argument), index: nodeIndex, colors: true};
    nodes.push(returnNode);
    nodeIndex++;
    addEdge(returnNode);
    edges.pop();
}


function makeNodesString(){
    let numOfDummies=0;
    let str ='';
    for(let i=0; i<nodes.length; i++){
        if(isOperation(nodes[i]))
            str += DealWithOperation(nodes[i], numOfDummies);
        else if (isCondition(nodes[i]))
            str+= DealWithCondition(nodes[i], numOfDummies);
        else if(nodes[i].type==='DummyNode') {
            numOfDummies++;
            str += 'operation: \n';
        }
    }
    return str;
}

function isOperation(node){
    return node.type === 'NullNode' || node.type === 'ReturnNode' || node.type === 'LetAssExp';
}
function isCondition(node){
    return (node.type === 'IfNode'|| node.type === 'WhileNode' );
}

/**
 * @return {string}
 */
function DealWithCondition(node, numOfDummies) {
    let str = ('condition: ' );
    str+='#'+node.index+1-numOfDummies+'\n';
    str+=  node.test + '\n';
    return str;
}

/**
 * @return {string}
 */
function DealWithOperation(node, numOfDummies){
    let str ='';
    if (node.type ==='NullNode') {
        str+='#'+node.index+1-numOfDummies+'\n';
        str += 'operation: NULL \n';
    }
    if(node.type ==='ReturnNode')
    {
        str+='#'+node.index+1-numOfDummies+'\n';
        str+='operation: '+node.value +'\n';
    }
    else
        return makeLetString(nodes, numOfDummies);
    return str;
}

function makeLetString(node, numOfDummies){
    let str = 'operation: ';
    str+='#'+node.index+1-numOfDummies;
    let arr = node.array;
    for(let i=0; i<arr.length; i++){
        str += arr[i]+ '\n';
    }
    return str;
}

function makeEdgesString(){
    let str ='';
    for(let i=0; i<edges.length; i++){
        let from = edges[i].from;
        let to = edges[i].to;
        if(to === undefined);
        else if()
    }
}