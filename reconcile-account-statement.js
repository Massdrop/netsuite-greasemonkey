// ==UserScript==
// @name         Reconcile Account Statement
// @require      https://cdn.jsdelivr.net/npm/lodash@4.17.5/lodash.min.js
// @require      https://momentjs.com/downloads/moment.min.js
// @namespace    https://system.na2.netsuite.com/
// @version      0.1
// @description  Enhancements to Reconcile Account Statement page
// @author       You
// @match        https://system.na2.netsuite.com/erp/bankrec/edit/bankrec.nl?whence=
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    function qs(data) {
        let ret = [];
        for (let d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        return ret.join('&');
    }

    // action
    let $a1 = jQuery('<a href="#">Copy Current Unmatched Page</a>').click(function(e) {
        e.preventDefault();
        let $grid = jQuery('.n-bankrec-imported-transactions-grid');
        let clip = [];

        let header = $grid.find('.n-w-datagrid__header-row').children().map(function() {
            return jQuery(this).text();
        }).toArray().slice(1).join('\t');
        clip.push(header);
        $grid.find('.n-w-datagrid__body-row').each(function() {
            let row = jQuery(this).children().map(function() {
                return jQuery(this).text();
            }).toArray().slice(1).join('\t');
            clip.push(row);
        });
        GM_setClipboard(clip.join('\n'), 'text');
    });

    // action
    let $a2 = jQuery('<a href="#">Copy Unmatched PayPal Statement Transactions</a>').click(function(e) {
        e.preventDefault();

        // get date bounds
        let start = moment(jQuery('div[data-view-id=start-date]').find("input[type=text]").val(),'MM/DD/YYYY').format('YYYY-MM-DD');
        let finish = moment(jQuery('div[data-view-id=end-date]').data('date')).format('YYYY-MM-DD');

        // retrieve data and copy to clipboard
        if(start && finish) {
            start = start.substr(0,10);
            finish = finish.substr(0,10);
            jQuery.get('/erp/resources/importedtransactions.nl?' + qs({
                accountId: 434,
                isMatched: 'F',
                start: start,
                finish: finish,
                sortBy: 'dDate',
                sortDirection: 'ASC',
                skip: 0,
                pageSize: 10000
            }), function(data) {
                console.log("done");
                const clip = [];
                const cols = ['date', 'transactionType', 'transactionNumber', 'payee', 'memo', 'amount'];
                clip.push(cols.join('\t'));
                _.forEach(data.resultSubset, (r) => {
                    clip.push([
                        r.date,
                        r.transactionType.displayName,
                        r.transactionNumber,
                        r.payee,
                        r.memo,
                        r.amount
                    ].join('\t'));
                });
                GM_setClipboard(clip.join('\n'), 'text');
            });
        } else {
            console.error("Could not detect start/end date.", start, end);
        }

    });

    let $actions = jQuery('<div class="n-widget" style="font-size:10px;"><span>Actions: </span></div>');
    $actions.append($a1);
    $actions.append('&nbsp;');
    $actions.append($a2);
    jQuery('#application').before($actions);

})();
