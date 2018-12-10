import $ from 'jquery';
import {parseCode , parseProgram} from './code-analyzer';
import * as esprima from 'esprima';


if(typeof document !== 'undefined')
    $(document).ready(function () {
        $('#codeSubmissionButton').click(() => {
            let codeToParse = $('#codePlaceholder').val();
            let argValue= $('#argsValues').val();
            let env =[];
            let parsedCode = parseCode(codeToParse);
            let newParsedCode = parseProgram(parsedCode, esprima.parseScript(argValue),env);
            $('#parsedCode').val(JSON.stringify(newParsedCode, null, 2));

        });

    });


