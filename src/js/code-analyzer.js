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
let dummyNumber;
let dummiesToRet;
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
    dummyNumber=0;
    dummiesToRet=[];
    let program =  esprima.parseScript(codeToParse);
    let c = evalProgram(code, argsVals, env);
    parseColors(c);
    parseGlobals(program);
    let str =makeNodesString();
    str+='\n';
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
            if (nodes.length === 0 || nodes[nodes.length - 1].type !== 'LetAssExp') {
                let node = {type: 'LetAssExp', array: [escodegen.generate(program.body[i])], index: nodeIndex, color: true, name:'node'+(nodeIndex+1-dummyNumber), number:nodeIndex+1-dummyNumber};
                nodes.push(node);
                nodeIndex++;
                addEdge(node);
            }
            // else
            //     nodes[nodes.length - 1].array.push(escodegen.generate(program.body[i]));
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
        let node= {type: 'LetAssExp', array: [escodegen.generate(program)], index: nodeIndex, color: color, name:'node'+(nodeIndex+1-dummyNumber), number:(nodeIndex+1-dummyNumber)};
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
    let nullNode = {type: 'NullNode', index: nodeIndex, color:color, name:'node'+(nodeIndex+1-dummyNumber) , number:(nodeIndex+1-dummyNumber)};
    addEdge(nullNode);
    nodes.push(nullNode);
    nodeIndex++;
    let test = program.test;
    let test1 =  escodegen.generate(test);
    let whileNode = {type: 'WhileNode', test: test1, index: nodeIndex, color: color, name:'node'+(nodeIndex+1-dummyNumber), number:(nodeIndex+1-dummyNumber)};
    nodes.push(whileNode);
    nodeIndex++;
    addEdge(whileNode);
    updateLastEdgeToConsq();
    parseBlockStatement(program.body, color&& whileColor);
    if(nodes[nodes.length-1].type ==='DummyNode')
        dummiesToRet.push({from:nodes[nodes.length-1], to:undefined, isConsq:false});
    edges[edges.length - 1].to = nullNode;
    edges.push({from: whileNode, to: undefined, isConsq:false});
}
function parseIfExp(program, color) {
    ifCounter =1;
    let ifColor = colors[condIndex];
    condIndex++;
    let ifNode = addIfNode(program, color);
    updateLastEdgeToConsq();
    parseBlockStatement(program.consequent, ifColor && color);
    let lastNodeConsIndex = edges.length-1;
    if(program.alternate!=null) {
        edges.push({from:ifNode, to: undefined, color:color&!ifColor});
        checkAlt(program, ifNode, color, ifColor, lastNodeConsIndex, edges.length-1);
    }
}
function checkAlt(program, ifNode, color, ifColor, lastNodeConsIndex, ifEdge) {
    ifCounter++;
    if (program.alternate.type !== 'BlockStatement'){
        if (program.alternate.type !== 'IfStatement')
            return callElseFunc(program, color, ifColor, ifEdge);
    }
    checkAltCont(program, ifNode, color, ifColor, lastNodeConsIndex, ifEdge);

}
function checkAltCont(program, ifNode, color, ifColor, lastNodeConsIndex, ifEdge){
    if(program.alternate.type==='BlockStatement')
        if(program.alternate.body.type !== 'IfStatement') {
            return callElseFunc(program,color,ifColor, ifEdge);
        }

    return parseElseIfExp(program.alternate, color && !ifColor, ifEdge);

}
function callElseFunc(program, color, ifColor, ifEdge){
    parseElseExp(program.alternate, color && !ifColor, ifEdge);
    // edges[lastNodeConsIndex ].to = undefined;
    connectToDummy();
}
function parseElseExp(program, color, ifEdge){
    let index = nodeIndex;
    if(checkElseBlock(program))
    {let node = {type: 'LetAssExp', array: [escodegen.generate(program.body[0])], index: nodeIndex, color: color, name:'node'+(nodeIndex+1-dummyNumber),  number:(nodeIndex+1-dummyNumber)};
        nodes.push(node);
        nodeIndex++;  edges.push({from: node, to: undefined, isConsq: false});
        //let rest = program.body.slice(1);
    //     if(rest.length>0)
    //         parseBlockStatement(rest, color);
    }
    else if(program.type === 'VariableDeclaration' || program.type ==='ExpressionStatement'){
        let node = {type: 'LetAssExp', array: [escodegen.generate(program)], index: nodeIndex, color: color, name:'node'+(nodeIndex+1-dummyNumber), number:(nodeIndex+1-dummyNumber)};
        nodes.push(node);          edges.push({from:node, to: undefined, isConsq:false});
        nodeIndex++;
    }
    else{
        parseBlockStatement(program,color);
    }
    let n = nodes[index];      let e = edges[ifEdge];      e.to =n;
}
function checkElseBlock(program){
    if(program.type === 'BlockStatement') {
        if (program.body[0].type === 'VariableDeclaration')
            return true;
    }
    // else if(program.type ==='BlockStatement')
    //     if(program.body[0].type ==='ExpressionStatement')
    //         return true;
    return false;
}
function connectToDummy(){
    let dummyNode = {type: 'DummyNode', index: nodeIndex, dummyNum: dummyNumber, name:'dummy'+dummyNumber, color:true};
    dummyNumber++;
    for(let i=0; i<edges.length && ifCounter>0; i++){
        if(edges[edges.length-1-i].to=== undefined) {
            edges[edges.length-1-i].to = dummyNode;
            ifCounter--;
        }
    }
    nodes.push(dummyNode);
    edges.push({from:dummyNode, to: undefined, isConsq: false});
    nodeIndex++;
}
function updateLastEdgeToConsq(){
    let e = edges[edges.length-1];
    e.isConsq=true;
}
function parseElseIfExp(program, color, ifEdge){
    let ifColor = colors[condIndex];      condIndex++;
    let ifNode= addElseIfNode(program, ifEdge, color);      addEdge(ifNode);
    updateLastEdgeToConsq();
    parseBlockStatement(program.consequent,color& ifColor);
    let lastNodeConsIndex = edges.length -1;
    if (program.alternate !== null) {
        ifCounter++;
        let typeAlt = program.alternate.type;
        edges.push({from:ifNode, to: undefined, color:color&!ifColor});
        if (typeAlt === 'IfStatement')
            parseElseIfExp(program.alternate,edges.length-1, edges.length-1);
        else {
            // edges.push({from:ifNode, to: undefined, color:color&!ifColor});
            parseElseExp(program.alternate, color && !ifColor, edges.length-1);
            edges[lastNodeConsIndex].to = undefined;
            connectToDummy();
        }
    }
    else {
        connectToDummy();
    }
}
function addIfNode(program, color){
    let ifNode = {type: 'IfNode', test: escodegen.generate(program.test), index: nodeIndex, color: color, name:'node'+(nodeIndex+1-dummyNumber),  number:(nodeIndex+1-dummyNumber)};
    nodes.push(ifNode);
    nodeIndex++;
    addEdge(ifNode);
    return ifNode;
}
function addElseIfNode(program, ifEdge, color){
    let ifNode = {type: 'IfNode', test: escodegen.generate(program.test), index: nodeIndex, color: color, name:'node'+(nodeIndex+1-dummyNumber), number:(nodeIndex+1-dummyNumber)};
    nodes.push(ifNode);
    let e =edges[ifEdge];
    e.to=ifNode;
    nodeIndex++;
    return ifNode;
}
function addEdge(node){
    if (edges.length!==0) {
        let e = edges[edges.length - 1];
        e.to=node;
    }
    edges.push({from: node, to: undefined, isConsq: false});
}

