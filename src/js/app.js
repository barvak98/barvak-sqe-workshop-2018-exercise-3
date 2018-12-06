import $ from 'jquery';
import {parseCode, makeTable, makeDoubleArray, makeTableHTML } from './code-analyzer';


if(typeof document !== 'undefined')
    $(document).ready(function () {
        $('#codeSubmissionButton').click(() => {
            let codeToParse = $('#codePlaceholder').val();
            let parsedCode = parseCode(codeToParse);
            let array = makeTable(codeToParse);
            let doubleArray= makeDoubleArray (array);
            let table = makeTableHTML(doubleArray);
            $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
            //$('table').empty();
            $('table').append(table);

        });
    });


