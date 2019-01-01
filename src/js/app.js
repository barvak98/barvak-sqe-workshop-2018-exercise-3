import $ from 'jquery';
import {parseCode , parseProgram} from './code-analyzer';
import * as esprima from 'esprima';

 import flowchart from 'flowchart.js';

if(typeof document !== 'undefined')
    $(document).ready(function () {
        $('#codeSubmissionButton').click(() => {
            let codeToParse = $('#codePlaceholder').val();
            let argValue= $('#argsValues').val();
            let env =[];
            let parsedCode = parseCode(codeToParse);
            let diagramString = parseProgram(codeToParse,parsedCode, esprima.parseScript(argValue),env);
            console.log(diagramString);
            if(diagramString!== '') {
                let diagram = flowchart.parse(diagramString);
                let details = retDiagramDetails();
                diagram.drawSVG('diagram', details);
            }
            //$('#parsedCode').html(diagramString);

        });

    });

function retDiagramDetails (){
    return {'x': 0, 'y': 0, 'line-width': 3,
        'line-length': 50, 'text-margin': 10,
        'font-size': 14, 'font-color': 'black',
        'line-color': 'black', 'element-color': 'black',
        'fill': 'red', 'yes-text': 'T',
        'no-text': 'F', 'arrow-end': 'block',
        'scale': 1, 'symbols': {
            'start': {'font-color': 'black', 'element-color': 'red',
                'fill': 'white', 'font-size': 16, 'line-width': 4},
            'end': { 'class': 'end-element'}},
        'flowstate': {
            'approved': {'fill': 'green', 'font-size': 14},}};
}