function parseBlockStatement(program, color){
    if (program.type !== 'BlockStatement')
        parseBody([program], color);
    else {
        parseBody(program.body, color);
    }
}

function parseReturnStatement(program){
    let returnNode = {type: 'ReturnNode',value: 'return '+ escodegen.generate(program.argument), index: nodeIndex, color: true, name:'node'+(nodeIndex+1-dummyNumber), number:(nodeIndex+1-dummyNumber)};
    nodes.push(returnNode);
    nodeIndex++;
    addEdge(returnNode);
    edges.pop();
    for(let i=0; i<dummiesToRet.length; i++){
        let e= dummiesToRet[i];
        e.to=returnNode;
        edges.push(e);
    }

}

function makeNodesString(){
    let str ='';
    for(let i=0; i<nodes.length; i++){
        if(isOperation(nodes[i])) {
            str += DealWithOperation(nodes[i]);
        }
        else if (isCondition(nodes[i])) {
            str += DealWithCondition(nodes[i]);
        }
        else if(nodes[i].type==='DummyNode') {
            str += nodes[i].name+'=>operation: \n';
            str+= checkColor(nodes[i]);
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
function DealWithCondition(node) {
    let str = node.name+ '=>condition: ';
    str+= '#'+node.number+'\n'+ node.test;
    str+= checkColor(node);
    return str;
}

/**
 * @return {string}
 */
function DealWithOperation(node){
    let str ='';
    if (node.type ==='NullNode') {
        str += node.name+'=>operation: ' +'#'+node.number+'\n'+'null';

    }
    else if(node.type ==='ReturnNode')
    {
        str+=node.name+'=>operation: ' +'#'+node.number+'\n'+node.value;

    }
    else
        return makeLetString(node);
    str += checkColor(node);
    return str;
}

function checkColor(node){
    if(node.color)
        return ' |approved\n';
    else
        return ' |rejected\n';
}

function makeLetString(node){
    let str = node.name+ '=>operation: ' +'#'+node.number+'\n';
    let arr = node.array;
    for(let i=0; i<arr.length-1; i++){
        str += arr[i]+ '\n';
    }
    str+= arr[arr.length-1];
    str+= checkColor(node);
    return str;
}

function makeEdgesString(){
    let s ='';
    for(let i=0; i<edges.length; i++){
        s+=singleEdgeHandler(edges[i]);
    }
    return s;
}
function singleEdgeHandler(edge){
    let s='';
    let from=edge.from;
    let to= edge.to;
    if(to===undefined)
        return;
    if(isConsq(edge))
        s+=from.name+ '(yes)->' + to.name +'\n';
    else if(isAlt(edge))
        s+=from.name+ '(no)->' + to.name +'\n';
    else
        s+=from.name+ '->' + to.name +'\n';
    return s;
}

function isConsq(edge){
    let fromNode = edge.from;
    if( fromNode.type === 'IfNode' || fromNode.type === 'WhileNode') {
        if (edge.isConsq)
            return true;

    }
    return false;
}

function isAlt(edge){
    let fromNode = edge.from;
    if( fromNode.type === 'IfNode' || fromNode.type === 'WhileNode') {
        if (!edge.isConsq)
            return true;
    }
    return false;
}