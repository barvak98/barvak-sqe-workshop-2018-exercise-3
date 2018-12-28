import $ from 'jquery';
import {parseCode , parseProgram} from './code-analyzer';
import * as esprima from 'esprima';
const flowchart= require('flowchart.js');



if(typeof document !== 'undefined')
    $(document).ready(function () {
        $('#codeSubmissionButton').click(() => {
            let codeToParse = $('#codePlaceholder').val();
            let argValue= $('#argsValues').val();
            let env =[];
            let parsedCode = parseCode(codeToParse);
            let diagramString = parseProgram(codeToParse,parsedCode, esprima.parseScript(argValue),env);
            var diagram = flowchart.parse(diagramString);
            diagram.drawSVG('diagram');
            diagram.drawSVG('diagram', {'symbols': {'start': {'font-color': 'black', 'element-color': 'green', 'fill': 'yellow'}, 'end':{'class': 'end-element'}},
                'flowstate' : {             // even flowstate support
                    'past' : { 'fill' : '#59c4a4', 'font-size' : 12},
                    'approved' : { 'fill' : '#58C4A3', 'font-size' : 12, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' }
                }
            });
            $('#output').append(diagram);
        });

    });



