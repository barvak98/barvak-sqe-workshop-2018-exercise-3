import $ from 'jquery';
import {parseCode , parseProgram} from './code-analyzer';
import * as esprima from 'esprima';
import * as escodegen from 'escodegen';


if(typeof document !== 'undefined')
    $(document).ready(function () {
        $('#codeSubmissionButton').click(() => {
            let codeToParse = $('#codePlaceholder').val();
            let argValue= $('#argsValues').val();
            let env =[];
            let parsedCode = parseCode(codeToParse);
            let newParsedCode = parseProgram(parsedCode, esprima.parseScript(argValue),env);
            let code= escodegen.generate(newParsedCode);
            //   code=<pre> +code+  </pre>
            $('#parsedCode').val(JSON.stringify(code, null, 2));

        });

    });


