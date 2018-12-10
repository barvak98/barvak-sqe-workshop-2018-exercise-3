import $ from 'jquery';
import {parseCode , parseProgram} from './code-analyzer';


if(typeof document !== 'undefined')
    $(document).ready(function () {
        $('#codeSubmissionButton').click(() => {
            let codeToParse = $('#codePlaceholder').val();
            let env =[];
            let parsedCode = parseCode(codeToParse);
            let newParsedCode = parseProgram(parsedCode, env);
            $('#parsedCode').val(JSON.stringify(newParsedCode, null, 2));

        });

    });


